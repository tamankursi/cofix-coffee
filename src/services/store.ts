import { Product, PromoEvent, CartItem, Order, CustomerNotification, CustomerUser, AdminUser, StoreOperationalSettings, WebsiteSettings } from '../types';
import { formatOrderDateTime } from '../utils/date';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { siteConfig } from '../config/site';

// Storage keys
const STORAGE_KEYS = {
  PRODUCTS: 'cofix_products',
  EVENTS: 'cofix_events',
  CARTS: 'cofix_carts', // Map of userId -> CartItem[]
  ORDERS: 'cofix_orders',
  ORDER_COUNTER: 'cofix_order_counter',
  NOTIFICATIONS: 'cofix_notifications',
  CUSTOMER_USER: 'cofix_customer_user',
  ADMIN_USER: 'cofix_admin_user',
  ADMIN_SESSION: 'cofix_admin_session',
  STORE_SETTINGS: 'cofix_store_settings',
  WEBSITE_SETTINGS: 'cofix_website_settings',
  REGISTERED_CUSTOMERS: 'cofix_registered_customers',
};

// Initial 8 dummy products @ Rp12.000
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-coffee-a',
    name: 'Coffee A',
    description: 'Espresso double shot dipadukan susu segar creamy dan gula aren organik khas COFIX.',
    price: 12000,
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    version: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-coffee-b',
    name: 'Coffee B',
    description: 'Kopi hitam cold brew pekat dengan aroma cokelat nutty dan rasa bersih menyegarkan.',
    price: 12000,
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
    version: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-coffee-c',
    name: 'Coffee C',
    description: 'Cappuccino hangat dengan lapisan micro-foam susu tebal bertabur kayu manis aromatik.',
    price: 12000,
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80',
    version: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-coffee-d',
    name: 'Coffee D',
    description: 'Café Latte lembut dari biji kopi arabika pilihan dengan steamed fresh milk bertekstur sutra.',
    price: 12000,
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=80',
    version: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-coffee-e',
    name: 'Coffee E',
    description: 'Caramel Macchiato manis legit dengan drizzle saus karamel panggang dan wangi vanila.',
    price: 12000,
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600&auto=format&fit=crop&q=80',
    version: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-coffee-f',
    name: 'Coffee F',
    description: 'Mocha Espresso nikmat memadukan bubuk dark cocoa Belgia dengan susu full cream dan kopi.',
    price: 12000,
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=600&auto=format&fit=crop&q=80',
    version: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-coffee-g',
    name: 'Coffee G',
    description: 'Americano dingin menyegarkan, diseduh dari blend biji kopi sangrai medium-dark Nusantara.',
    price: 12000,
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=600&auto=format&fit=crop&q=80',
    version: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-coffee-h',
    name: 'Coffee H',
    description: 'Hazelnut Latte dengan aroma kacang panggang yang gurih manis berpadu espresso mantap.',
    price: 12000,
    stock: 16,
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&auto=format&fit=crop&q=80',
    version: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initial dummy events
const INITIAL_EVENTS: PromoEvent[] = [
  {
    id: 'event-1',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop&q=80',
    description: 'PROMO SENIN HEMAT: Nikmati diskon khusus takeaway setiap pagi pukul 07.00 - 10.00 WIB untuk semua varian espresso.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'event-2',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80',
    description: 'SPECIAL ROASTERY EVENT: Biji kopi single origin Toraja & Mandheling baru saja mendarat di COFIX!',
    createdAt: new Date().toISOString(),
  },
];

// Initial Admin User
const DEFAULT_ADMIN: AdminUser = {
  id: 'admin-cofix-1',
  email: 'admin@cofix.com',
  phone: '085890058978', // Default admin phone number for Fonnte WhatsApp alerts
  createdAt: new Date().toISOString(),
};

// Default Store Operational Settings
const DEFAULT_STORE_SETTINGS: StoreOperationalSettings = {
  openTime: '07:00',
  closeTime: '21:00',
  storeStatus: 'auto',
  timezone: 'Asia/Jakarta',
  updatedAt: new Date().toISOString(),
};

