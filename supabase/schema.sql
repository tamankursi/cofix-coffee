-- ========================================================
-- COFIX SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Customer Phone Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ADMINS (Admin Email + Password Auth)
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT NOT NULL, -- Target number for Fonnte WhatsApp notifications!
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS (With versioning for invalidating stale carts)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL CHECK (stock >= 0),
  image_url TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to increment product version on any product change
CREATE OR REPLACE FUNCTION increment_product_version()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.name <> NEW.name OR OLD.description <> NEW.description OR OLD.price <> NEW.price OR OLD.stock <> NEW.stock OR OLD.image_url <> NEW.image_url) THEN
    NEW.version = OLD.version + 1;
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_increment_product_version ON public.products;
CREATE TRIGGER trg_increment_product_version
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION increment_product_version();

-- 4. EVENTS / PROMOTIONS
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CART ITEMS (Tracks user items with reserved version)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_version INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_product UNIQUE (user_id, product_id)
);

-- 6. ORDER COUNTER (Atomic sequence for #1, #2, #3 without reset)
CREATE TABLE IF NOT EXISTS public.order_counter (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  current_number BIGINT NOT NULL DEFAULT 0
);

INSERT INTO public.order_counter (id, current_number)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- 7. ORDERS (Created ONLY after payment confirmation)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number BIGINT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_method TEXT NOT NULL DEFAULT 'Ambil langsung di tempat',
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'proses' CHECK (status IN ('proses', 'selesai')),
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'failed')),
  payment_method TEXT NOT NULL,
  payment_time TEXT NOT NULL, -- e.g. '2 Oktober 2026, 13.05'
  is_archived_by_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ORDER ITEMS (Immutable transaction snapshot)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  unit_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal INTEGER NOT NULL
);

-- 9. CUSTOMER NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.customer_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_number BIGINT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. STORE OPERATIONAL SETTINGS (Jam Operasional & Status Kedai)
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'operational_hours',
  open_time TEXT NOT NULL DEFAULT '07:00',
  close_time TEXT NOT NULL DEFAULT '21:00',
  store_status TEXT NOT NULL DEFAULT 'auto' CHECK (store_status IN ('auto', 'temporary_closed')),
  timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.store_settings (id, open_time, close_time, store_status, timezone)
VALUES ('operational_hours', '07:00', '21:00', 'auto', 'Asia/Jakarta')
ON CONFLICT (id) DO NOTHING;

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Products Policies
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Admins manage products" ON public.products FOR ALL USING (true);

-- Events Policies
DROP POLICY IF EXISTS "Public read events" ON public.events;
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage events" ON public.events;
CREATE POLICY "Admins manage events" ON public.events FOR ALL USING (true);

-- Cart Items Policies
DROP POLICY IF EXISTS "Users view own cart" ON public.cart_items;
CREATE POLICY "Users view own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own cart" ON public.cart_items;
CREATE POLICY "Users manage own cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id);

-- Orders Policies
DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins manage orders" ON public.orders;
CREATE POLICY "Admins manage orders" ON public.orders FOR ALL USING (true);

-- Order Items Policies
DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Admins manage order items" ON public.order_items;
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL USING (true);

-- Customer Notifications Policies
DROP POLICY IF EXISTS "Users manage own notifications" ON public.customer_notifications;
CREATE POLICY "Users manage own notifications" ON public.customer_notifications FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins insert notifications" ON public.customer_notifications;
CREATE POLICY "Admins insert notifications" ON public.customer_notifications FOR INSERT WITH CHECK (true);

-- Store Settings Policies (Public can read, Admin can update)
DROP POLICY IF EXISTS "Public read store_settings" ON public.store_settings;
CREATE POLICY "Public read store_settings" ON public.store_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin update store_settings" ON public.store_settings;
CREATE POLICY "Admin update store_settings" ON public.store_settings FOR ALL USING (true);

