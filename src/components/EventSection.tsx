import React, { useState } from 'react';
import { PromoEvent } from '../types';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface EventSectionProps {
  events: PromoEvent[];
}

export const EventSection: React.FC<EventSectionProps> = ({ events }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Requirement #14: If no events, section is NOT shown at all!
  if (!events || events.length === 0) {
    return null;
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-[#8B5A2B]" />
        <h2 className="text-lg font-bold text-stone-900 tracking-tight">Event &amp; Promosi</h2>
      </div>

      {events.length === 1 ? (
        // Single Event display
        <div className="overflow-hidden rounded-2xl bg-white border border-[#E8E1D5] shadow-sm flex flex-col md:flex-row max-h-[360px]">
          <div className="md:w-1/2 h-48 md:h-auto overflow-hidden bg-stone-100">
            <img
              src={events[0].imageUrl}
              alt="Promo COFIX"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:w-1/2 p-6 flex flex-col justify-center">
            <span className="text-[11px] font-bold text-[#8B5A2B] tracking-wider uppercase mb-1">
              Spesial Hari Ini
            </span>
            <p className="text-stone-800 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {events[0].description}
            </p>
          </div>
        </div>
      ) : (
        // Multi-event Carousel
        <div className="relative overflow-hidden rounded-2xl bg-white border border-[#E8E1D5] shadow-sm">
          <div className="flex flex-col md:flex-row min-h-[220px]">
            <div className="md:w-1/2 h-52 md:h-auto overflow-hidden bg-stone-100 relative">
              <img
                src={events[currentIndex].imageUrl}
                alt="Promo COFIX"
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            </div>
            <div className="md:w-1/2 p-6 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#8B5A2B] tracking-wider uppercase mb-1 block">
                  Event &amp; Promo ({currentIndex + 1}/{events.length})
                </span>
                <p className="text-stone-800 text-sm sm:text-base leading-relaxed mt-2 whitespace-pre-line">
                  {events[currentIndex].description}
                </p>
              </div>

              {/* Navigation controls */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-100">
                <div className="flex gap-1.5">
                  {events.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        currentIndex === idx ? 'w-6 bg-[#8B5A2B]' : 'w-2 bg-stone-300'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handlePrev}
                    aria-label="Previous"
                    className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next"
                    className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
