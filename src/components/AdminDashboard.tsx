import React, { useState, useEffect } from 'react';
import { Product, PromoEvent, Order, AdminUser, StoreOperationalSettings, StoreStatusMode, WebsiteSettings } from '../types';
import { store, DEFAULT_WEBSITE_SETTINGS } from '../services/store';
import { storageService } from '../services/storageService';
import { formatRupiah } from '../utils/currency';
import { checkOperationalHours } from '../utils/operationalHours';
import { siteConfig } from '../config/site';
import {
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  Edit2,
  Plus,
  X,
  Upload,
  Settings,
  LogOut,
  Phone,
  Mail,
  AlertTriangle,
  Store,
  Globe,
  Instagram,
  MapPin,
  ExternalLink,
  RotateCcw,
  Check,
  Sparkles,
  Image as ImageIcon,
  Copy,
  ChevronDown,
  ChevronUp,
  FileCode,
} from 'lucide-react';

// Script SQL migrasi untuk membuat tabel website_settings di Supabase
const WEBSITE_SETTINGS_SQL = `-- Salin dan jalankan seluruh script ini di Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.website_settings (
  id TEXT PRIMARY KEY DEFAULT 'main_settings',
  brand_name TEXT NOT NULL DEFAULT 'COFIX',
  logo_url TEXT,
  hero_title TEXT NOT NULL DEFAULT 'Ngopi nikmat, dompet selamat',
  hero_address TEXT NOT NULL DEFAULT 'Jl. Melati No. 42, Senopati, Kebayoran Baru, Jakarta Selatan 12190',
  instagram_name TEXT NOT NULL DEFAULT '@cofix.coffee',
  instagram_url TEXT NOT NULL DEFAULT 'https://instagram.com/cofix.coffee',
  tiktok_name TEXT NOT NULL DEFAULT '@cofix.coffee',
  tiktok_url TEXT NOT NULL DEFAULT 'https://tiktok.com/@cofix.coffee',
  google_maps_address TEXT NOT NULL DEFAULT 'Jl. Melati No. 42, Senopati, Kebayoran Baru, Jakarta Selatan 12190',
  google_maps_url TEXT NOT NULL DEFAULT 'https://maps.google.com/?q=COFIX+Coffee+Jakarta',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.website_settings (
  id, brand_name, hero_title, hero_address,
  instagram_name, instagram_url, tiktok_name, tiktok_url,
  google_maps_address, google_maps_url
)
VALUES (
  'main_settings', 'COFIX', 'Ngopi nikmat, dompet selamat',
  'Jl. Melati No. 42, Senopati, Kebayoran Baru, Jakarta Selatan 12190',
  '@cofix.coffee', 'https://instagram.com/cofix.coffee',
  '@cofix.coffee', 'https://tiktok.com/@cofix.coffee',
  'Jl. Melati No. 42, Senopati, Kebayoran Baru, Jakarta Selatan 12190',
  'https://maps.google.com/?q=COFIX+Coffee+Jakarta'
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read website_settings" ON public.website_settings;
CREATE POLICY "Public read website_settings" ON public.website_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow manage website_settings" ON public.website_settings;
CREATE POLICY "Allow manage website_settings" ON public.website_settings FOR ALL USING (true);

NOTIFY pgrst, 'reload schema';`;

