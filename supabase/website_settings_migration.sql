-- ==============================================================================
-- COFIX - Script Migrasi Tabel website_settings
-- ==============================================================================
-- INSTRUKSI MENJALANKAN DI SUPABASE:
-- 1. Buka dashboard Supabase (https://supabase.com/dashboard)
-- 2. Pilih project database Anda
-- 3. Di menu sidebar kiri, klik icon "SQL Editor"
-- 4. Tempelkan seluruh query di bawah ini ke editor SQL lalu klik tombol "Run"
-- ==============================================================================

-- 1. Buat tabel website_settings jika belum ada
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

-- 2. Masukkan data bawaan (default) jika tabel masih kosong
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

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- 4. Berikan izin baca publik (Customer & Pengunjung website)
DROP POLICY IF EXISTS "Public read website_settings" ON public.website_settings;
CREATE POLICY "Public read website_settings" ON public.website_settings
  FOR SELECT USING (true);

-- 5. Berikan izin tulis/update/insert untuk simpan pengaturan
DROP POLICY IF EXISTS "Allow manage website_settings" ON public.website_settings;
CREATE POLICY "Allow manage website_settings" ON public.website_settings
  FOR ALL USING (true);

-- 6. Reload cache schema PostgREST Supabase secara instan
NOTIFY pgrst, 'reload schema';
