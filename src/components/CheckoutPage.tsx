import React, { useState } from 'react';
import { CustomerUser, CartItem } from '../types';
import { formatRupiah } from '../utils/currency';
import { siteConfig } from '../config/site';
import { ArrowLeft, CheckCircle2, ShieldCheck, MapPin, CreditCard, Store, Bike } from 'lucide-react';

interface CheckoutPageProps {
  customer: CustomerUser;
  cartItems: CartItem[];
  onBack: () => void;
  onProceedToPay: (selectedDelivery: string, selectedPayment: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  customer,
  cartItems,
  onBack,
  onProceedToPay,
}) => {
  // Method selections
  const [selectedPickup, setSelectedPickup] = useState<string>('Ambil langsung di tempat');
  const [selectedPayment, setSelectedPayment] = useState<string>('Midtrans');

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0
  );

  const canProceed = Boolean(selectedPickup && selectedPayment && cartItems.length > 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Beranda</span>
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-[#E8E1D5] shadow-sm overflow-hidden p-6 sm:p-8">
        {/* Title & Customer Name (Rule 24) */}
        <div className="border-b border-stone-100 pb-5">
          <span className="text-[11px] font-bold text-[#8B5A2B] uppercase tracking-wider">
            Konfirmasi Pemesanan
          </span>
          <h1 className="text-2xl font-extrabold text-stone-900 mt-0.5">
            Pesanan {customer.fullName}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Nomor WhatsApp: <span className="font-semibold text-stone-700">{customer.phone}</span>
          </p>
        </div>

        {/* List of items */}
        <div className="py-5 border-b border-stone-100 space-y-3">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Ringkasan Item
          </h3>
          <ul className="space-y-2 text-stone-800 text-sm">
            {cartItems.map((item) => (
              <li key={item.productId} className="flex justify-between items-center">
                <span className="font-medium">
                  • {item.productName} <span className="text-stone-400">× {item.quantity}</span>
                </span>
                <span className="font-bold text-stone-900">
                  {formatRupiah(item.productPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Total (Rule 24) */}
        <div className="py-5 border-b border-stone-100 flex items-center justify-between">
          <span className="text-base font-bold text-stone-700">Total:</span>
          <span className="text-2xl font-extrabold text-[#1C1917]">
            {formatRupiah(totalAmount)}
          </span>
        </div>

        {/* [PILIH METODE PENGAMBILAN] (Rule 24 & 25) */}
        <div className="py-6 border-b border-stone-100">
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Store className="w-4 h-4 text-[#8B5A2B]" />
            <span>PILIH METODE PENGAMBILAN</span>
          </h3>

          <div className="space-y-2.5">
            {/* 1. Ambil langsung di tempat (Aktif) */}
            <label
              onClick={() => setSelectedPickup('Ambil langsung di tempat')}
              className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition ${
                selectedPickup === 'Ambil langsung di tempat'
                  ? 'border-[#8B5A2B] bg-[#FBF9F5] shadow-xs'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <input
                type="radio"
                name="pickupMethod"
                value="Ambil langsung di tempat"
                checked={selectedPickup === 'Ambil langsung di tempat'}
                onChange={() => setSelectedPickup('Ambil langsung di tempat')}
                className="mt-1 accent-[#8B5A2B]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-stone-900">
                    Ambil langsung di tempat
                  </span>
                  <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    Aktif
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Ambil pesananmu di bar kedai COFIX: {siteConfig.alamatKedai.fullText}
                </p>
              </div>
            </label>

            {/* 2. Diantar (Coming Soon, Disabled) */}
            <div className="flex items-start gap-3.5 p-4 rounded-2xl border border-stone-200 bg-stone-50/70 opacity-60 cursor-not-allowed">
              <input
                type="radio"
                name="pickupMethod"
                disabled
                className="mt-1 cursor-not-allowed"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-stone-600 flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5" /> Diantar
                  </span>
                  <span className="text-[10px] font-bold bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  Layanan pengiriman kurir ke alamat sedang dipersiapkan.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* [PILIH METODE PEMBAYARAN] (Rule 24 & 26) */}
        <div className="py-6 border-b border-stone-100">
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-[#8B5A2B]" />
            <span>PILIH METODE PEMBAYARAN</span>
          </h3>

          <label
            onClick={() => setSelectedPayment('Midtrans')}
            className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition ${
              selectedPayment === 'Midtrans'
                ? 'border-[#8B5A2B] bg-[#FBF9F5] shadow-xs'
                : 'border-stone-200 hover:border-stone-300'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="Midtrans"
              checked={selectedPayment === 'Midtrans'}
              onChange={() => setSelectedPayment('Midtrans')}
              className="mt-1 accent-[#8B5A2B]"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-stone-900">
                  Pembayaran Digital Midtrans
                </span>
                <span className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                  Otomatis
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Mendukung QRIS (GoPay, OVO, Dana, ShopeePay), Transfer Bank (BCA, Mandiri, BRI, BNI), &amp; Kartu.
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-[#8B5A2B] font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Terverifikasi aman &amp; instan via Midtrans Gateway</span>
              </div>
            </div>
          </label>
        </div>

        {/* [Lanjut Bayar] Button (Rule 24: Only active when pickup & payment are selected) */}
        <div className="pt-6">
          <button
            disabled={!canProceed}
            onClick={() => {
              if (canProceed) {
                onProceedToPay(selectedPickup, selectedPayment);
              }
            }}
            className={`w-full py-4 rounded-2xl font-bold text-base text-center shadow-lg transition ${
              canProceed
                ? 'bg-[#1C1917] hover:bg-stone-800 active:scale-95 text-white'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed'
            }`}
          >
            Lanjut Bayar ({formatRupiah(totalAmount)})
          </button>
        </div>
      </div>
    </div>
  );
};
