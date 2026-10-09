import React, { useState } from 'react';
import { authService } from '../services/authService';
import { CustomerUser } from '../types';
import { X, Smartphone, KeyRound, User, Loader2, ArrowRight } from 'lucide-react';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: CustomerUser) => void;
  pendingProductName?: string;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  pendingProductName,
}) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!phone || phone.trim().length < 9) {
      setErrorMsg('Masukkan nomor HP yang aktif dan valid.');
      return;
    }

    setLoading(true);
    const res = await authService.sendPhoneOtp(phone);
    setLoading(false);

    if (res.success) {
      setInfoMsg(res.message);
      setStep('otp');
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otp || otp.length < 4) {
      setErrorMsg('Masukkan kode OTP dengan lengkap.');
      return;
    }

    setLoading(true);
    const res = await authService.verifyPhoneOtp(phone, otp);
    setLoading(false);

    if (res.success) {
      if (res.requiresName) {
        setInfoMsg(res.message || 'Nomor WhatsApp berhasil diverifikasi! Silakan lengkapi nama Anda.');
        setStep('name');
      } else if (res.user) {
        onLoginSuccess(res.user);
        onClose();
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleCompleteName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama tidak boleh kosong.');
      return;
    }

    setLoading(true);
    const res = await authService.completeCustomerRegistration(phone, name.trim());
    setLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
      onClose();
    } else {
      setErrorMsg(res.message || 'Gagal menyimpan profil.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#1C1917] text-[#C49A6C] mx-auto flex items-center justify-center mb-3">
            <Smartphone className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-stone-900">
            {step === 'phone'
              ? 'Masuk ke COFIX'
              : step === 'otp'
              ? 'Verifikasi WhatsApp'
              : 'Lengkapi Nama'}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {step === 'otp' ? (
              <span>Cek pesan masuk WhatsApp pada nomor <strong>{phone}</strong></span>
            ) : pendingProductName ? (
              <span>
                Masuk untuk memasukkan <strong>{pendingProductName}</strong> ke keranjang.
              </span>
            ) : (
              'Gunakan nomor WhatsApp aktif kamu tanpa ribet password.'
            )}
          </p>
        </div>

        {/* Error message in clear Indonesian */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* Info message */}
        {infoMsg && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 text-amber-900 text-xs font-medium border border-amber-200">
            {infoMsg}
          </div>
        )}

        {/* Step 1: Input Phone */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Nomor Handphone (WhatsApp)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-3.5 pr-4 py-3 rounded-xl border border-stone-300 text-sm font-medium focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1.5">
                Nomor ini akan menjadi identitas pemesananmu di kedai.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#1C1917] hover:bg-stone-800 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#C49A6C]" />
              ) : (
                <>
                  <span>Kirim Kode OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Input OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Kode OTP 6 Digit
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Contoh: 123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center tracking-widest text-lg font-bold py-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20 font-mono"
                  autoFocus
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-[11px] text-stone-500 hover:text-stone-800"
                >
                  Ganti nomor ({phone})
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-[11px] text-[#8B5A2B] font-semibold hover:underline"
                >
                  Kirim Ulang
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#1C1917] hover:bg-stone-800 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#C49A6C]" />
              ) : (
                <span>Verifikasi &amp; Lanjutkan</span>
              )}
            </button>
          </form>
        )}

        {/* Step 3: Input Name for new customer */}
        {step === 'name' && (
          <form onSubmit={handleCompleteName} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                placeholder="Contoh: John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-stone-300 text-sm font-medium focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                autoFocus
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Nama ini akan dipanggil oleh barista saat pesananmu selesai.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#1C1917] hover:bg-stone-800 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#C49A6C]" />
              ) : (
                <span>Simpan &amp; Masuk</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
