import React, { useState } from 'react';
import { checkOperationalHours, setSimulatedHour, getSimulatedHour } from '../utils/operationalHours';
import { store } from '../services/store';
import { Clock, Wrench, ChevronUp, ChevronDown } from 'lucide-react';

export const DevTestingToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSimHour, setCurrentSimHour] = useState<number | null>(getSimulatedHour());

  const operationalSettings = store.getOperationalSettings();
  const operational = checkOperationalHours(operationalSettings);

  const handleSelectSim = (hour: number | null) => {
    setCurrentSimHour(hour);
    setSimulatedHour(hour);
  };

  return (
    <div className="fixed bottom-3 right-3 z-40">
      {isOpen ? (
        <div className="w-80 rounded-2xl bg-[#1C1917]/95 text-white p-4 shadow-2xl border border-stone-700 text-xs backdrop-blur-md animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800">
            <div className="flex items-center gap-1.5 font-bold text-[#C49A6C]">
              <Wrench className="w-3.5 h-3.5" />
              <span>Simulasi Uji Skenario Kedai</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-stone-400 hover:text-white"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[11px] text-stone-400">
                Waktu Kedai Saat Ini: <strong className="text-white">{operational.currentJakartaTime}</strong>
              </p>
              <p className="text-[11px] mt-0.5">
                Status:{' '}
                <span
                  className={`font-bold ${operational.isOpen ? 'text-green-400' : 'text-amber-400'}`}
                >
                  {operational.isOpen ? 'BUKA (07.00 - 21.00)' : 'TUTUP'}
                </span>
              </p>
            </div>

            <div>
              <p className="font-bold text-stone-300 text-[11px] mb-1.5">
                Uji Coba Jam Operasional (Skenario 6 &amp; 3):
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleSelectSim(null)}
                  className={`py-1.5 px-2 rounded-lg text-center transition font-medium ${
                    currentSimHour === null
                      ? 'bg-[#C49A6C] text-[#1C1917] font-bold'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                  }`}
                >
                  Waktu Nyata
                </button>
                <button
                  onClick={() => handleSelectSim(12)}
                  className={`py-1.5 px-2 rounded-lg text-center transition font-medium ${
                    currentSimHour === 12
                      ? 'bg-green-600 text-white font-bold'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                  }`}
                >
                  12.00 WIB (Buka)
                </button>
                <button
                  onClick={() => handleSelectSim(22)}
                  className={`py-1.5 px-2 rounded-lg text-center transition font-medium ${
                    currentSimHour === 22
                      ? 'bg-red-600 text-white font-bold'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                  }`}
                >
                  22.00 WIB (Tutup)
                </button>
              </div>
            </div>

            <p className="text-[10px] text-stone-400 pt-1 border-t border-stone-800">
              * Mode 22.00 WIB mengaktifkan tombol <em>&ldquo;Yah lagi tutup&rdquo;</em> (Skenario 6).
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 bg-[#1C1917]/90 hover:bg-[#1C1917] text-[#C49A6C] px-3 py-1.5 rounded-full text-xs font-bold border border-stone-700 shadow-lg backdrop-blur-xs transition"
          title="Buka panel simulasi jam operasional"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>WIB: {operational.currentJakartaTime}</span>
          <ChevronUp className="w-3 h-3 text-stone-400" />
        </button>
      )}
    </div>
  );
};
