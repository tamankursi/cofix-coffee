import React from 'react';
import { Product, StoreOperationalSettings } from '../types';
import { formatRupiah } from '../utils/currency';
import { getProductButtonState } from '../utils/operationalHours';
import { X, Minus, Plus } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  currentCartQty: number;
  operationalSettings?: StoreOperationalSettings | null;
  onClose: () => void;
  onUpdateCartQty: (product: Product, newQty: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currentCartQty,
  operationalSettings,
  onClose,
  onUpdateCartQty,
}) => {
  if (!product) return null;

  const btnState = getProductButtonState(product.stock, operationalSettings);
  const isAvailable = btnState.statusType === 'available';

  const handleDecrement = () => {
    const nextQty = Math.max(0, currentCartQty - 1);
    onUpdateCartQty(product, nextQty);
  };

  const handleIncrement = () => {
    // Check available stock
    if (product.stock <= 0) return;
    const nextQty = currentCartQty + 1;
    onUpdateCartQty(product, nextQty);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-white overflow-hidden shadow-2xl border border-stone-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Product Photo */}
        <div className="relative h-60 sm:h-72 w-full bg-stone-100 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4">
            <span className="text-white font-extrabold text-xl sm:text-2xl drop-shadow">
              {formatRupiah(product.price)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">{product.name}</h2>
              <span className="inline-block mt-1 text-[11px] font-semibold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full">
                Stok tersedia: {product.stock} cup
              </span>
            </div>
          </div>

          {/* Description / Ingredients */}
          <div className="mt-4 pt-4 border-t border-stone-100">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
              Komposisi &amp; Deskripsi
            </h4>
            <p className="text-sm text-stone-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Quantity Controls & Add to Cart (Requirement 18 & 5) */}
          <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col gap-3">
            {currentCartQty > 0 ? (
              <div className="flex items-center justify-between bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
                <span className="text-xs font-semibold text-stone-600 pl-2">
                  Jumlah di keranjang:
                </span>
                {/* Note Rule 5: NO animation on + / - counter */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDecrement}
                    aria-label="Kurangi"
                    className="w-9 h-9 rounded-xl bg-white border border-stone-300 text-stone-800 flex items-center justify-center hover:bg-stone-100 active:bg-stone-200"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-base text-stone-900 w-6 text-center select-none">
                    {currentCartQty}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={product.stock <= 0}
                    aria-label="Tambah"
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                      product.stock > 0
                        ? 'bg-[#1C1917] text-white border-[#1C1917] hover:bg-stone-800 active:bg-black'
                        : 'bg-stone-200 text-stone-400 border-stone-200 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : null}

            {/* Main Action Button */}
            {currentCartQty === 0 ? (
              <button
                disabled={!isAvailable}
                onClick={() => {
                  if (isAvailable) {
                    onUpdateCartQty(product, 1);
                  }
                }}
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-center transition ${
                  isAvailable
                    ? 'bg-[#1C1917] hover:bg-stone-800 active:scale-95 text-white shadow-md'
                    : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                }`}
              >
                {btnState.text}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-center bg-[#8B5A2B] hover:bg-[#724821] text-white transition active:scale-95 shadow-md"
              >
                Selesai &amp; Lihat Pesanan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
