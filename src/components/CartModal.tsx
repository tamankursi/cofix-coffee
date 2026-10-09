import React, { useState } from 'react';
import { CartItem, StoreOperationalSettings } from '../types';
import { formatRupiah } from '../utils/currency';
import { checkOperationalHours } from '../utils/operationalHours';
import { X, Trash2, Minus, Plus, ShoppingBag, AlertTriangle } from 'lucide-react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  operationalSettings?: StoreOperationalSettings | null;
  onUpdateQty: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onGoToCheckout: () => void;
  invalidItemsWarning?: CartItem[];
  onDismissInvalidItems?: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  operationalSettings,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onGoToCheckout,
  invalidItemsWarning,
  onDismissInvalidItems,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const operational = checkOperationalHours(operationalSettings);
  const subtotal = cartItems.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (!operational.isOpen) {
      alert(operational.reason || 'Pemesanan hanya dapat dilakukan saat kedai sedang buka.');
      return;
    }
    if (cartItems.length === 0) return;
    onClose();
    onGoToCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-stone-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-stone-100 text-[#1C1917]">
              <ShoppingBag className="w-5 h-5 text-[#8B5A2B]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 leading-tight">Keranjang Kopi</h2>
              <p className="text-xs text-stone-500">
                {totalItemsCount > 0 ? `${totalItemsCount} item dipilih` : 'Belum ada item'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cartItems.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition"
              >
                Kosongkan
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Confirmation Dialog for Clearing All Items */}
        {showClearConfirm && (
          <div className="bg-red-50 p-4 border-b border-red-100 flex items-center justify-between gap-3">
            <span className="text-xs text-red-800 font-medium">
              Kosongkan seluruh isi keranjang? Stok akan dikembalikan.
            </span>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-white text-stone-700 border border-stone-200"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onClearCart();
                  setShowClearConfirm(false);
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-red-600 text-white hover:bg-red-700"
              >
                Ya, Kosongkan
              </button>
            </div>
          </div>
        )}

        {/* Rule 22: Version Invalidation Warning */}
        {invalidItemsWarning && invalidItemsWarning.length > 0 && (
          <div className="bg-amber-50 p-4 border-b border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed flex-1">
              <p className="font-bold">Pembaruan Menu Terdeteksi</p>
              <p className="mt-1">
                Admin baru saja memperbarui data produk berikut di katalog:{' '}
                <strong>{invalidItemsWarning.map((i) => i.productName).join(', ')}</strong>.
                Sesuai aturan kedai, silakan masukkan ulang menu dengan versi terbaru.
              </p>
              {onDismissInvalidItems && (
                <button
                  onClick={onDismissInvalidItems}
                  className="mt-2 font-bold text-amber-800 underline hover:text-amber-950"
                >
                  Perbarui Keranjang Sekarang
                </button>
              )}
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="p-5 overflow-y-auto flex-1 divide-y divide-stone-100">
          {cartItems.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                <ShoppingBag className="w-8 h-8 stroke-1" />
              </div>
              <p className="text-stone-700 font-semibold text-base">Keranjangmu masih kosong</p>
              <p className="text-stone-400 text-xs mt-1 max-w-xs">
                Yuk pilih kopi atau minuman favoritmu dari daftar menu di beranda.
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-5 py-2.5 rounded-full bg-[#1C1917] text-white text-xs font-bold hover:bg-stone-800 transition"
              >
                Pilih Menu
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.productId} className="py-3.5 flex items-center gap-3">
                {/* Photo */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                  <img
                    src={item.productImageUrl}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-stone-900 break-words whitespace-normal leading-tight">
                    {item.productName}
                  </h4>
                  <p className="text-xs text-[#8B5A2B] font-semibold mt-0.5">
                    {formatRupiah(item.productPrice)}
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Subtotal: {formatRupiah(item.productPrice * item.quantity)}
                  </p>
                </div>

                {/* Quantity Controls (Rule 5: No animation on + / -) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
                    aria-label="Kurangi"
                    className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center hover:bg-stone-200 active:bg-stone-300"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-sm text-stone-900 w-5 text-center select-none">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
                    aria-label="Tambah"
                    className="w-7 h-7 rounded-lg bg-[#1C1917] text-white flex items-center justify-center hover:bg-stone-800 active:bg-black"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Delete button (Rule 38: Single item delete without confirmation) */}
                <button
                  onClick={() => onRemoveItem(item.productId)}
                  className="p-2 text-stone-400 hover:text-red-600 transition"
                  title="Hapus dari keranjang"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        {cartItems.length > 0 && (
          <div className="p-5 bg-stone-50 border-t border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-stone-600 text-sm font-medium">Total Pembayaran:</span>
              <span className="text-xl font-extrabold text-stone-900">
                {formatRupiah(subtotal)}
              </span>
            </div>

            {!operational.isOpen && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mb-3 text-center">
                {operational.reason || 'Yah lagi tutup. Pemesanan dibuka kembali pada jam operasional.'}
              </p>
            )}

            <button
              disabled={!operational.isOpen}
              onClick={handleCheckout}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm text-center shadow-lg transition ${
                operational.isOpen
                  ? 'bg-[#1C1917] hover:bg-stone-800 active:scale-95 text-white'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
              }`}
            >
              Lanjut ke Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
