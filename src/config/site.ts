// Centralized Configuration for COFIX
// Edit this file to change brand info, address, operational hours, social media links, etc.

export interface SiteConfig {
  brandName: string;
  tagline: string;
  shortDescription: string;
  alamatKedai: {
    street: string;
    subdistrict: string;
    city: string;
    postalCode: string;
    fullText: string;
  };
  jamOperasional: {
    openHour: number; // 7 (07:00)
    openMinute: number; // 0
    closeHour: number; // 21 (21:00)
    closeMinute: number; // 0
    display: string;
    timezone: string; // 'Asia/Jakarta'
  };
  socialMedia: {
    instagram: {
      handle: string;
      url: string;
    };
    tiktok: {
      handle: string;
      url: string;
    };
    googleMaps: {
      url: string;
      embedUrl?: string;
    };
  };
  deliveryMethods: {
    pickup: {
      id: string;
      label: string;
      description: string;
      enabled: boolean;
    };
    delivery: {
      id: string;
      label: string;
      badge: string;
      enabled: boolean;
    };
  };
  limits: {
    maxImageUploadSizeBytes: number; // 2 MB
  };
}

export const siteConfig: SiteConfig = {
  brandName: 'COFIX',
  tagline: 'Ngopi nikmat, dompet selamat',
  shortDescription: 'Nikmati kopi berkualitas dengan racikan istimewa barista lokal. Harga bersahabat untuk teman nongkrong dan kerja harian.',
  alamatKedai: {
    street: 'Jl. Melati No. 42, Senopati',
    subdistrict: 'Kebayoran Baru',
    city: 'Jakarta Selatan',
    postalCode: '12190',
    fullText: 'Jl. Melati No. 42, Senopati, Kebayoran Baru, Jakarta Selatan 12190',
  },
  jamOperasional: {
    openHour: 7, // 07:00 WIB
    openMinute: 0,
    closeHour: 21, // 21:00 WIB
    closeMinute: 0,
    display: '07.00 – 21.00 WIB',
    timezone: 'Asia/Jakarta',
  },
  socialMedia: {
    instagram: {
      handle: '@cofix.coffee',
      url: 'https://instagram.com/cofix.coffee',
    },
    tiktok: {
      handle: '@cofix.coffee',
      url: 'https://tiktok.com/@cofix.coffee',
    },
    googleMaps: {
      url: 'https://maps.google.com/?q=COFIX+Coffee+Jakarta',
    },
  },
  deliveryMethods: {
    pickup: {
      id: 'pickup',
      label: 'Ambil langsung di tempat',
      description: 'Pesanan disiapkan di kedai, ambil langsung begitu status selesai.',
      enabled: true,
    },
    delivery: {
      id: 'delivery',
      label: 'Diantar',
      badge: 'Coming Soon',
      enabled: false,
    },
  },
  limits: {
    maxImageUploadSizeBytes: 2 * 1024 * 1024, // 2 MB
  },
};
