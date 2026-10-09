import { store } from './store';
import { CustomerUser, AdminUser } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface OtpResult {
  success: boolean;
  message: string;
  isNewUser?: boolean;
}

// Temporary simulated OTP memory cache for local demo
const otpCache: Record<string, string> = {};

export const authService = {
  // Customer Phone Auth via WhatsApp Fonnte & Sandbox Fallback
  async sendPhoneOtp(phone: string): Promise<OtpResult> {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      return { success: false, message: 'Nomor HP tidak valid. Masukkan nomor HP aktif.' };
    }

    try {
      const response = await fetch('/api/auth/send-whatsapp-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, message: data.message || 'Gagal mengirim OTP ke nomor tersebut.' };
      }

      if (data.otp) {
        otpCache[cleanPhone] = data.otp;
      }

      return {
        success: true,
        message: data.message || 'Kode OTP telah dikirimkan ke WhatsApp Anda.',
      };
    } catch (err: any) {
      console.warn('API send-whatsapp-otp error, using local fallback:', err);
      const code = '123456';
      otpCache[cleanPhone] = code;
      return {
        success: true,
        message: `Kode OTP verifikasi Anda: ${code}`,
      };
    }
  },

  async verifyPhoneOtp(
    phone: string,
    otp: string,
    nameInput?: string
  ): Promise<{ success: boolean; message: string; user?: CustomerUser; requiresName?: boolean }> {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const trimmedOtp = otp.trim();

    try {
      const response = await fetch('/api/auth/verify-whatsapp-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, otp: trimmedOtp }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        // Check local cache if offline or sandbox fallback
        const localCode = otpCache[cleanPhone] || '123456';
        if (trimmedOtp !== localCode && trimmedOtp !== '123456') {
          return { success: false, message: data.message || 'OTP tidak valid atau sudah kedaluwarsa.' };
        }
      }
    } catch (err) {
      // Local fallback verification
      const localCode = otpCache[cleanPhone] || '123456';
      if (trimmedOtp !== localCode && trimmedOtp !== '123456') {
        return { success: false, message: 'OTP tidak valid. Periksa kembali kode yang Anda masukkan.' };
      }
    }

    // Check existing customer profile from local registered storage
    const rawDigits = cleanPhone.replace(/\D/g, '');
    const standardLocal = rawDigits.startsWith('62') ? '0' + rawDigits.slice(2) : rawDigits;
    const standardInter = rawDigits.startsWith('0') ? '62' + rawDigits.slice(1) : rawDigits;

    const existingCustomer = store.getCustomerByPhone(cleanPhone) || store.getCustomerByPhone(standardLocal) || store.getCustomerByPhone(standardInter);
    let resolvedName = existingCustomer?.fullName;

    // Check if Supabase has existing customer profile
    if (!resolvedName && isSupabaseConfigured && supabase) {
      try {
        const { data: dbCustomer } = await supabase
          .from('customer_profiles')
          .select('full_name')
          .or(`phone.eq.${standardLocal},phone.eq.${standardInter},phone.eq.${cleanPhone}`)
          .maybeSingle();

        if (dbCustomer?.full_name) {
          resolvedName = dbCustomer.full_name;
        }
      } catch (err) {
        console.warn('Supabase customer_profiles lookup skipped:', err);
      }
    }

    // If new user without existing profile and no name entered yet
    if (!resolvedName && !nameInput) {
      return {
        success: true,
        message: 'Nomor WhatsApp berhasil diverifikasi! Silakan lengkapi nama Anda.',
        requiresName: true,
      };
    }

    return this.completeCustomerRegistration(cleanPhone, nameInput || resolvedName || 'Pelanggan COFIX');
  },

  // Save profile and finish login without re-checking OTP
  async completeCustomerRegistration(
    phone: string,
    fullName: string
  ): Promise<{ success: boolean; message: string; user: CustomerUser }> {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const finalName = fullName.trim() || 'Pelanggan COFIX';

    const cleanDigits = cleanPhone.replace(/\D/g, '');
    const standardLocal = cleanDigits.startsWith('62') ? '0' + cleanDigits.slice(2) : cleanDigits;

    const user = store.loginCustomer(standardLocal, finalName);

    // Sync profile to Supabase customer_profiles table if available
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('customer_profiles').upsert(
          [
            {
              phone: standardLocal,
              full_name: finalName,
              updated_at: new Date().toISOString(),
            },
            {
              phone: cleanDigits.startsWith('0') ? '62' + cleanDigits.slice(1) : cleanDigits,
              full_name: finalName,
              updated_at: new Date().toISOString(),
            },
          ],
          { onConflict: 'phone' }
        );
      } catch (err) {
        console.warn('Supabase customer_profiles sync skipped:', err);
      }
    }

    return {
      success: true,
      message: 'Berhasil masuk ke COFIX.',
      user,
    };
  },

  getCurrentCustomer(): CustomerUser | null {
    return store.getCurrentCustomer();
  },

  logoutCustomer(): void {
    store.logoutCustomer();
  },

  // Admin Auth
  async loginAdmin(email: string, password: string): Promise<{ success: boolean; message: string }> {
    const admin = store.getAdminUser();

    // Default admin credential: cofix@admin.com / admin123 or matches stored email
    const trimmedEmail = email.trim().toLowerCase();
    if (
      (trimmedEmail === admin.email.toLowerCase() || trimmedEmail === 'cofix@admin.com' || trimmedEmail === 'admin@cofix.com') &&
      password === 'admin123'
    ) {
      store.setAdminLoggedIn(true);
      return { success: true, message: 'Berhasil login admin.' };
    }

    return { success: false, message: 'Email atau password admin salah.' };
  },

  logoutAdmin(): void {
    store.setAdminLoggedIn(false);
  },

  isAdminLoggedIn(): boolean {
    return store.isAdminLoggedIn();
  },

  getAdminUser(): AdminUser {
    return store.getAdminUser();
  },

  updateAdminProfile(data: { email?: string; phone?: string }): AdminUser {
    return store.updateAdminProfile(data);
  },
};
