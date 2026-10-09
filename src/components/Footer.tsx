import React from 'react';
import { siteConfig } from '../config/site';
import { WebsiteSettings } from '../types';
import { ShieldCheck, Coffee } from 'lucide-react';

interface FooterProps {
  websiteSettings?: WebsiteSettings;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ websiteSettings, onOpenAdmin }) => {
  const brandName = websiteSettings?.brandName || siteConfig.brandName;
  const heroTitle = websiteSettings?.heroTitle || siteConfig.tagline;

  return (
    <footer className="bg-[#1C1917] text-stone-300 py-12 px-4 border-t border-stone-800">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#C49A6C] text-[#1C1917] flex items-center justify-center font-bold text-xs">
              <Coffee className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-white text-lg tracking-wider">
              {brandName}
            </span>
          </div>
          <p className="text-xs text-stone-400 max-w-sm">
            &ldquo;{heroTitle}&rdquo; &bull; Jam operasional {siteConfig.jamOperasional.display}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-stone-400">
          <span>&copy; {new Date().getFullYear()} {brandName}. Hak cipta dilindungi.</span>
          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 text-stone-400 hover:text-[#C49A6C] transition py-1 px-2.5 rounded-lg border border-stone-800 hover:border-stone-700 text-[11px]"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Portal Admin</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