interface AdminDashboardProps {
  adminUser: AdminUser;
  products: Product[];
  events: PromoEvent[];
  orders: Order[];
  operationalSettings: StoreOperationalSettings;
  websiteSettings?: WebsiteSettings;
  onLogout: () => void;
  onExitToCustomerView: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  products,
  events,
  orders,
  operationalSettings,
  websiteSettings,
  onLogout,
  onExitToCustomerView,
}) => {
  // Navigation tabs (Requirement 1: Operasional vs Requirement 2: Website)
  const [mainTab, setMainTab] = useState<'operasional' | 'website'>('operasional');

  // Modal states
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [previousProductImage, setPreviousProductImage] = useState<string | null>(null);

  const [editingEvent, setEditingEvent] = useState<Partial<PromoEvent> | null>(null);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [previousEventImage, setPreviousEventImage] = useState<string | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showDeleteAllOrdersConfirm, setShowDeleteAllOrdersConfirm] = useState(false);

  // Operational hours form states (Requirement 5, 6, 7)
  const [openTimeInput, setOpenTimeInput] = useState(operationalSettings.openTime || '07:00');
  const [closeTimeInput, setCloseTimeInput] = useState(operationalSettings.closeTime || '21:00');
  const [storeStatusInput, setStoreStatusInput] = useState<StoreStatusMode>(operationalSettings.storeStatus || 'auto');
  const [isSavingOp, setIsSavingOp] = useState(false);
  const [opMsg, setOpMsg] = useState('');

  // Website Settings form states (Requirement 2 & 3: Persistent Supabase Settings)
  const currentWebSettings = websiteSettings || store.getWebsiteSettings();
  const [brandNameInput, setBrandNameInput] = useState(currentWebSettings.brandName || 'COFIX');
  const [logoUrlInput, setLogoUrlInput] = useState(currentWebSettings.logoUrl || '');
  const [heroTitleInput, setHeroTitleInput] = useState(currentWebSettings.heroTitle || 'Ngopi nikmat, dompet selamat');
  const [heroAddressInput, setHeroAddressInput] = useState(currentWebSettings.heroAddress || siteConfig.alamatKedai.fullText);
  const [instagramNameInput, setInstagramNameInput] = useState(currentWebSettings.instagramName || '@cofix.coffee');
  const [instagramUrlInput, setInstagramUrlInput] = useState(currentWebSettings.instagramUrl || 'https://instagram.com/cofix.coffee');
  const [tiktokNameInput, setTiktokNameInput] = useState(currentWebSettings.tiktokName || '@cofix.coffee');
  const [tiktokUrlInput, setTiktokUrlInput] = useState(currentWebSettings.tiktokUrl || 'https://tiktok.com/@cofix.coffee');
  const [googleMapsAddressInput, setGoogleMapsAddressInput] = useState(currentWebSettings.googleMapsAddress || siteConfig.alamatKedai.fullText);
  const [googleMapsUrlInput, setGoogleMapsUrlInput] = useState(currentWebSettings.googleMapsUrl || 'https://maps.google.com/?q=COFIX+Coffee+Jakarta');

  const [previousLogoImage, setPreviousLogoImage] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState('');
  const [isSavingWebsite, setIsSavingWebsite] = useState(false);
  const [websiteMsg, setWebsiteMsg] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [showSqlMigrationGuide, setShowSqlMigrationGuide] = useState(false);
  const [showSqlCode, setShowSqlCode] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  const handleCopySql = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(WEBSITE_SETTINGS_SQL);
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 3000);
    }
  };

  // Sync inputs with props if updated externally
  useEffect(() => {
    setOpenTimeInput(operationalSettings.openTime || '07:00');
    setCloseTimeInput(operationalSettings.closeTime || '21:00');
    setStoreStatusInput(operationalSettings.storeStatus || 'auto');
  }, [operationalSettings]);

  useEffect(() => {
    if (websiteSettings) {
      setBrandNameInput(websiteSettings.brandName || 'COFIX');
      setLogoUrlInput(websiteSettings.logoUrl || '');
      setHeroTitleInput(websiteSettings.heroTitle || 'Ngopi nikmat, dompet selamat');
      setHeroAddressInput(websiteSettings.heroAddress || siteConfig.alamatKedai.fullText);
      setInstagramNameInput(websiteSettings.instagramName || '@cofix.coffee');
      setInstagramUrlInput(websiteSettings.instagramUrl || 'https://instagram.com/cofix.coffee');
      setTiktokNameInput(websiteSettings.tiktokName || '@cofix.coffee');
      setTiktokUrlInput(websiteSettings.tiktokUrl || 'https://tiktok.com/@cofix.coffee');
      setGoogleMapsAddressInput(websiteSettings.googleMapsAddress || siteConfig.alamatKedai.fullText);
      setGoogleMapsUrlInput(websiteSettings.googleMapsUrl || 'https://maps.google.com/?q=COFIX+Coffee+Jakarta');
    }
  }, [websiteSettings]);

  // Current operational status
  const currentStatus = checkOperationalHours(operationalSettings);

  // Settings form
  const [adminPhone, setAdminPhone] = useState(adminUser.phone);
  const [adminEmail, setAdminEmail] = useState(adminUser.email);
  const [settingsMsg, setSettingsMsg] = useState('');

  // Image upload errors & loading
  const [uploadError, setUploadError] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Filter orders (Rule 29: Oldest on top)
  const processOrders = orders
    .filter((o) => o.status === 'proses' && !o.archivedByAdmin)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const completedOrders = orders
    .filter((o) => o.status === 'selesai' && !o.archivedByAdmin)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // ================= Operational Hours Handlers =================
  const handleSaveOperationalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingOp(true);
    setOpMsg('');

    try {
      await store.saveOperationalSettings({
        openTime: openTimeInput,
        closeTime: closeTimeInput,
        storeStatus: storeStatusInput,
      });
      setOpMsg('Pengaturan jam operasional dan status kedai berhasil disimpan ke database!');
      setTimeout(() => setOpMsg(''), 5000);
    } catch (err: any) {
      setOpMsg('Gagal menyimpan pengaturan: ' + (err?.message || 'Terjadi kesalahan'));
    } finally {
      setIsSavingOp(false);
    }
  };

  // ================= Product Handlers =================
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.name || editingProduct.price === undefined) {
      alert('Nama produk dan harga wajib diisi.');
      return;
    }

    // If product image was replaced, safely delete previous image from Supabase Storage
    if (previousProductImage && editingProduct.imageUrl !== previousProductImage) {
      await storageService.deleteImage(previousProductImage, 'products');
    }

    await store.saveProduct(editingProduct);
    setEditingProduct(null);
    setIsNewProduct(false);
    setPreviousProductImage(null);
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const res = await storageService.uploadImage(file, 'products');
    setIsUploadingImage(false);

    if (!res.success) {
      setUploadError(res.message || 'Gagal mengunggah gambar produk.');
    } else if (res.url && editingProduct) {
      setEditingProduct({ ...editingProduct, imageUrl: res.url });
    }
  };

  const handleDeleteProduct = async (prod: Product) => {
    // Delete associated image from Supabase Storage if uploaded
    if (prod.imageUrl) {
      await storageService.deleteImage(prod.imageUrl, 'products');
    }
    await store.deleteProduct(prod.id);
  };

  // ================= Event Handlers =================
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    if (!editingEvent.description) {
      alert('Deskripsi event wajib diisi.');
      return;
    }

    // If event image was replaced, safely delete previous image from Supabase Storage
    if (previousEventImage && editingEvent.imageUrl !== previousEventImage) {
      await storageService.deleteImage(previousEventImage, 'events');
    }

    await store.saveEvent(editingEvent);
    setEditingEvent(null);
    setIsNewEvent(false);
    setPreviousEventImage(null);
  };

  const handleEventImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const res = await storageService.uploadImage(file, 'events');
    setIsUploadingImage(false);

    if (!res.success) {
      setUploadError(res.message || 'Gagal mengunggah gambar event.');
    } else if (res.url && editingEvent) {
      setEditingEvent({ ...editingEvent, imageUrl: res.url });
    }
  };

  const handleDeleteEvent = async (ev: PromoEvent) => {
    if (ev.imageUrl) {
      await storageService.deleteImage(ev.imageUrl, 'events');
    }
    await store.deleteEvent(ev.id);
  };

  // ================= Settings Handlers =================
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateAdminProfile({
      phone: adminPhone.trim(),
      email: adminEmail.trim(),
    });
    setSettingsMsg('Pengaturan admin berhasil disimpan. Nomor tujuan Fonnte telah diperbarui.');
    setTimeout(() => setSettingsMsg(''), 4000);
  };

  // ================= Website Settings Handlers (Requirement 2 & 3) =================
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    const res = await storageService.uploadImage(file, 'brand');
    setIsUploadingLogo(false);

    if (!res.success) {
      setLogoUploadError(res.message || 'Gagal mengunggah logo ke Supabase Storage.');
    } else if (res.url) {
      if (logoUrlInput && logoUrlInput !== res.url) {
        setPreviousLogoImage(logoUrlInput);
      }
      setLogoUrlInput(res.url);
    }
  };

  const handleRemoveLogo = () => {
    if (logoUrlInput) {
      setPreviousLogoImage(logoUrlInput);
    }
    setLogoUrlInput('');
  };

  const handleResetWebsiteDefaults = () => {
    if (window.confirm('Kembalikan semua pengaturan website ke nilai bawaan (default)?')) {
      setBrandNameInput(DEFAULT_WEBSITE_SETTINGS.brandName);
      setLogoUrlInput('');
      setHeroTitleInput(DEFAULT_WEBSITE_SETTINGS.heroTitle);
      setHeroAddressInput(DEFAULT_WEBSITE_SETTINGS.heroAddress);
      setInstagramNameInput(DEFAULT_WEBSITE_SETTINGS.instagramName);
      setInstagramUrlInput(DEFAULT_WEBSITE_SETTINGS.instagramUrl);
      setTiktokNameInput(DEFAULT_WEBSITE_SETTINGS.tiktokName);
      setTiktokUrlInput(DEFAULT_WEBSITE_SETTINGS.tiktokUrl);
      setGoogleMapsAddressInput(DEFAULT_WEBSITE_SETTINGS.googleMapsAddress);
      setGoogleMapsUrlInput(DEFAULT_WEBSITE_SETTINGS.googleMapsUrl);
    }
  };

  const handleSaveWebsiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWebsite(true);
    setWebsiteMsg(null);

    try {
      // If logo was replaced, delete previous image from Supabase Storage
      if (previousLogoImage && previousLogoImage !== logoUrlInput) {
        await storageService.deleteImage(previousLogoImage, 'brand');
      }

      await store.saveWebsiteSettings({
        brandName: brandNameInput.trim() || 'COFIX',
        logoUrl: logoUrlInput.trim(),
        heroTitle: heroTitleInput.trim() || 'Ngopi nikmat, dompet selamat',
        heroAddress: heroAddressInput.trim() || siteConfig.alamatKedai.fullText,
        instagramName: instagramNameInput.trim() || '@cofix.coffee',
        instagramUrl: instagramUrlInput.trim() || 'https://instagram.com/cofix.coffee',
        tiktokName: tiktokNameInput.trim() || '@cofix.coffee',
        tiktokUrl: tiktokUrlInput.trim() || 'https://tiktok.com/@cofix.coffee',
        googleMapsAddress: googleMapsAddressInput.trim() || siteConfig.alamatKedai.fullText,
        googleMapsUrl: googleMapsUrlInput.trim() || 'https://maps.google.com/?q=COFIX+Coffee+Jakarta',
      });

      setPreviousLogoImage(null);
      setShowSqlMigrationGuide(false);
      setWebsiteMsg({
        type: 'success',
        text: 'Pengaturan website berhasil disimpan secara persistent ke Supabase!',
      });
      setTimeout(() => setWebsiteMsg(null), 5000);
    } catch (err: any) {
      const isMissing =
        err?.isTableMissing ||
        err?.code === 'PGRST205' ||
        err?.message?.includes('website_settings') ||
        err?.message?.includes('schema cache') ||
        err?.message?.includes('does not exist');

      if (isMissing) {
        setShowSqlMigrationGuide(true);
        setWebsiteMsg({
          type: 'warning',
          text: "Pengaturan berhasil tersimpan di sistem lokal (browser). Namun tabel 'public.website_settings' belum ada di database Supabase Anda. Silakan jalankan script SQL migrasi di bawah agar data tersimpan permanen di cloud Supabase.",
        });
      } else {
        setWebsiteMsg({
          type: 'error',
          text: 'Gagal menyimpan pengaturan ke Supabase: ' + (err?.message || 'Terjadi kesalahan'),
        });
      }
    } finally {
      setIsSavingWebsite(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1C1917] pb-24">
      {/* Header (COFIX Admin | Logout) */}
      <header className="sticky top-0 z-30 bg-[#1C1917] text-white border-b border-stone-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-xl tracking-wider text-[#C49A6C]">
              {brandNameInput || 'COFIX'} Admin
            </span>
            <span className="text-xs text-stone-400 hidden sm:inline-block border-l border-stone-700 pl-3">
              Panel Manajemen Kedai
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition text-xs flex items-center gap-1.5"
              title="Pengaturan Akun & WhatsApp Admin"
            >
              <Settings className="w-4 h-4 text-[#C49A6C]" />
              <span className="hidden sm:inline">Pengaturan Akun</span>
            </button>

            <button
              onClick={onExitToCustomerView}
              className="text-xs text-stone-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-stone-700 hover:border-stone-600 transition"
            >
              Lihat Beranda
            </button>

            <span className="text-stone-600">|</span>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs: Operasional vs Website */}
        <div className="max-w-6xl mx-auto px-4 border-t border-stone-800/80">
          <div className="flex items-center gap-2 py-2.5">
            <button
              onClick={() => setMainTab('operasional')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide transition ${
                mainTab === 'operasional'
                  ? 'bg-[#C49A6C] text-[#1C1917] shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Operasional</span>
            </button>

            <button
              onClick={() => setMainTab('website')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide transition ${
                mainTab === 'website'
                  ? 'bg-[#C49A6C] text-[#1C1917] shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Website</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* ================= TAB 1: OPERASIONAL ================= */}
        {mainTab === 'operasional' && (
          <>
            {/* SECTION: Jam Operasional & Status Kedai */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E1D5] shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-stone-100 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-[#FBF9F5] border border-[#E8E1D5] text-[#8B5A2B]">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-stone-900 leading-tight">
                        Jam Operasional &amp; Status Kedai
                      </h2>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Waktu Jakarta (WIB): <strong className="text-stone-800">{currentStatus.currentJakartaTime}</strong> &bull; Jadwal: <span className="font-semibold text-stone-700">{operationalSettings.openTime} – {operationalSettings.closeTime} WIB</span>
                      </p>
                    </div>
                  </div>

                  {/* Status saat ini badge */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs ${
                        currentStatus.isOpen
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          currentStatus.isOpen ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'
                        }`}
                      />
                      {currentStatus.isOpen ? 'Status saat ini: BUKA' : 'Status saat ini: TUTUP'}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSaveOperationalSettings} className="space-y-5">
                  {/* Pilihan Status Kedai */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
                      Status Kedai
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                          storeStatusInput === 'auto'
                            ? 'border-[#8B5A2B] bg-[#FBF9F5] ring-2 ring-[#8B5A2B]/15 shadow-2xs'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="storeStatus"
                          value="auto"
                          checked={storeStatusInput === 'auto'}
                          onChange={() => setStoreStatusInput('auto')}
                          className="mt-1 accent-[#8B5A2B]"
                        />
                        <div>
                          <p className="text-xs font-bold text-stone-900">
                            ○ Otomatis berdasarkan jam
                          </p>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Sistem otomatis menentukan status buka/tutup berdasarkan jam buka dan tutup yang diatur.
                          </p>
                        </div>
                      </label>

                      <label
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                          storeStatusInput === 'temporary_closed'
                            ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/15 shadow-2xs'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="storeStatus"
                          value="temporary_closed"
                          checked={storeStatusInput === 'temporary_closed'}
                          onChange={() => setStoreStatusInput('temporary_closed')}
                          className="mt-1 accent-rose-600"
                        />
                        <div>
                          <p className="text-xs font-bold text-rose-950">
                            ○ Tutup sementara
                          </p>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Kedai langsung dianggap tutup sekarang, meskipun sedang dalam jam operasional (jadwal tetap tersimpan).
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Inputs Jam Buka & Jam Tutup */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Jam Buka (WIB)
                      </label>
                      <input
                        type="time"
                        required
                        value={openTimeInput}
                        onChange={(e) => setOpenTimeInput(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                      />
                      <p className="text-[10px] text-stone-400 mt-1">Default: 07:00 WIB</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Jam Tutup (WIB)
                      </label>
                      <input
                        type="time"
                        required
                        value={closeTimeInput}
                        onChange={(e) => setCloseTimeInput(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                      />
                      <p className="text-[10px] text-stone-400 mt-1">Default: 21:00 WIB</p>
                    </div>
                  </div>

                  {opMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                      {opMsg}
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingOp}
                      className="px-6 py-2.5 rounded-xl bg-[#1C1917] hover:bg-stone-800 active:scale-95 text-white text-xs font-bold transition shadow-sm"
                    >
                      {isSavingOp ? 'Menyimpan...' : 'Simpan Pengaturan Jam'}
                    </button>
                  </div>
                </form>
              </div>

            {/* Top Management Cards (CRUD Produk & CRUD Event) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CARD 1: CRUD Produk */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8E1D5] shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-stone-100 text-[#8B5A2B]">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <h2 className="text-base font-extrabold text-stone-900">CRUD Menu &amp; Produk</h2>
                            <p className="text-xs text-stone-500">
                              Total {products.length} menu terdaftar di katalog
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setIsNewProduct(true);
                            setPreviousProductImage(null);
                            setEditingProduct({
                              name: '',
                              description: '',
                              price: 12000,
                              stock: 20,
                              imageUrl:
                                'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
                            });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-white text-xs font-bold transition shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#C49A6C]" />
                          <span>Tambah Produk</span>
                        </button>
                      </div>

                      {/* Product List */}
                      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                        {products.map((prod) => (
                          <div
                            key={prod.id}
                            className="p-3 rounded-2xl border border-stone-200 bg-stone-50/70 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-stone-900 break-words whitespace-normal leading-tight">
                                  {prod.name}
                                </p>
                                <p className="text-[#8B5A2B] font-semibold mt-0.5">{formatRupiah(prod.price)}</p>
                                <p className="text-stone-500 text-[11px]">
                                  Stok: <strong className="text-stone-800">{prod.stock}</strong> &bull; Rev v{prod.version}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => {
                                  setIsNewProduct(false);
                                  setPreviousProductImage(prod.imageUrl);
                                  setEditingProduct(prod);
                                }}
                                className="p-2 rounded-xl bg-white border border-stone-200 hover:border-stone-400 text-stone-700 transition"
                                title="Edit Produk"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod)}
                                className="p-2 rounded-xl bg-white border border-stone-200 hover:border-red-300 text-stone-400 hover:text-red-600 transition"
                                title="Hapus Produk"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

              {/* CARD 2: CRUD Event */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8E1D5] shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-stone-100 text-[#8B5A2B]">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <h2 className="text-base font-extrabold text-stone-900">CRUD Event &amp; Promo</h2>
                            <p className="text-xs text-stone-500">
                              {events.length === 0
                                ? 'Tidak ada banner event (section di beranda disembunyikan)'
                                : `${events.length} event aktif (ditampilkan carousel)`}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setIsNewEvent(true);
                            setPreviousEventImage(null);
                            setEditingEvent({
                              description: '',
                              imageUrl:
                                'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop&q=80',
                            });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-white text-xs font-bold transition shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#C49A6C]" />
                          <span>Tambah Event</span>
                        </button>
                      </div>

                      {/* Event list */}
                      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                        {events.length === 0 ? (
                          <div className="py-12 text-center text-stone-400 text-xs">
                            Belum ada event promo aktif. Tambahkan event untuk memunculkan section di beranda.
                          </div>
                        ) : (
                          events.map((ev) => (
                            <div
                              key={ev.id}
                              className="p-3 rounded-2xl border border-stone-200 bg-stone-50/70 flex items-start justify-between gap-3 text-xs"
                            >
                              <img
                                src={ev.imageUrl}
                                alt="Promo Event"
                                className="w-16 h-14 rounded-xl object-cover shrink-0 border border-stone-200"
                              />
                              <p className="flex-1 text-stone-700 text-xs line-clamp-3 leading-relaxed">
                                {ev.description}
                              </p>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => {
                                    setIsNewEvent(false);
                                    setPreviousEventImage(ev.imageUrl);
                                    setEditingEvent(ev);
                                  }}
                                  className="p-2 rounded-xl bg-white border border-stone-200 hover:border-stone-400 text-stone-700 transition"
                                  title="Edit Event"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(ev)}
                                  className="p-2 rounded-xl bg-white border border-stone-200 hover:border-red-300 text-stone-400 hover:text-red-600 transition"
                                  title="Hapus Event"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
              </div>

            {/* SECTION: Pesanan (Proses & Selesai) */}
            <>
                {/* Pesanan Proses */}
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-300">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                      <h2 className="text-lg font-extrabold text-stone-900 tracking-tight">
                        Pesanan Proses ({processOrders.length})
                      </h2>
                    </div>
                    <span className="text-xs text-stone-500 font-medium">
                      Pesanan tertua berada paling atas
                    </span>
                  </div>

                  {processOrders.length === 0 ? (
                    <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center text-stone-400 text-xs">
                      Tidak ada pesanan yang sedang diproses. Pesanan yang berhasil dibayar akan muncul di sini secara otomatis.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {processOrders.map((order) => (
                        <div
                          key={order.id}
                          className="bg-white rounded-3xl p-5 border border-red-200 shadow-xs flex flex-col justify-between"
                        >
                          <div className="space-y-3 text-xs">
                            <div className="flex justify-between items-start pb-2 border-b border-stone-100">
                              <div>
                                <span className="font-extrabold text-sm text-stone-900">
                                  Pesanan: #{String(order.orderNumber).padStart(3, '0')}
                                </span>
                                <p className="text-stone-500 text-[11px] mt-0.5">
                                  Waktu: {order.paymentTime}
                                </p>
                              </div>
                              <span className="bg-red-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                                Proses
                              </span>
                            </div>

                            <div>
                              <p className="text-stone-600">
                                Nama: <strong className="text-stone-900">{order.customerName}</strong>
                              </p>
                              <p className="text-stone-600">
                                Nomor: <strong className="text-stone-900">{order.customerPhone}</strong>
                              </p>
                            </div>

                            <div>
                              <p className="font-bold text-stone-800 mb-1">Pesanan:</p>
                              <ul className="space-y-1 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                                {order.items.map((item, idx) => (
                                  <li key={idx} className="flex justify-between text-stone-700">
                                    <span className="break-words max-w-[70%]">• {item.productName} - {item.quantity}</span>
                                    <span className="font-semibold text-stone-900">
                                      {formatRupiah(item.subtotal)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <p className="text-stone-500">
                                Delivery to: <strong className="text-stone-800">{order.deliveryMethod}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 pt-3 border-t border-stone-100">
                            <button
                              onClick={() => store.markOrderComplete(order.id)}
                              className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Ubah Status ke Selesai</span>
                            </button>
                            <p className="text-[10px] text-stone-400 text-center mt-1.5">
                              Pelanggan akan menerima notifikasi popup &amp; status berubah hijau.
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pesanan Selesai */}
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-300">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-600" />
                      <h2 className="text-lg font-extrabold text-stone-900 tracking-tight">
                        Pesanan Selesai ({completedOrders.length})
                      </h2>
                    </div>

                    {completedOrders.length > 0 && (
                      <button
                        onClick={() => setShowDeleteAllOrdersConfirm(true)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 transition"
                      >
                        Hapus Semua Pesanan Selesai
                      </button>
                    )}
                  </div>

                  {showDeleteAllOrdersConfirm && (
                    <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                        <span className="text-xs text-red-900 font-medium">
                          Apakah Anda yakin ingin menghapus seluruh pesanan selesai dari dashboard admin? (Riwayat pesanan pelanggan tidak akan terhapus).
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setShowDeleteAllOrdersConfirm(false)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => {
                            store.archiveAllCompletedOrders();
                            setShowDeleteAllOrdersConfirm(false);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                        >
                          Ya, Hapus Semua
                        </button>
                      </div>
                    </div>
                  )}

                  {completedOrders.length === 0 ? (
                    <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center text-stone-400 text-xs">
                      Belum ada pesanan yang diselesaikan.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {completedOrders.map((order) => (
                        <div
                          key={order.id}
                          className="bg-white rounded-3xl p-5 border border-green-200 shadow-xs flex flex-col justify-between"
                        >
                          <div className="space-y-3 text-xs">
                            <div className="flex justify-between items-start pb-2 border-b border-stone-100">
                              <div>
                                <span className="font-extrabold text-sm text-stone-900">
                                  Pesanan: #{String(order.orderNumber).padStart(3, '0')}
                                </span>
                                <p className="text-stone-500 text-[11px] mt-0.5">
                                  Waktu: {order.paymentTime}
                                </p>
                              </div>
                              <span className="bg-green-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                                Selesai
                              </span>
                            </div>

                            <div>
                              <p className="text-stone-600">
                                Nama: <strong className="text-stone-900">{order.customerName}</strong>
                              </p>
                              <p className="text-stone-600">
                                Nomor: <strong className="text-stone-900">{order.customerPhone}</strong>
                              </p>
                            </div>

                            <div>
                              <p className="font-bold text-stone-800 mb-1">Pesanan:</p>
                              <ul className="space-y-1 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                                {order.items.map((item, idx) => (
                                  <li key={idx} className="flex justify-between text-stone-700">
                                    <span className="break-words max-w-[70%]">• {item.productName} - {item.quantity}</span>
                                    <span className="font-semibold text-stone-900">
                                      {formatRupiah(item.subtotal)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <p className="text-stone-500">
                                Delivery to: <strong className="text-stone-800">{order.deliveryMethod}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                            <span className="font-extrabold text-sm text-stone-900">
                              {formatRupiah(order.totalAmount)}
                            </span>
                            <button
                              onClick={() => store.archiveAdminOrder(order.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-stone-500 hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition"
                              title="Hapus dari dashboard admin"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
            </>
          </>
        )}

        {/* ================= TAB 2: WEBSITE SETTINGS ================= */}
        {mainTab === 'website' && (
          <div className="space-y-6">
            {/* Form Pengaturan Website */}
            <form onSubmit={handleSaveWebsiteSettings} className="space-y-6">
              {/* Notification Message */}
              {websiteMsg && (
                <div
                  className={`p-4 rounded-2xl text-xs font-bold border flex items-center justify-between shadow-2xs ${
                    websiteMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : websiteMsg.type === 'warning'
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {websiteMsg.type === 'success' ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className={`w-4 h-4 shrink-0 ${websiteMsg.type === 'warning' ? 'text-amber-600' : 'text-rose-600'}`} />
                    )}
                    <span>{websiteMsg.text}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWebsiteMsg(null)}
                    className="p-1 text-stone-500 hover:text-stone-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Petunjuk SQL Migrasi Supabase jika tabel website_settings belum ada */}
              {showSqlMigrationGuide && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4 text-stone-900">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-amber-950">
                          Tabel &lsquo;public.website_settings&rsquo; Belum Ada di Supabase
                        </h3>
                        <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                          Pengaturan Anda <strong>telah aktif dan tersimpan di browser ini</strong>. Agar pengaturan juga tersimpan secara permanen di cloud Supabase untuk seluruh pengunjung/pelanggan lain, jalankan 1 kali script SQL migrasi di Supabase Dashboard.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSqlMigrationGuide(false)}
                      className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
                      title="Tutup petunjuk"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Langkah-langkah jelas */}
                  <div className="bg-white/80 rounded-2xl p-4 border border-amber-200 text-xs space-y-2">
                    <p className="font-extrabold text-stone-900">Instruksi Cepat (1 Menit):</p>
                    <ol className="list-decimal list-inside space-y-1.5 text-stone-700">
                      <li>
                        Klik tombol <strong>&ldquo;Salin Script SQL Migrasi&rdquo;</strong> di bawah ini.
                      </li>
                      <li>
                        Buka Supabase Dashboard:{' '}
                        <a
                          href="https://supabase.com/dashboard"
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-[#8B5A2B] underline inline-flex items-center gap-1"
                        >
                          supabase.com/dashboard
                          <ExternalLink className="w-3 h-3 inline" />
                        </a>{' '}
                        lalu pilih database project Anda.
                      </li>
                      <li>
                        Pilih menu <strong>SQL Editor</strong> pada sidebar kiri Supabase.
                      </li>
                      <li>
                        Tempelkan (Paste) query SQL tersebut, kemudian klik tombol hijau <strong>&ldquo;Run&rdquo;</strong>.
                      </li>
                      <li>
                        Kembali ke halaman ini dan klik tombol <strong>&ldquo;Simpan Pengaturan Website&rdquo;</strong> di bawah. Selesai!
                      </li>
                    </ol>
                  </div>

                  {/* Tombol aksi salin & lihat query */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition ${
                        sqlCopied
                          ? 'bg-emerald-700 text-white'
                          : 'bg-[#1C1917] hover:bg-stone-800 text-white'
                      }`}
                    >
                      {sqlCopied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>✓ Script SQL Berhasil Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-[#C49A6C]" />
                          <span>Salin Script SQL Migrasi</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowSqlCode(!showSqlCode)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-semibold transition"
                    >
                      <FileCode className="w-4 h-4" />
                      <span>{showSqlCode ? 'Sembunyikan Kode SQL' : 'Lihat Kode SQL'}</span>
                      {showSqlCode ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Preview kode SQL yang dapat disalin langsung */}
                  {showSqlCode && (
                    <div className="relative mt-2">
                      <pre className="p-4 rounded-xl bg-[#1C1917] text-stone-200 text-[11px] font-mono overflow-x-auto max-h-56 border border-stone-800 leading-relaxed selection:bg-[#C49A6C] selection:text-black">
                        {WEBSITE_SETTINGS_SQL}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* A. BRAND (Logo & Nama Brand) */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E1D5] shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-[#FBF9F5] border border-[#E8E1D5] text-[#8B5A2B]">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-extrabold text-stone-900 leading-tight">
                          A. Pengaturan Brand Website
                        </h2>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Ubah logo dan nama brand yang tampil di navigasi header dan footer website.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Logo Upload & Preview */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Logo Website (Maks 2 MB)
                    </label>

                    {logoUploadError && (
                      <div className="mb-3 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                        {logoUploadError}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-[#FBF9F5] border border-stone-200">
                      <div className="w-20 h-20 rounded-2xl bg-[#1C1917] flex items-center justify-center overflow-hidden border border-stone-300 shrink-0 shadow-sm">
                        {logoUrlInput ? (
                          <img
                            src={logoUrlInput}
                            alt="Logo Website"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg
                            className="w-10 h-10 text-[#C49A6C]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                            <line x1="6" y1="2" x2="6" y2="4" />
                            <line x1="10" y1="2" x2="10" y2="4" />
                            <line x1="14" y1="2" x2="14" y2="4" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <label
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-white text-xs font-bold cursor-pointer transition shadow-xs ${
                              isUploadingLogo ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Upload className="w-3.5 h-3.5 text-[#C49A6C]" />
                            <span>{isUploadingLogo ? 'Mengunggah ke Supabase...' : 'Upload / Ganti Logo'}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              disabled={isUploadingLogo}
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>

                          {logoUrlInput && (
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              className="px-3 py-2 rounded-xl border border-stone-300 hover:border-red-300 text-stone-600 hover:text-red-600 text-xs font-semibold bg-white transition"
                            >
                              Hapus / Gunakan Ikon Default
                            </button>
                          )}
                        </div>

                        <p className="text-[11px] text-stone-500">
                          Format didukung: JPG, PNG, WebP (maks 2 MB). Gambar disimpan ke Supabase Storage (bucket: <code className="text-[#8B5A2B] font-semibold">product-images</code>).
                        </p>

                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                          <strong>PENTING:</strong> Logo website dan PWA/App Icon adalah dua hal yang berbeda. Pengaturan ini hanya memperbarui logo pada tampilan website, tanpa mengubah icon aplikasi/PWA.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nama Brand */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Nama Brand
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: COFIX"
                      value={brandNameInput}
                      onChange={(e) => setBrandNameInput(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                    />
                    <p className="text-[11px] text-stone-400 mt-1">
                      Nama teks yang ditampilkan di navigasi header, footer, dan seluruh halaman website. (Default: COFIX)
                    </p>

                    {/* Live Mini Preview */}
                    <div className="mt-3 p-3.5 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                        Preview Tampilan Header:
                      </span>
                      <div className="flex items-center gap-2 bg-[#FBF9F5] px-3.5 py-1.5 rounded-xl border border-[#E8E1D5]">
                        <div className="w-7 h-7 rounded-lg bg-[#1C1917] flex items-center justify-center overflow-hidden">
                          {logoUrlInput ? (
                            <img src={logoUrlInput} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-extrabold text-[#C49A6C]">☕</span>
                          )}
                        </div>
                        <div>
                          <span className="font-extrabold text-sm tracking-wider text-[#1C1917] leading-none block">
                            {brandNameInput || 'COFIX'}
                          </span>
                          <span className="text-[8px] font-medium tracking-widest text-[#8B5A2B] uppercase block">
                            COFFEE
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              {/* B. HERO (Judul Hero & Alamat Hero) */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E1D5] shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-[#FBF9F5] border border-[#E8E1D5] text-[#8B5A2B]">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-extrabold text-stone-900 leading-tight">
                          B. Pengaturan Hero Banner
                        </h2>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Ubah judul/tagline utama dan teks alamat kedai pada banner utama beranda.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Judul Hero (Tagline Utama)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Ngopi nikmat, dompet selamat"
                        value={heroTitleInput}
                        onChange={(e) => setHeroTitleInput(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold text-stone-900 focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                      />
                      <p className="text-[11px] text-stone-400 mt-1">Default: &ldquo;Ngopi nikmat, dompet selamat&rdquo;</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Alamat Hero (Lokasi Kedai pada Banner)
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Contoh: Jl. Contoh No. 123, Depok"
                        value={heroAddressInput}
                        onChange={(e) => setHeroAddressInput(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                      />
                      <p className="text-[11px] text-stone-400 mt-1">
                        Alamat teks yang tampil berdampingan dengan pin lokasi di bagian Hero.
                      </p>
                    </div>

                    {/* Live Hero Preview Card */}
                    <div className="pt-2">
                      <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                        Live Preview Banner Hero:
                      </label>
                      <div className="relative overflow-hidden rounded-2xl bg-[#1C1917] text-white p-6 sm:p-8 text-center border border-stone-800 shadow-inner">
                        <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 leading-tight">
                          &ldquo;{heroTitleInput || 'Ngopi nikmat, dompet selamat'}&rdquo;
                        </h3>
                        <div className="flex items-center justify-center gap-1.5 text-stone-300 text-xs font-normal">
                          <MapPin className="w-3.5 h-3.5 text-[#C49A6C] shrink-0" />
                          <span>{heroAddressInput || 'Jl. Contoh No. 123, Depok'}</span>
                        </div>
                        <div className="mt-4">
                          <span className="inline-block bg-[#C49A6C] text-[#1C1917] font-bold px-4 py-1.5 rounded-full text-xs opacity-90">
                            Lihat Menu &darr;
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              {/* C. KONTAK (Instagram, TikTok, Google Maps) */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E1D5] shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-[#FBF9F5] border border-[#E8E1D5] text-[#8B5A2B]">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-extrabold text-stone-900 leading-tight">
                          C. Pengaturan Kontak &amp; Media Sosial
                        </h2>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Ubah akun dan tautan Instagram, TikTok, serta alamat dan URL Google Maps. Nama dan URL dapat diedit secara terpisah.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Instagram Group */}
                    <div className="p-5 rounded-2xl bg-[#FBF9F5] border border-stone-200 space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                          <Instagram className="w-4 h-4" />
                        </div>
                        <span className="font-extrabold text-sm text-stone-900">Instagram</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Nama / Handle yang Ditampilkan
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: @cofix.coffee"
                          value={instagramNameInput}
                          onChange={(e) => setInstagramNameInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:border-[#8B5A2B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Link / URL Instagram
                        </label>
                        <input
                          type="url"
                          required
                          placeholder="Contoh: https://instagram.com/cofix.coffee"
                          value={instagramUrlInput}
                          onChange={(e) => setInstagramUrlInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#8B5A2B]"
                        />
                      </div>
                    </div>

                    {/* TikTok Group */}
                    <div className="p-5 rounded-2xl bg-[#FBF9F5] border border-stone-200 space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                        <div className="w-7 h-7 rounded-lg bg-[#1C1917] text-white flex items-center justify-center shrink-0">
                          <span className="font-extrabold text-xs">TT</span>
                        </div>
                        <span className="font-extrabold text-sm text-stone-900">TikTok</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Nama / Handle yang Ditampilkan
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: @cofix.coffee"
                          value={tiktokNameInput}
                          onChange={(e) => setTiktokNameInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:border-[#8B5A2B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Link / URL TikTok
                        </label>
                        <input
                          type="url"
                          required
                          placeholder="Contoh: https://tiktok.com/@cofix.coffee"
                          value={tiktokUrlInput}
                          onChange={(e) => setTiktokUrlInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#8B5A2B]"
                        />
                      </div>
                    </div>

                    {/* Google Maps Group (Full Width) */}
                    <div className="md:col-span-2 p-5 rounded-2xl bg-[#FBF9F5] border border-stone-200 space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                        <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="font-extrabold text-sm text-stone-900">Google Maps Lokasi Fisik</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                            Alamat / Teks yang Ditampilkan
                          </label>
                          <textarea
                            rows={2}
                            required
                            placeholder="Contoh: Jl. Melati No. 42, Senopati, Kebayoran Baru, Jakarta Selatan 12190"
                            value={googleMapsAddressInput}
                            onChange={(e) => setGoogleMapsAddressInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#8B5A2B]"
                          />
                          <p className="text-[10px] text-stone-400 mt-1">
                            Teks alamat fisik yang tampil di section peta dan footer.
                          </p>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                            Link Google Maps (Dibuka Saat Alamat Diklik)
                          </label>
                          <textarea
                            rows={2}
                            required
                            placeholder="Contoh: https://maps.google.com/?q=COFIX+Coffee+Jakarta"
                            value={googleMapsUrlInput}
                            onChange={(e) => setGoogleMapsUrlInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#8B5A2B]"
                          />
                          <p className="text-[10px] text-stone-400 mt-1">
                            Tautan eksternal yang akan dibuka saat pelanggan mengklik alamat kedai atau tombol &ldquo;Buka di Google Maps&rdquo;.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              {/* Actions bar for Website Settings */}
              <div className="bg-white rounded-3xl p-5 border border-[#E8E1D5] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleResetWebsiteDefaults}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 hover:border-stone-400 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                  <span>Pulihkan Nilai Bawaan (Default)</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSavingWebsite}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#1C1917] hover:bg-stone-800 active:scale-95 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 text-[#C49A6C]" />
                    <span>{isSavingWebsite ? 'Menyimpan ke Supabase...' : 'Simpan Pengaturan Website'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* ================= MODAL: Product CRUD (Rule 36 & Supabase Storage) ================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setEditingProduct(null);
                setUploadError('');
              }}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-stone-900 mb-1">
              {isNewProduct ? 'Tambah Produk Baru' : 'Edit Produk'}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Gambar akan disimpan langsung di Supabase Storage (bucket: <code className="text-[#8B5A2B]">product-images</code>).
            </p>

            {uploadError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 leading-relaxed">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Image Preview & Upload to product-images bucket */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Foto Produk (Maks 2 MB)
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={editingProduct.imageUrl || ''}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-stone-200 bg-stone-100"
                  />
                  <div className="flex-1">
                    <label className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold cursor-pointer transition ${
                      isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                    }`}>
                      <Upload className="w-3.5 h-3.5 text-[#8B5A2B]" />
                      <span>{isUploadingImage ? 'Mengupload ke Supabase...' : 'Pilih File Gambar'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={isUploadingImage}
                        onChange={handleProductImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-stone-400 mt-1">
                      Maksimal 2 MB (JPG, PNG, WebP) &bull; Bucket: product-images
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Brown Sugar Coffee Latte"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#8B5A2B]"
                />
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Harga (IDR)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="500"
                    value={editingProduct.price || 0}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#8B5A2B]"
                  />
                </div>

                {/* Stock Direct Number Input */}
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Stok (Cup)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingProduct.stock ?? 0}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#8B5A2B]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Komposisi &amp; Deskripsi
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Espresso double shot dengan susu segar..."
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#8B5A2B]"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setUploadError('');
                  }}
                  className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-700 font-bold hover:bg-stone-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploadingImage}
                  className="flex-1 py-3 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-white font-bold disabled:opacity-50"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: Event CRUD (Rule 37 & Supabase Storage) ================= */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setEditingEvent(null);
                setUploadError('');
              }}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-stone-900 mb-1">
              {isNewEvent ? 'Tambah Event Promo' : 'Edit Event Promo'}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Banner disimpan di Supabase Storage (bucket: <code className="text-[#8B5A2B]">event-images</code>).
            </p>

            {uploadError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 leading-relaxed">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Banner Event (Maks 2 MB)
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={editingEvent.imageUrl || ''}
                    alt="Preview"
                    className="w-20 h-14 rounded-xl object-cover border border-stone-200 bg-stone-100"
                  />
                  <div className="flex-1">
                    <label className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold cursor-pointer transition ${
                      isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                    }`}>
                      <Upload className="w-3.5 h-3.5 text-[#8B5A2B]" />
                      <span>{isUploadingImage ? 'Mengupload ke Supabase...' : 'Upload Banner'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={isUploadingImage}
                        onChange={handleEventImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-stone-400 mt-1">
                      Maksimal 2 MB &bull; Bucket: event-images
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Deskripsi / Syarat &amp; Ketentuan Promo
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan info promo, syarat dan ketentuan diskon, dll..."
                  value={editingEvent.description || ''}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#8B5A2B]"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingEvent(null);
                    setUploadError('');
                  }}
                  className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-700 font-bold hover:bg-stone-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploadingImage}
                  className="flex-1 py-3 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-white font-bold disabled:opacity-50"
                >
                  Simpan Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: Admin Profile Settings (Rule 41 & 42) ================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-stone-200">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Pengaturan Akun &amp; WhatsApp
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Nomor HP ini menjadi tujuan otomatis notifikasi pesanan masuk via Fonnte WhatsApp.
            </p>

            {settingsMsg && (
              <div className="mb-4 p-3 rounded-xl bg-green-50 text-green-800 text-xs font-semibold border border-green-200">
                {settingsMsg}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Nomor HP Admin (Tujuan WhatsApp Fonnte)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8B5A2B] absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 font-medium focus:outline-none focus:border-[#8B5A2B]"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Setiap ada pesanan yang lunas dibayar, Fonnte akan mengirim rincian ke nomor ini.
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Email Admin
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8B5A2B] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 font-medium focus:outline-none focus:border-[#8B5A2B]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-700 font-bold hover:bg-stone-50"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-white font-bold"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
