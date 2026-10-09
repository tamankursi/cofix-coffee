-- ==============================================================================
-- COFIX - Script Migrasi Tabel customer_profiles
-- ==============================================================================
-- INSTRUKSI MENJALANKAN DI SUPABASE:
-- 1. Buka Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Pilih proyek COFIX Anda
-- 3. Di menu sidebar kiri, klik "SQL Editor"
-- 4. Klik "New query"
-- 5. Salin dan tempel seluruh isi script SQL ini ke dalam editor
-- 6. Klik tombol "Run" di kanan bawah
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.customer_profiles (
  phone TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- Policy agar pelanggan dapat membaca dan menyimpan profil mereka
DROP POLICY IF EXISTS "Public can view customer_profiles" ON public.customer_profiles;
CREATE POLICY "Public can view customer_profiles"
  ON public.customer_profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can insert or update customer_profiles" ON public.customer_profiles;
CREATE POLICY "Public can insert or update customer_profiles"
  ON public.customer_profiles FOR ALL
  USING (true)
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
