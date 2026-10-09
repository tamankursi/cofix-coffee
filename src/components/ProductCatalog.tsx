import React from 'react';
import { Product, StoreOperationalSettings } from '../types';
import { formatRupiah } from '../utils/currency';
import { getProductButtonState } from '../utils/operationalHours';

interface ProductCatalogProps {
  products: Product[];
  operationalSettings?: StoreOperationalSettings | null;
  onSelectProduct: (product: Product) => void;
  onAddToCartDirectly: (product: Product, e: React.MouseEvent) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  operationalSettings,
  onSelectProduct,
  onAddToCartDirectly,
}) => {
  return (
    <section id="menu-section" className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-2 border-b border-[#E8E1D5]">
        <div>
          <span className="text-[11px] font-bold text-[#8B5A2B] tracking-widest uppercase">
            Signature Menu
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1C1917] tracking-tight">
            Pilihan Kopi &amp; Minuman
          </h2>
        </div>
        <p className="text-xs text-stone-500 mt-1 sm:mt-0">
          Harga tertera sudah termasuk pajak.
        </p>
      </div>

      {/* Grid: Mobile 2 kolom, Desktop 4 kolom (Rule 17) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 items-stretch">
        {products.map((product) => {
          const btnState = getProductButtonState(product.stock, operationalSettings);

          return (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="group cursor-pointer rounded-2xl bg-white border border-[#E8E1D5] overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between h-full"
            >
              {/* Product Photo */}
              <div className="relative aspect-square w-full overflow-hidden bg-stone-100 shrink-0">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-2 text-center">
                    <span className="text-xs font-bold text-white bg-red-600/90 px-2 py-1 rounded-md">
                      Habis
                    </span>
                  </div>
                )}
                {product.stock > 0 && product.stock <= 5 && (
                  <span className="absolute top-2 left-2 bg-amber-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    Sisa {product.stock}
                  </span>
                )}
              </div>

              {/* Product Info: Nama & Harga ONLY (Rule 16: No description in catalog card!) */}
              <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
                <div>
                  {/* Issue 1 Fix: Full product name wrapping without ellipsis on mobile, tablet & desktop */}
                  <h3 className="font-bold text-sm sm:text-base text-stone-900 group-hover:text-[#8B5A2B] transition break-words whitespace-normal leading-snug">
                    {product.name}
                  </h3>
                  <p className="font-semibold text-xs sm:text-sm text-[#8B5A2B] mt-1">
                    {formatRupiah(product.price)}
                  </p>
                </div>

                {/* 3 Button Conditions (Rule 19 & Jam Operasional) */}
                <div className="mt-3">
                  <button
                    disabled={btnState.disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!btnState.disabled) {
                        onAddToCartDirectly(product, e);
                      }
                    }}
                    className={`w-full py-2 px-2 rounded-xl text-[11px] sm:text-xs font-semibold text-center transition ${
                      btnState.statusType === 'available'
                        ? 'bg-[#1C1917] hover:bg-[#332A24] active:scale-95 text-white shadow-sm'
                        : btnState.statusType === 'out_of_stock'
                        ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                        : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    {btnState.text}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
