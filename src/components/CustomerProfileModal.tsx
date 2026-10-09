import React from 'react';
import { CustomerUser, Order } from '../types';
import { formatRupiah } from '../utils/currency';
import { X, User, Phone, LogOut, Coffee } from 'lucide-react';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerUser;
  orders: Order[];
  onLogout: () => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  isOpen,
  onClose,
  customer,
  orders,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 bg-[#1C1917] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#8B5A2B] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {customer.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">{customer.fullName}</h2>
              <p className="text-xs text-stone-300 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-[#C49A6C]" />
                <span>{customer.phone}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Orders list */}
        <div className="p-6 overflow-y-auto flex-1">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
            Riwayat Transaksi Saya ({orders.length})
          </h3>

          {orders.length === 0 ? (
            <div className="text-center py-8 text-stone-400">
              <Coffee className="w-8 h-8 mx-auto stroke-1 mb-2" />
              <p className="text-xs">Belum ada riwayat pesanan.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-stone-900">Pesanan #{order.orderNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] ${
                        order.status === 'selesai'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.status === 'selesai' ? 'Selesai' : 'Proses'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">{order.paymentTime}</p>
                  <div className="text-stone-700">
                    {order.items.map((i) => `${i.productName} × ${i.quantity}`).join(', ')}
                  </div>
                  <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-stone-900">
                    <span>Total</span>
                    <span>{formatRupiah(order.totalAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </div>
    </div>
  );
};