-- 10. WEBSITE SETTINGS (Brand, Hero, Kontak)
CREATE TABLE IF NOT EXISTS public.website_settings (
  id TEXT PRIMARY KEY DEFAULT 'main_settings',
  brand_name TEXT NOT NULL DEFAULT 'COFIX',
  logo_url TEXT,
  hero_title TEXT NOT NULL DEFAULT 'Ngopi nikmat, dompet selamat',
  hero_address TEXT NOT NULL DEFAULT 'Jl. Melati No. 42, Senopati, Kebayoran Baru, Jakarta Selatan 12190',
  instagram_name TEXT NOT NULL DEFAULT '@cofix.coffee',
  instagram_url TEXT NOT NULL DEFAULT 'https://instagram.com/cofix.coffee',
  tiktok_name TEXT NOT NULL DEFAULT '@cofix.coffee',
  tiktok_url TEXT NOT NULL DEFAULT 'https://tiktok.com/@cofix.coffee',
  google_maps_address TEXT NOT NULL DEFAULT 'Jl. Melati No. 42, Senopati, Kebayoran Baru, Jakarta Selatan 12190',
  google_maps_url TEXT NOT NULL DEFAULT 'https://maps.google.com/?q=COFIX+Coffee+Jakarta',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.website_settings (
  id, brand_name, hero_title, hero_address,
  instagram_name, instagram_url, tiktok_name, tiktok_url,
  google_maps_address, google_maps_url
)
VALUES (
  'main_settings', 'COFIX', 'Ngopi nikmat, dompet selamat',
  'Jl. Melati No. 42, Senopati, Kebayoran Baru, Jakarta Selatan 12190',
  '@cofix.coffee', 'https://instagram.com/cofix.coffee',
  '@cofix.coffee', 'https://tiktok.com/@cofix.coffee',
  'Jl. Melati No. 42, Senopati, Kebayoran Baru, Jakarta Selatan 12190',
  'https://maps.google.com/?q=COFIX+Coffee+Jakarta'
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read website_settings" ON public.website_settings;
CREATE POLICY "Public read website_settings" ON public.website_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin update website_settings" ON public.website_settings;
CREATE POLICY "Admin update website_settings" ON public.website_settings FOR ALL USING (true);

-- ========================================================
-- STORAGE BUCKETS & STORAGE POLICIES
-- (Bucket: product-images & event-images)
-- ========================================================

-- Insert storage buckets with public read access
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('event-images', 'event-images', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 2097152;

-- Policies for product-images
DROP POLICY IF EXISTS "Public View product-images" ON storage.objects;
CREATE POLICY "Public View product-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow Upload product-images" ON storage.objects;
CREATE POLICY "Allow Upload product-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow Update product-images" ON storage.objects;
CREATE POLICY "Allow Update product-images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow Delete product-images" ON storage.objects;
CREATE POLICY "Allow Delete product-images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images');

-- Policies for event-images
DROP POLICY IF EXISTS "Public View event-images" ON storage.objects;
CREATE POLICY "Public View event-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-images');

DROP POLICY IF EXISTS "Allow Upload event-images" ON storage.objects;
CREATE POLICY "Allow Upload event-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'event-images');

DROP POLICY IF EXISTS "Allow Update event-images" ON storage.objects;
CREATE POLICY "Allow Update event-images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'event-images');

DROP POLICY IF EXISTS "Allow Delete event-images" ON storage.objects;
CREATE POLICY "Allow Delete event-images" ON storage.objects
  FOR DELETE USING (bucket_id = 'event-images');

-- ========================================================
-- INITIAL DUMMY PRODUCTS (8 Coffee items @ Rp12.000)
-- ========================================================
INSERT INTO public.products (id, name, description, price, stock, image_url, version)
VALUES
  ('prod-coffee-a', 'Coffee A', 'Espresso double shot dengan sentuhan susu segar creamy dan sirup aren organik khas COFIX.', 12000, 25, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', 1),
  ('prod-coffee-b', 'Coffee B', 'Kopi hitam cold brew pekat dengan aroma cokelat nutty dan tingkat keasaman seimbang.', 12000, 20, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80', 1),
  ('prod-coffee-c', 'Coffee C', 'Cappuccino hangat dengan lapisan foam tebal dan taburan bubuk kayu manis lembut.', 12000, 18, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80', 1),
  ('prod-coffee-d', 'Coffee D', 'Café Latte lembut paduan espresso arabika pilihan dengan steamed fresh milk premium.', 12000, 30, 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=80', 1),
  ('prod-coffee-e', 'Coffee E', 'Caramel Macchiato manis legit dengan saus karamel panggang dan aroma vanilla wangi.', 12000, 15, 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600&auto=format&fit=crop&q=80', 1),
  ('prod-coffee-f', 'Coffee F', 'Mocha Espresso nikmat memadukan dark cocoa Belgia dengan susu full cream dan shot kopi.', 12000, 22, 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=600&auto=format&fit=crop&q=80', 1),
  ('prod-coffee-g', 'Coffee G', 'Americano dingin menyegarkan, diseduh dari biji kopi sangrai medium-dark khas Nusantara.', 12000, 40, 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=600&auto=format&fit=crop&q=80', 1),
  ('prod-coffee-h', 'Coffee H', 'Hazelnut Latte beraroma kacang gurih manis berpadu seimbang dengan espresso mantap.', 12000, 16, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&auto=format&fit=crop&q=80', 1)
ON CONFLICT (id) DO NOTHING;
