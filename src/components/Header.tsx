import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { CustomerUser, WebsiteSettings } from '../types';

interface HeaderProps {
  customer: CustomerUser | null;
  cartItemCount: number;
  unreadNotificationsCount: number;
  websiteSettings?: WebsiteSettings;
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onLogoutCustomer: () => void;
  onLogoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  customer,
  cartItemCount,
  unreadNotificationsCount,
  websiteSettings,
  onOpenCart,
  onOpenNotifications,
  onOpenProfile,
  onOpenAuth,
  onLogoutCustomer,
  onLogoClick,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const brandName = websiteSettings?.brandName || 'COFIX';
  const logoUrl = websiteSettings?.logoUrl;

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#E8E1D5] transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* KIRI: Logo & Brand Name */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2.5 text-left focus:outline-none group"
          title={`${brandName} Beranda`}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={brandName}
              className="w-9 h-9 rounded-xl object-cover shadow-sm group-hover:opacity-90 transition border border-stone-300"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-[#1C1917] flex items-center justify-center shadow-sm group-hover:bg-[#2D2622] transition">
              <svg
                className="w-5 h-5 text-[#C49A6C]"
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
            </div>
          )}
          <div>
            <span className="font-extrabold text-xl tracking-wider text-[#1C1917] leading-none block">
              {brandName}
            </span>
            <span className="text-[10px] font-medium tracking-widest text-[#8B5A2B] uppercase block">
              COFFEE
            </span>
          </div>
        </button>

        {/* KANAN: Nav items */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 1. Icon Keranjang */}
          <button
            onClick={onOpenCart}
            aria-label="Keranjang Belanja"
            className="relative p-2.5 rounded-full text-[#1C1917] hover:bg-[#EFE9DF] active:scale-95 transition"
            title="Keranjang Belanja"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-[#8B5A2B] text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-sm">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </button>

          {/* Icon lonceng & Profile (when logged in) */}
          {customer ? (
            <>
              {/* 2. Icon Lonceng */}
              <button
                onClick={onOpenNotifications}
                aria-label="Notifikasi & Riwayat"
                className="relative p-2.5 rounded-full text-[#1C1917] hover:bg-[#EFE9DF] active:scale-95 transition"
                title="Notifikasi & Riwayat Pesanan"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-sm">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* 3. Tombol Profile/Account */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-full bg-[#EFE9DF] hover:bg-[#E5DDD0] text-[#1C1917] text-xs font-semibold transition active:scale-95"
                >
                  <div className="w-6 h-6 rounded-full bg-[#1C1917] text-[#C49A6C] flex items-center justify-center font-bold text-xs">
                    {customer.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline-block max-w-[90px] truncate">
                    {customer.fullName.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-600" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-xl border border-stone-200 py-1.5 z-50 text-stone-800">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs text-stone-500 font-medium">Masuk sebagai</p>
                      <p className="text-sm font-bold text-stone-900 truncate">
                        {customer.fullName}
                      </p>
                      <p className="text-xs text-stone-500">{customer.phone}</p>
                    </div>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-stone-50 flex items-center gap-2 text-stone-700"
                    >
                      <User className="w-4 h-4 text-stone-500" />
                      Profil &amp; Riwayat
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onLogoutCustomer();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-red-50 text-red-600 flex items-center gap-2 border-t border-stone-100"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1C1917] hover:bg-stone-800 text-white text-xs font-semibold transition active:scale-95 shadow-sm"
            >
              <User className="w-3.5 h-3.5 text-[#C49A6C]" />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
