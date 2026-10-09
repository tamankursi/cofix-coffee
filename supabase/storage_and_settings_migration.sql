-- ========================================================
-- COFIX SUPABASE STORAGE & SETTINGS MIGRATION SCRIPT
-- Jalankan skrip ini di SQL Editor Supabase
-- ========================================================

-- 1. Tabel Pengaturan Jam Operasional & Status Kedai
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'operational_hours',
  open_time TEXT NOT NULL DEFAULT '07:00',
  close_time TEXT NOT NULL DEFAULT '21:00',
  store_status TEXT NOT NULL DEFAULT 'auto' CHECK (store_status IN ('auto', 'temporary_closed')),
  timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Baris inisialisasi default
INSERT INTO public.store_settings (id, open_time, close_time, store_status, timezone)
VALUES ('operational_hours', '07:00', '21:00', 'auto', 'Asia/Jakarta')
ON CONFLICT (id) DO NOTHING;

-- RLS untuk store_settings
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read store_settings" ON public.store_settings;
CREATE POLICY "Public read store_settings" ON public.store_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin update store_settings" ON public.store_settings;
CREATE POLICY "Admin update store_settings" ON public.store_settings FOR ALL USING (true);

-- 2. Pembuatan Bucket Supabase Storage (product-images & event-images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('event-images', 'event-images', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 2097152;

-- 3. Policy Akses Storage untuk product-images
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

-- 4. Policy Akses Storage untuk event-images
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

-- 5. Tabel Website Settings (Brand, Hero, Kontak)
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

-- Inisialisasi baris default
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

-- RLS untuk website_settings: customer can SELECT, admin can ALL
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read website_settings" ON public.website_settings;
CREATE POLICY "Public read website_settings" ON public.website_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin update website_settings" ON public.website_settings;
CREATE POLICY "Admin update website_settings" ON public.website_settings FOR ALL USING (true);