// Default Website Settings (Rule 4: Fallback defaults from siteConfig)
export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  brandName: siteConfig.brandName,
  logoUrl: '',
  heroTitle: siteConfig.tagline,
  heroAddress: siteConfig.alamatKedai.fullText,
  instagramName: siteConfig.socialMedia.instagram.handle,
  instagramUrl: siteConfig.socialMedia.instagram.url,
  tiktokName: siteConfig.socialMedia.tiktok.handle,
  tiktokUrl: siteConfig.socialMedia.tiktok.url,
  googleMapsAddress: siteConfig.alamatKedai.fullText,
  googleMapsUrl: siteConfig.socialMedia.googleMaps.url,
  updatedAt: new Date().toISOString(),
};

class CofixStore {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
    if (typeof window !== 'undefined') {
      this.syncFromSupabase();
    }
  }

  private init() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDER_COUNTER)) {
      localStorage.setItem(STORAGE_KEYS.ORDER_COUNTER, '0');
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_USER)) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(DEFAULT_ADMIN));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STORE_SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.STORE_SETTINGS, JSON.stringify(DEFAULT_STORE_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.WEBSITE_SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.WEBSITE_SETTINGS, JSON.stringify(DEFAULT_WEBSITE_SETTINGS));
    }
  }

  /**
   * Asynchronously sync data from connected Supabase backend
   */
  public async syncFromSupabase() {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      // 0. Sync Website Settings (Brand, Hero, Kontak)
      try {
        const { data: wData, error: wErr } = await supabase
          .from('website_settings')
          .select('*')
          .eq('id', 'main_settings')
          .maybeSingle();

        if (!wErr && wData) {
          const settings: WebsiteSettings = {
            brandName: wData.brand_name || DEFAULT_WEBSITE_SETTINGS.brandName,
            logoUrl: wData.logo_url || '',
            heroTitle: wData.hero_title || DEFAULT_WEBSITE_SETTINGS.heroTitle,
            heroAddress: wData.hero_address || DEFAULT_WEBSITE_SETTINGS.heroAddress,
            instagramName: wData.instagram_name || DEFAULT_WEBSITE_SETTINGS.instagramName,
            instagramUrl: wData.instagram_url || DEFAULT_WEBSITE_SETTINGS.instagramUrl,
            tiktokName: wData.tiktok_name || DEFAULT_WEBSITE_SETTINGS.tiktokName,
            tiktokUrl: wData.tiktok_url || DEFAULT_WEBSITE_SETTINGS.tiktokUrl,
            googleMapsAddress: wData.google_maps_address || DEFAULT_WEBSITE_SETTINGS.googleMapsAddress,
            googleMapsUrl: wData.google_maps_url || DEFAULT_WEBSITE_SETTINGS.googleMapsUrl,
            updatedAt: wData.updated_at,
          };
          localStorage.setItem(STORAGE_KEYS.WEBSITE_SETTINGS, JSON.stringify(settings));
          this.notify();
        }
      } catch (e) {
        console.warn('Supabase website_settings sync note:', e);
      }

      // 1. Sync Store Settings (Jam Operasional & Status Kedai)
      const { data: sData, error: sErr } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 'operational_hours')
        .maybeSingle();

      if (!sErr && sData) {
        const settings: StoreOperationalSettings = {
          openTime: sData.open_time || '07:00',
          closeTime: sData.close_time || '21:00',
          storeStatus: (sData.store_status as 'auto' | 'temporary_closed') || 'auto',
          timezone: sData.timezone || 'Asia/Jakarta',
          updatedAt: sData.updated_at,
        };
        localStorage.setItem(STORAGE_KEYS.STORE_SETTINGS, JSON.stringify(settings));
        this.notify();
      }

      // 2. Sync Products
      const { data: pData, error: pErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });

      if (!pErr && pData && pData.length > 0) {
        const mappedProducts: Product[] = pData.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
          imageUrl: p.image_url,
          version: p.version || 1,
          isActive: p.is_active !== false,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        }));
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(mappedProducts));
        this.notify();
      }

      // 3. Sync Events
      const { data: eData, error: eErr } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (!eErr && eData && eData.length > 0) {
        const mappedEvents: PromoEvent[] = eData.map((e: any) => ({
          id: e.id,
          imageUrl: e.image_url,
          description: e.description,
          createdAt: e.created_at,
        }));
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(mappedEvents));
        this.notify();
      }
    } catch (err) {
      console.warn('Supabase initial sync note:', err);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // ===================== STORE OPERATIONAL SETTINGS =====================
  public getOperationalSettings(): StoreOperationalSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STORE_SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_STORE_SETTINGS;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  }

  public async saveOperationalSettings(settings: Partial<StoreOperationalSettings>): Promise<StoreOperationalSettings> {
    const current = this.getOperationalSettings();
    const updated: StoreOperationalSettings = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.STORE_SETTINGS, JSON.stringify(updated));
    this.notify();

    // Persist to Supabase store_settings table
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('store_settings').upsert({
          id: 'operational_hours',
          open_time: updated.openTime,
          close_time: updated.closeTime,
          store_status: updated.storeStatus,
          timezone: updated.timezone || 'Asia/Jakarta',
          updated_at: updated.updatedAt,
        });
      } catch (err) {
        console.warn('Gagal menyimpan store_settings ke Supabase:', err);
      }
    }

    return updated;
  }

  // ===================== WEBSITE SETTINGS (Brand, Hero, Kontak) =====================
  public getWebsiteSettings(): WebsiteSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WEBSITE_SETTINGS);
      if (!data) return DEFAULT_WEBSITE_SETTINGS;
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_WEBSITE_SETTINGS,
        ...parsed,
      };
    } catch {
      return DEFAULT_WEBSITE_SETTINGS;
    }
  }

  public async saveWebsiteSettings(settings: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    const current = this.getWebsiteSettings();
    const updated: WebsiteSettings = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.WEBSITE_SETTINGS, JSON.stringify(updated));
    this.notify();

    // Persist to Supabase website_settings table
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('website_settings').upsert({
          id: 'main_settings',
          brand_name: updated.brandName,
          logo_url: updated.logoUrl || null,
          hero_title: updated.heroTitle,
          hero_address: updated.heroAddress,
          instagram_name: updated.instagramName,
          instagram_url: updated.instagramUrl,
          tiktok_name: updated.tiktokName,
          tiktok_url: updated.tiktokUrl,
          google_maps_address: updated.googleMapsAddress,
          google_maps_url: updated.googleMapsUrl,
          updated_at: updated.updatedAt,
        });
        if (error) {
          console.warn('Gagal menyimpan website_settings ke Supabase:', error.message);
          const isTableMissing =
            error.code === 'PGRST205' ||
            error.message?.includes('website_settings') ||
            error.message?.includes('schema cache') ||
            error.message?.includes('relation "public.website_settings" does not exist');

          const customErr: any = new Error(
            isTableMissing
              ? "Tabel 'public.website_settings' belum ada di Supabase database (schema cache). Silakan jalankan script SQL migrasi di Supabase SQL Editor."
              : error.message
          );
          customErr.isTableMissing = isTableMissing;
          customErr.code = error.code;
          throw customErr;
        }
      } catch (err: any) {
        console.warn('Error save website_settings to Supabase:', err);
        throw err;
      }
    }

    return updated;
  }

  // ===================== PRODUCTS =====================
  public getProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  public getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  public async saveProduct(productData: Partial<Product> & { id?: string }): Promise<Product> {
    const products = this.getProducts();
    const now = new Date().toISOString();
    let resultProduct: Product;

    if (productData.id) {
      // Edit existing product -> bump version!
      const idx = products.findIndex((p) => p.id === productData.id);
      if (idx !== -1) {
        const old = products[idx];
        const updated: Product = {
          ...old,
          ...productData,
          version: (old.version || 1) + 1, // Rule 22: Version increments on any update!
          updatedAt: now,
        };
        products[idx] = updated;
        resultProduct = updated;
      } else {
        resultProduct = {
          id: productData.id,
          name: productData.name || 'Coffee Baru',
          description: productData.description || 'Komposisi kopi pilihan',
          price: productData.price || 12000,
          stock: productData.stock ?? 20,
          imageUrl: productData.imageUrl || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
          version: 1,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };
        products.push(resultProduct);
      }
    } else {
      // Create new product
      resultProduct = {
        id: `prod-${Date.now()}`,
        name: productData.name || 'Coffee Baru',
        description: productData.description || 'Komposisi kopi pilihan',
        price: productData.price || 12000,
        stock: productData.stock ?? 20,
        imageUrl: productData.imageUrl || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
        version: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      products.push(resultProduct);
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify();

    // Persist to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').upsert({
          id: resultProduct.id,
          name: resultProduct.name,
          description: resultProduct.description,
          price: resultProduct.price,
          stock: resultProduct.stock,
          image_url: resultProduct.imageUrl,
          version: resultProduct.version,
          is_active: resultProduct.isActive,
          updated_at: resultProduct.updatedAt,
        });
      } catch (err) {
        console.warn('Gagal menyimpan produk ke Supabase:', err);
      }
    }

    return resultProduct;
  }

  public async deleteProduct(id: string): Promise<void> {
    let products = this.getProducts();
    const target = products.find((p) => p.id === id);
    if (!target) return;

    products = products.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Rule 22 & 39: If product is deleted, it is removed from customer carts & stock restored
    this.removeProductFromAllCarts(id);
    this.notify();

    // Delete from Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('Gagal menghapus produk dari Supabase:', err);
      }
    }
  }

  // ===================== EVENTS =====================
  public getEvents(): PromoEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public async saveEvent(eventData: Partial<PromoEvent> & { id?: string }): Promise<PromoEvent> {
    const events = this.getEvents();
    let resultEvent: PromoEvent;

    if (eventData.id) {
      const idx = events.findIndex((e) => e.id === eventData.id);
      if (idx !== -1) {
        events[idx] = { ...events[idx], ...eventData } as PromoEvent;
        resultEvent = events[idx];
      } else {
        resultEvent = {
          id: eventData.id,
          imageUrl: eventData.imageUrl || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop&q=80',
          description: eventData.description || 'Informasi promo spesial COFIX.',
          createdAt: new Date().toISOString(),
        };
        events.push(resultEvent);
      }
    } else {
      resultEvent = {
        id: `event-${Date.now()}`,
        imageUrl: eventData.imageUrl || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop&q=80',
        description: eventData.description || 'Informasi promo spesial COFIX.',
        createdAt: new Date().toISOString(),
      };
      events.push(resultEvent);
    }

    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    this.notify();

    // Persist to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('events').upsert({
          id: resultEvent.id,
          image_url: resultEvent.imageUrl,
          description: resultEvent.description,
          created_at: resultEvent.createdAt,
        });
      } catch (err) {
        console.warn('Gagal menyimpan event ke Supabase:', err);
      }
    }

    return resultEvent;
  }

  public async deleteEvent(id: string): Promise<void> {
    let events = this.getEvents();
    events = events.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    this.notify();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('events').delete().eq('id', id);
      } catch (err) {
        console.warn('Gagal menghapus event dari Supabase:', err);
      }
    }
  }

  // ===================== CART & STOCK RESERVATION =====================
  // Rule 21: When product enters cart, stock immediately decreases.
  // When quantity is reduced or removed, stock returns.
  // Rule 22: Version check. If admin changed product, cart is invalid!

  public getCart(userId: string): CartItem[] {
    try {
      const allCarts = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARTS) || '{}');
      return allCarts[userId] || [];
    } catch {
      return [];
    }
  }

  private saveUserCart(userId: string, items: CartItem[]): void {
    try {
      const allCarts = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARTS) || '{}');
      allCarts[userId] = items;
      localStorage.setItem(STORAGE_KEYS.CARTS, JSON.stringify(allCarts));
      this.notify();
    } catch (err) {
      console.error('Failed to save cart:', err);
    }
  }

  /**
   * Validates if cart items still match the current product version in database.
   * Returns list of invalid items if any.
   */
  public validateCartVersions(userId: string): { isValid: boolean; invalidItems: CartItem[] } {
    const cart = this.getCart(userId);
    const products = this.getProducts();
    const invalidItems: CartItem[] = [];

    for (const item of cart) {
      const currentProd = products.find((p) => p.id === item.productId && p.isActive);
      if (!currentProd || currentProd.version !== item.productVersion) {
        invalidItems.push(item);
      }
    }

    return {
      isValid: invalidItems.length === 0,
      invalidItems,
    };
  }

  /**
   * Cleans invalid items from cart after admin update, returning stock if item was deleted
   */
  public purgeInvalidCartItems(userId: string): void {
    const cart = this.getCart(userId);
    const products = this.getProducts();
    const validItems: CartItem[] = [];

    for (const item of cart) {
      const currentProd = products.find((p) => p.id === item.productId && p.isActive);
      if (currentProd && currentProd.version === item.productVersion) {
        validItems.push(item);
      } else {
        // Return reserved stock if product still exists
        if (currentProd) {
          this.adjustStockDirectly(currentProd.id, item.quantity);
        }
      }
    }

    this.saveUserCart(userId, validItems);
  }

  /**
   * Adjusts stock directly on products
   */
  private adjustStockDirectly(productId: string, delta: number): boolean {
    const products = this.getProducts();
    const prod = products.find((p) => p.id === productId);
    if (!prod) return false;

    const newStock = prod.stock + delta;
    if (newStock < 0) return false;

    prod.stock = newStock;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    if (isSupabaseConfigured && supabase) {
      supabase.from('products').update({ stock: newStock }).eq('id', productId).then();
    }

    return true;
  }

  /**
   * Modifies cart item quantity with atomic stock reservation
   */
  public setCartQuantity(
    userId: string,
    productId: string,
    newQuantity: number
  ): { success: boolean; message?: string } {
    const products = this.getProducts();
    const product = products.find((p) => p.id === productId && p.isActive);
    if (!product) {
      return { success: false, message: 'Produk tidak ditemukan atau sudah tidak aktif.' };
    }

    const currentCart = this.getCart(userId);
    const existingIndex = currentCart.findIndex((i) => i.productId === productId);
    const currentQty = existingIndex !== -1 ? currentCart[existingIndex].quantity : 0;
    const delta = newQuantity - currentQty; // positive: reserving more stock, negative: releasing stock

    if (delta > 0) {
      // Need more stock
      if (product.stock < delta) {
        return {
          success: false,
          message: product.stock === 0 ? 'Yah lagi abis' : `Stok tersisa hanya ${product.stock} cup lagi.`,
        };
      }
      // Decrement stock
      product.stock -= delta;
    } else if (delta < 0) {
      // Return stock
      product.stock += Math.abs(delta);
    }

    // Save updated product stock
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    if (isSupabaseConfigured && supabase) {
      supabase.from('products').update({ stock: product.stock }).eq('id', product.id).then();
    }

    // Update cart
    if (newQuantity <= 0) {
      // Remove from cart
      const updatedCart = currentCart.filter((i) => i.productId !== productId);
      this.saveUserCart(userId, updatedCart);
    } else {
      if (existingIndex !== -1) {
        currentCart[existingIndex].quantity = newQuantity;
        currentCart[existingIndex].productVersion = product.version;
        currentCart[existingIndex].productPrice = product.price;
        currentCart[existingIndex].productName = product.name;
        currentCart[existingIndex].productImageUrl = product.imageUrl;
      } else {
        currentCart.push({
          productId: product.id,
          productVersion: product.version,
          productName: product.name,
          productPrice: product.price,
          productImageUrl: product.imageUrl,
          quantity: newQuantity,
        });
      }
      this.saveUserCart(userId, currentCart);
    }

    return { success: true };
  }

  /**
   * Removes a single product from cart and restores stock
   */
  public removeCartItem(userId: string, productId: string): void {
    const currentCart = this.getCart(userId);
    const item = currentCart.find((i) => i.productId === productId);
    if (!item) return;

    // Restore stock
    this.adjustStockDirectly(productId, item.quantity);

    // Save updated cart
    const updated = currentCart.filter((i) => i.productId !== productId);
    this.saveUserCart(userId, updated);
  }

  /**
   * Clears all items in user's cart and restores stock
   */
  public clearCart(userId: string): void {
    const currentCart = this.getCart(userId);
    for (const item of currentCart) {
      this.adjustStockDirectly(item.productId, item.quantity);
    }
    this.saveUserCart(userId, []);
  }

  /**
   * Clears cart upon successful payment WITHOUT returning stock (stock was purchased)
   */
  public finalizePurchasedCart(userId: string): void {
    this.saveUserCart(userId, []);
  }

  private removeProductFromAllCarts(productId: string): void {
    try {
      const allCarts = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARTS) || '{}');
      let changed = false;
      for (const uid in allCarts) {
        const filtered = allCarts[uid].filter((i: CartItem) => i.productId !== productId);
        if (filtered.length !== allCarts[uid].length) {
          allCarts[uid] = filtered;
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem(STORAGE_KEYS.CARTS, JSON.stringify(allCarts));
      }
    } catch (err) {
      console.error('Error removing product from carts:', err);
    }
  }

  // ===================== ORDERS & SEQUENCES =====================
  public getOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getCustomerOrders(userId: string): Order[] {
    return this.getOrders().filter((o) => o.userId === userId);
  }

  private getNextOrderNumber(): number {
    const current = parseInt(localStorage.getItem(STORAGE_KEYS.ORDER_COUNTER) || '0', 10);
    const next = current + 1;
    localStorage.setItem(STORAGE_KEYS.ORDER_COUNTER, String(next));
    return next;
  }

  /**
   * Creates order only upon valid payment confirmation
   */
  public createPaidOrder(params: {
    userId: string;
    customerName: string;
    customerPhone: string;
    items: CartItem[];
    deliveryMethod: string;
    paymentMethod: string;
  }): Order {
    const orderNumber = this.getNextOrderNumber();
    const now = new Date();
    const paymentTime = formatOrderDateTime(now);

    const snapshots = params.items.map((i) => ({
      productId: i.productId,
      productName: i.productName,
      unitPrice: i.productPrice,
      quantity: i.quantity,
      subtotal: i.productPrice * i.quantity,
    }));

    const totalAmount = snapshots.reduce((sum, s) => sum + s.subtotal, 0);

    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      orderNumber,
      userId: params.userId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      items: snapshots,
      totalAmount,
      deliveryMethod: params.deliveryMethod,
      status: 'proses',
      paymentStatus: 'paid',
      paymentMethod: params.paymentMethod,
      paymentTime,
      createdAt: now.toISOString(),
      archivedByAdmin: false,
    };

    const orders = this.getOrders();
    orders.push(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Clear cart without restoring stock
    this.finalizePurchasedCart(params.userId);

    // Send WhatsApp Fonnte notification to admin
    this.dispatchFonnteWhatsApp(newOrder);

    this.notify();
    return newOrder;
  }

  public markOrderComplete(orderId: string): void {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    order.status = 'selesai';
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Rule 34: Trigger internal customer notification
    this.createCustomerNotification({
      userId: order.userId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      title: `Pesanan #${order.orderNumber} Selesai`,
      message: 'Pesanan kamu sudah selesai dan siap diambil.',
    });

    this.notify();
  }

  public archiveAdminOrder(orderId: string): void {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.status !== 'selesai') return;

    order.archivedByAdmin = true;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify();
  }

  public archiveAllCompletedOrders(): void {
    const orders = this.getOrders();
    orders.forEach((o) => {
      if (o.status === 'selesai') {
        o.archivedByAdmin = true;
      }
    });
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify();
  }

  // ===================== NOTIFICATIONS =====================
  public getNotifications(userId: string): CustomerNotification[] {
    try {
      const all: CustomerNotification[] = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]'
      );
      return all.filter((n) => n.userId === userId);
    } catch {
      return [];
    }
  }

  public getActivePopupNotification(userId: string): CustomerNotification | undefined {
    return this.getNotifications(userId).find((n) => !n.isClosed);
  }

  public getUnreadCount(userId: string): number {
    return this.getNotifications(userId).filter((n) => !n.isRead).length;
  }

  public createCustomerNotification(data: {
    userId: string;
    orderId: string;
    orderNumber: number;
    title: string;
    message: string;
  }): CustomerNotification {
    const all: CustomerNotification[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]'
    );
    const newNotif: CustomerNotification = {
      id: `notif-${Date.now()}`,
      userId: data.userId,
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      title: data.title,
      message: data.message,
      isRead: false,
      isClosed: false,
      createdAt: new Date().toISOString(),
    };
    all.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
    this.notify();
    return newNotif;
  }

  public closeNotificationPopup(notifId: string): void {
    const all: CustomerNotification[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]'
    );
    const notif = all.find((n) => n.id === notifId);
    if (notif) {
      notif.isClosed = true;
      notif.isRead = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
      this.notify();
    }
  }

  public markAllNotificationsRead(userId: string): void {
    const all: CustomerNotification[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]'
    );
    all.forEach((n) => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
    this.notify();
  }

  // ===================== AUTHENTICATION =====================
  public getCurrentCustomer(): CustomerUser | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMER_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public getRegisteredCustomers(): Record<string, { phone: string; fullName: string; id: string }> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REGISTERED_CUSTOMERS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  public getCustomerByPhone(phone: string): { phone: string; fullName: string; id: string } | null {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const map = this.getRegisteredCustomers();
    // Check standard digits, or with 0, or with 62
    const keyWithZero = cleanPhone.startsWith('62') ? '0' + cleanPhone.slice(2) : cleanPhone;
    const keyWith62 = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    return map[cleanPhone] || map[keyWithZero] || map[keyWith62] || null;
  }

  public loginCustomer(phone: string, fullName: string): CustomerUser {
    const cleanDigits = phone.trim().replace(/\D/g, '');
    const cleanPhone = phone.trim();
    const user: CustomerUser = {
      id: `cust-${cleanDigits}`,
      phone: cleanPhone,
      fullName: fullName || 'Pelanggan COFIX',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_USER, JSON.stringify(user));

    // Persist in registered customers directory so logout & re-login retains name
    try {
      const reg = this.getRegisteredCustomers();
      const entry = { phone: cleanPhone, fullName: user.fullName, id: user.id };
      reg[cleanDigits] = entry;
      const keyWithZero = cleanDigits.startsWith('62') ? '0' + cleanDigits.slice(2) : cleanDigits;
      reg[keyWithZero] = entry;
      localStorage.setItem(STORAGE_KEYS.REGISTERED_CUSTOMERS, JSON.stringify(reg));
    } catch (e) {
      console.warn('Failed saving registered customer profile locally:', e);
    }

    this.notify();
    return user;
  }

  public logoutCustomer(): void {
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_USER);
    this.notify();
  }

  // Admin Auth (Email + Password)
  public getAdminUser(): AdminUser {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
      return data ? JSON.parse(data) : DEFAULT_ADMIN;
    } catch {
      return DEFAULT_ADMIN;
    }
  }

  public updateAdminProfile(data: { email?: string; phone?: string }): AdminUser {
    const current = this.getAdminUser();
    const updated: AdminUser = {
      ...current,
      email: data.email || current.email,
      phone: data.phone || current.phone,
    };
    localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(updated));
    this.notify();
    return updated;
  }

  public isAdminLoggedIn(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
  }

  public setAdminLoggedIn(status: boolean): void {
    if (status) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    }
    this.notify();
  }

  // ===================== FONNTE WHATSAPP DISPATCH =====================
  private async dispatchFonnteWhatsApp(order: Order) {
    const admin = this.getAdminUser();
    const itemsList = order.items
      .map((item) => `• ${item.productName} - ${item.quantity}`)
      .join('\n');

    const message = `Pesanan #${order.orderNumber}
Waktu: ${order.paymentTime}
Nama: ${order.customerName}
Nomor: ${order.customerPhone}

Pesanan:
${itemsList}

Delivery to:
${order.deliveryMethod}`;

    try {
      await fetch('/api/fonnte/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: admin.phone,
          message,
        }),
      }).catch((e) => console.log('Fonnte dispatch proxy note:', e.message));
    } catch (err) {
      console.log('Fonnte dispatch local note:', err);
    }
  }
}

export const store = new CofixStore();
