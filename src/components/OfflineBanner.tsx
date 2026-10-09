import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-3 rounded-xl bg-[#8B5A2B] px-4 py-3 text-xs font-medium text-white shadow-xl">
      <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-amber-200" />
      <span>Koneksi offline. Menampilkan data lokal kedai COFIX.</span>
    </div>
  );
};
