import React from 'react';
import { siteConfig } from '../config/site';
import { WebsiteSettings } from '../types';
import { MapPin, ArrowDown } from 'lucide-react';

interface HeroProps {
  websiteSettings?: WebsiteSettings;
  onScrollToMenu: () => void;
}

export const Hero: React.FC<HeroProps> = ({ websiteSettings, onScrollToMenu }) => {
  const heroTitle = websiteSettings?.heroTitle || siteConfig.tagline;
  const heroAddress = websiteSettings?.heroAddress || siteConfig.alamatKedai.fullText;

  return (
    <section className="relative overflow-hidden bg-[#1C1917] text-white py-16 sm:py-24 px-4">
      {/* Background Image with Dark Coffee Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1600&auto=format&fit=crop&q=80"
          alt="COFIX Coffee Bar Atmosphere"
          className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity filter blur-[0.5px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/70 to-[#1C1917]/90" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">
        {/* Tagline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          &ldquo;{heroTitle}&rdquo;
        </h1>

        {/* Alamat Kedai */}
        <div className="flex items-center justify-center gap-1.5 text-stone-300 text-xs sm:text-sm font-normal mb-8 max-w-lg mx-auto">
          <MapPin className="w-4 h-4 text-[#C49A6C] shrink-0" />
          <span>{heroAddress}</span>
        </div>

        {/* Button: "Lihat Menu" ONLY */}
        <button
          onClick={onScrollToMenu}
          className="inline-flex items-center gap-2 bg-[#C49A6C] hover:bg-[#B38758] active:scale-95 text-[#1C1917] font-bold px-7 py-3.5 rounded-full text-sm sm:text-base shadow-lg transition"
        >
          <span>Lihat Menu</span>
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
