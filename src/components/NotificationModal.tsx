import React from 'react';
import { CustomerNotification, Order } from '../types';
import { formatRupiah } from '../utils/currency';
import { X, Bell, Coffee, CheckCircle2, Clock } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: CustomerNotification[];
  orders: Order[];
  onMarkAllRead: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  orders,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-stone-200 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-stone-100 text-[#8B5A2B]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 leading-tight">
                Notifikasi &amp; Riwayat
              </h2>
              <p className="text-xs text-stone-500">
                Riwayat pesanan tersimpan secara permanen
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={onMarkAllRead}
                className="text-xs text-[#8B5A2B] hover:underline font-semibold"
              >
                Tandai Dibaca
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

        {/* Content Tabs / Feed */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* Notifications feed */}
          {notifications.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Pemberitahuan Terkini
              </h3>
              <div className="space-y-2.5">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-2xl border transition ${
                      notif.isRead
                        ? 'bg-stone-50 border-stone-200'
                        : 'bg-green-50/70 border-green-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-green-100 text-green-700 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-stone-900">{notif.title}</h4>
                        <p className="text-xs text-stone-600 mt-0.5">{notif.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders History (Rule 33) */}
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Daftar Pesanan Saya
            </h3>

            {orders.length === 0 ? (
              <div className="text-center py-8 text-stone-400">
                <Coffee className="w-8 h-8 mx-auto stroke-1 mb-2" />
                <p className="text-xs">Belum ada riwayat pesanan yang dilakukan.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3"
                  >
                    {/* Header info */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-extrabold text-sm text-stone-900">
                          Pesanan #{order.orderNumber}
                        </span>
                        <p className="text-[11px] text-stone-500">{order.paymentTime}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          order.status === 'selesai'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status === 'selesai' ? 'Selesai' : 'Proses'}
                      </span>
                    </div>

                    {/* Snapshot items */}
                    <ul className="text-xs text-stone-700 space-y-1 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>
                            {item.productName} <span className="text-stone-400">× {item.quantity}</span>
                          </span>
                          <span className="font-semibold text-stone-800">
                            {formatRupiah(item.subtotal)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Total & Delivery method */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="text-stone-500">
                        Delivery to: <strong className="text-stone-700">{order.deliveryMethod}</strong>
                      </span>
                      <span className="font-extrabold text-stone-900 text-sm">
                        Total: {formatRupiah(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
