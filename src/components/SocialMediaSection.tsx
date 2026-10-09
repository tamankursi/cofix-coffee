import React from 'react';
import { siteConfig } from '../config/site';
import { WebsiteSettings } from '../types';
import { Instagram, MapPin, ExternalLink } from 'lucide-react';

interface SocialMediaSectionProps {
  websiteSettings?: WebsiteSettings;
}

export const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({ websiteSettings }) => {
  const brandName = websiteSettings?.brandName || siteConfig.brandName;
  const instagramName = websiteSettings?.instagramName || siteConfig.socialMedia.instagram.handle;
  const instagramUrl = websiteSettings?.instagramUrl || siteConfig.socialMedia.instagram.url;
  const tiktokName = websiteSettings?.tiktokName || siteConfig.socialMedia.tiktok.handle;
  const tiktokUrl = websiteSettings?.tiktokUrl || siteConfig.socialMedia.tiktok.url;
  const googleMapsAddress = websiteSettings?.googleMapsAddress || siteConfig.alamatKedai.fullText;
  const googleMapsUrl = websiteSettings?.googleMapsUrl || siteConfig.socialMedia.googleMaps.url;

  return (
    <section className="bg-white border-t border-[#E8E1D5] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* KIRI: Dua Social Media (TikTok & Instagram) */}
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#8B5A2B] uppercase tracking-wider">
                Terhubung Dengan Kami
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight mt-0.5">
                Ikuti Media Sosial {brandName}
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-md">
                Dapatkan info promo kejutan, racikan kopi terbaru, dan keseruan komunitas setiap harinya.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {/* Instagram */}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-stone-200 hover:border-[#8B5A2B] bg-[#FBF9F5] hover:bg-stone-50 transition group flex-1"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Instagram className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-stone-500 font-medium">Instagram</p>
                  <p className="text-sm font-bold text-stone-900 group-hover:text-[#8B5A2B] truncate">
                    {instagramName}
                  </p>
                </div>
              </a>

              {/* TikTok */}
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-stone-200 hover:border-[#8B5A2B] bg-[#FBF9F5] hover:bg-stone-50 transition group flex-1"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1C1917] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-stone-500 font-medium">TikTok</p>
                  <p className="text-sm font-bold text-stone-900 group-hover:text-[#8B5A2B] truncate">
                    {tiktokName}
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* KANAN: Google Maps (Clickable directing to kedai address) */}
          <div className="rounded-3xl border border-stone-200 overflow-hidden bg-stone-50 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#8B5A2B]" />
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Lokasi Kedai Fisik
                </span>
              </div>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-[#8B5A2B] hover:underline flex items-center gap-1"
              >
                <span>Buka di Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block group relative rounded-2xl overflow-hidden border border-stone-300 shadow-inner h-44 bg-stone-200"
            >
              {/* Stylized map visual representation */}
              <div className="absolute inset-0 bg-[#E8E1D5] flex flex-col items-center justify-center p-4 text-center group-hover:bg-[#dfd7ca] transition">
                <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition mb-2">
                  <MapPin className="w-6 h-6" />
                </div>
                <p className="font-extrabold text-sm text-stone-900">
                  {brandName} Espresso &amp; Brew
                </p>
                <p className="text-xs text-stone-600 mt-1 max-w-xs line-clamp-2">
                  {googleMapsAddress}
                </p>
                <span className="mt-2 text-[10px] font-bold bg-white text-stone-800 px-3 py-1 rounded-full shadow-xs">
                  Petunjuk Arah &rarr;
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
