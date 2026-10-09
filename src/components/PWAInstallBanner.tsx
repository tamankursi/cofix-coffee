import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;

  if (isInstallable) {
    return (
      <div className="bg-[#1C1917] text-white px-4 py-2 text-xs flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-[#C49A6C]" />
          <span>Install COFIX di layar utama HP untuk pemesanan lebih cepat!</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={install}
            className="bg-[#C49A6C] hover:bg-[#B38758] text-[#1C1917] font-semibold px-3 py-1 rounded text-xs transition"
          >
            Install
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-stone-400 hover:text-white p-1"
            title="Tutup"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (isIOS) {
    return (
      <>
        <div className="bg-[#1C1917] text-white px-4 py-2 text-xs flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-[#C49A6C]" />
            <span>Pasang COFIX di iPhone kamu</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowIOSGuide(true)}
              className="bg-[#C49A6C] text-[#1C1917] font-semibold px-3 py-1 rounded text-xs"
            >
              Cara Install
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-stone-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-stone-900">
              <h3 className="text-base font-bold">Install COFIX di iOS / Safari</h3>
              <p className="mt-3 text-sm text-stone-600 leading-relaxed">
                1. Ketuk tombol <strong>Share / Bagikan</strong> (ikon kotak berpanah ke atas) di bagian bawah Safari.<br />
                2. Gulir ke bawah lalu pilih <strong>Add to Home Screen (Tambahkan ke Layar Utama)</strong>.<br />
                3. Ketuk <strong>Tambah</strong> di sudut kanan atas.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#1C1917] py-2.5 text-sm font-semibold text-white hover:bg-stone-800 transition"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
