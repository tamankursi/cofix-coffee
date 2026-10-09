import React, { useState } from 'react';
import { CartItem } from '../types';
import { formatRupiah } from '../utils/currency';
import { X, QrCode, Smartphone, Building2, CreditCard, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';

interface MidtransPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  customerName: string;
  customerPhone: string;
  deliveryMethod: string;
  onPaymentSuccess: (details: { paymentMethod: string; transactionId: string }) => void;
}

export const MidtransPaymentModal: React.FC<MidtransPaymentModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  customerName,
  customerPhone,
  deliveryMethod,
  onPaymentSuccess,
}) => {
  const [selectedSubMethod, setSelectedSubMethod] = useState<'qris' | 'gopay' | 'va' | 'card'>('qris');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);

  const handleSimulateSuccess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const methodLabel =
        selectedSubMethod === 'qris'
          ? 'Midtrans QRIS'
          : selectedSubMethod === 'gopay'
          ? 'Midtrans GoPay'
          : selectedSubMethod === 'va'
          ? 'Midtrans Virtual Account'
          : 'Midtrans Kartu Kredit/Debit';

      onPaymentSuccess({
        paymentMethod: methodLabel,
        transactionId: `MTR-${Date.now()}`,
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        {/* Midtrans Header */}
        <div className="bg-[#1C1917] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-wider text-[#C49A6C]">MIDTRANS</span>
            <span className="text-xs text-stone-400 border-l border-stone-700 pl-2">
              Payment Gateway
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount */}
        <div className="p-5 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-medium">Total Tagihan COFIX</p>
            <p className="text-xl font-extrabold text-stone-900">{formatRupiah(totalAmount)}</p>
          </div>
          <div className="text-right text-xs text-stone-500">
            <p className="font-medium text-stone-700">{customerName}</p>
            <p>{customerPhone}</p>
          </div>
        </div>

        {/* Method Tabs */}
        <div className="p-5 space-y-4">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Pilih Jalur Pembayaran
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedSubMethod('qris')}
              className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition ${
                selectedSubMethod === 'qris'
                  ? 'border-[#8B5A2B] bg-[#FBF9F5] ring-2 ring-[#8B5A2B]/20'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <QrCode className="w-4 h-4 text-[#8B5A2B]" />
              <div>
                <p className="text-xs font-bold text-stone-900">QRIS</p>
                <p className="text-[10px] text-stone-500">Gopay, Shopee, OVO</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedSubMethod('gopay')}
              className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition ${
                selectedSubMethod === 'gopay'
                  ? 'border-[#8B5A2B] bg-[#FBF9F5] ring-2 ring-[#8B5A2B]/20'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <Smartphone className="w-4 h-4 text-[#8B5A2B]" />
              <div>
                <p className="text-xs font-bold text-stone-900">GoPay / e-Wallet</p>
                <p className="text-[10px] text-stone-500">Instan direct</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedSubMethod('va')}
              className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition ${
                selectedSubMethod === 'va'
                  ? 'border-[#8B5A2B] bg-[#FBF9F5] ring-2 ring-[#8B5A2B]/20'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#8B5A2B]" />
              <div>
                <p className="text-xs font-bold text-stone-900">Transfer Virtual</p>
                <p className="text-[10px] text-stone-500">BCA, Mandiri, BRI</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedSubMethod('card')}
              className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition ${
                selectedSubMethod === 'card'
                  ? 'border-[#8B5A2B] bg-[#FBF9F5] ring-2 ring-[#8B5A2B]/20'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <CreditCard className="w-4 h-4 text-[#8B5A2B]" />
              <div>
                <p className="text-xs font-bold text-stone-900">Kartu Kredit/Debit</p>
                <p className="text-[10px] text-stone-500">Visa / Mastercard</p>
              </div>
            </button>
          </div>

          {/* Sub-method view */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex flex-col items-center text-center">
            {selectedSubMethod === 'qris' && (
              <>
                <p className="text-xs font-semibold text-stone-700 mb-2">
                  Scan QRIS menggunakan aplikasi e-Wallet apa saja
                </p>
                {/* Simulated QR Code graphic */}
                <div className="w-40 h-40 bg-white p-2 rounded-xl border border-stone-300 shadow-xs flex items-center justify-center relative">
                  <div className="grid grid-cols-6 gap-1 w-full h-full p-1 opacity-80">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          (i % 2 === 0 || i % 5 === 0) ? 'bg-[#1C1917]' : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-white/95 px-2 py-1 rounded text-[11px] font-extrabold text-[#8B5A2B] shadow-xs">
                      QRIS COFIX
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 mt-2">
                  Mendukung GoPay, ShopeePay, OVO, Dana, LinkAja, BCA, Mandiri Mobile
                </p>
              </>
            )}

            {selectedSubMethod === 'gopay' && (
              <div className="py-4 text-center">
                <Smartphone className="w-10 h-10 text-[#8B5A2B] mx-auto mb-2" />
                <p className="text-xs font-bold text-stone-800">Direct Pay with GoPay</p>
                <p className="text-[11px] text-stone-500 mt-1">
                  Aplikasi Gojek akan memproses verifikasi transaksi otomatis.
                </p>
              </div>
            )}

            {selectedSubMethod === 'va' && (
              <div className="py-2 text-center w-full">
                <p className="text-xs text-stone-600 mb-2">Nomor Virtual Account BCA:</p>
                <div className="bg-white px-4 py-2.5 rounded-xl border border-stone-300 font-mono font-bold text-sm text-stone-900 tracking-wider">
                  8801 0858 9005 8978
                </div>
                <p className="text-[10px] text-stone-500 mt-2">
                  Verifikasi otomatis setelah transfer dalam 1 menit.
                </p>
              </div>
            )}

            {selectedSubMethod === 'card' && (
              <div className="py-3 text-center">
                <CreditCard className="w-9 h-9 text-[#8B5A2B] mx-auto mb-2" />
                <p className="text-xs font-bold text-stone-800">Pembayaran Kartu Online 3D Secure</p>
                <p className="text-[11px] text-stone-500 mt-1">
                  Midtrans mengenkripsi transaksi dengan sertifikasi PCI-DSS Level 1.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="p-5 border-t border-stone-100 bg-stone-50/50 space-y-2">
          <button
            disabled={isProcessing}
            onClick={handleSimulateSuccess}
            className="w-full py-3.5 rounded-2xl bg-[#1C1917] hover:bg-stone-800 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#C49A6C]" />
                <span>Memverifikasi Pembayaran...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Konfirmasi Pembayaran ({formatRupiah(totalAmount)})</span>
              </>
            )}
          </button>

          <button
            disabled={isProcessing}
            onClick={onClose}
            className="w-full py-2.5 text-xs text-stone-500 hover:text-stone-800 font-medium transition"
          >
            Batalkan Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
};
