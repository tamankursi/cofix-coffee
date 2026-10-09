import React from 'react';
import { CustomerNotification } from '../types';
import { CheckCircle2, Coffee } from 'lucide-react';

interface CustomerCompletedOrderPopupProps {
  notification: CustomerNotification | null;
  onClose: () => void;
}

export const CustomerCompletedOrderPopup: React.FC<CustomerCompletedOrderPopupProps> = ({
  notification,
  onClose,
}) => {
  if (!notification || notification.isClosed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-stone-200 text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 mx-auto flex items-center justify-center mb-4">
          <Coffee className="w-8 h-8" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-extrabold text-stone-900 leading-tight">
          Pesanan #{notification.orderNumber} Selesai
        </h3>

        {/* Message */}
        <p className="mt-2 text-sm text-stone-600 leading-relaxed">
          {notification.message}
        </p>

        {/* Tutup Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-[#1C1917] hover:bg-stone-800 active:scale-95 py-3.5 text-sm font-bold text-white shadow-lg transition"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
