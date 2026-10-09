# COFIX — Ngopi Nikmat, Dompet Selamat ☕

Aplikasi web pemesanan kopi dan minuman skala kecil, mobile-first, responsive (mobile, tablet, desktop), dan dapat di-install langsung sebagai **Progressive Web App (PWA)**.

---

## 📋 Daftar Isi

1. [Fitur Utama](#-fitur-utama)
2. [Arsitektur & Teknologi](#-arsitektur--teknologi)
3. [Konfigurasi Terpusat (Mudah Diedit)](#-konfigurasi-terpusat)
4. [Panduan Setup Supabase (Database & Storage)](#-panduan-setup-supabase)
5. [Pengaturan Jam Operasional & Status Kedai](#-pengaturan-jam-operasional)
6. [Panduan Setup Midtrans Payment Gateway](#-panduan-setup-midtrans)
7. [Panduan Setup WhatsApp Fonnte](#-panduan-setup-whatsapp-fonnte)
8. [Cara Mengganti Logo & Asset](#-cara-mengganti-logo--asset)
9. [Akun Admin & Manajemen Toko](#-akun-admin--manajemen-toko)
10. [Cara Menjalankan Secara Lokal & Build](#-cara-menjalankan-secara-lokal)
11. [Troubleshooting Dasar](#-troubleshooting-dasar)

---

## ✨ Fitur Utama

- **PWA & Mobile-First**: Tampilan dirancang khusus ramah sentuhan, cepat, dan dapat di-install langsung ke homescreen Android & iOS.
- **Nama Produk Multi-Baris Responsif**: Nama produk yang panjang (seperti *"Brown Sugar Coffee Latte"*) otomatis turun ke baris berikutnya seperti paragraf di mobile, tablet, dan desktop tanpa terpotong atau menggunakan `...`.
- **Pengaturan Jam Operasional Dinamis (Tersimpan di Supabase)**:
  - Admin dapat mengatur **Jam Buka** dan **Jam Tutup** langsung dari Dashboard Admin.
  - Terdapat pilihan **Status Kedai**:
    - **○ Otomatis berdasarkan jam**: Sistem secara otomatis menentukan buka/tutup berdasarkan jam WIB saat ini.
    - **○ Tutup sementara**: Kedai langsung dianggap tutup sekarang, tanpa mengubah jadwal jam operasional yang sudah diatur.
- **Supabase Storage Terintegrasi**:
  - `product-images`: Bucket publik untuk foto produk (maks 2 MB).
  - `event-images`: Bucket publik untuk banner promosi/event (maks 2 MB).
  - Penggantian gambar secara otomatis membersihkan file lama dari Supabase Storage.
- **Reservasi Stok Real-Time**: Ketika produk masuk ke keranjang pelanggan, stok di database langsung terpotong saat itu juga. Jika dikurangi/dihapus, stok dikembalikan.
- **Product Versioning Protection**: Jika admin memperbarui nama, foto, deskripsi, harga, atau stok suatu produk, keranjang pelanggan yang menyimpan versi lama otomatis dinyatakan tidak valid dan pelanggan diminta memilih menu versi terbaru.
- **Nomor Pesanan Berurutan Monotonik**: Nomor pesanan publik dimulai dari `#1`, `#2`, `#3`, dst. tanpa reset tanggal/bulan.
- **Snapshot Transaksi**: Riwayat pesanan pelanggan membekukan data harga dan nama item saat pembayaran terjadi, tidak akan berubah meskipun di masa depan admin mengedit atau menghapus produk dari katalog.
- **Dashboard Admin 1-Pintu**:
  - Pengaturan Jam Operasional & Status Kedai.
  - CRUD Produk (foto maks 2 MB, nama, harga, stok input angka langsung).
  - CRUD Event / Promosi (banner maks 2 MB, deskripsi).
  - Pesanan Proses (badge merah, tertua di atas, tombol ubah status `Selesai`).
  - Pesanan Selesai (badge hijau, hapus satuan tanpa konfirmasi, hapus semua dengan konfirmasi wajib). Menghapus pesanan di admin **tidak** menghapus riwayat pelanggan.
- **Notifikasi Internal Pelanggan**: Popup otomatis muncul saat pesanan diselesaikan oleh admin: *"Pesanan #X Selesai - Pesanan kamu sudah selesai dan siap diambil."* Tetap ada hingga ditutup oleh pelanggan.
- **Notifikasi WhatsApp Admin Otomatis (Fonnte)**: Rincian pesanan baru langsung terkirim ke WhatsApp admin. Tujuan otomatis mengikuti nomor HP yang terdaftar pada profil admin.

---

## ⚙️ Konfigurasi Terpusat

Semua data kedai yang sering berganti tersimpan rapi dalam **satu file terpusat**:

```text
src/config/site.ts
```

Di dalam file ini, Anda dapat mengubah:
- `brandName`: Nama brand (contoh: `"COFIX"`).
- `tagline`: Slogan (contoh: `"Ngopi nikmat, dompet selamat"`).
- `alamatKedai`: Alamat lengkap kedai fisik.
- `socialMedia.instagram`: Handle dan link Instagram.
- `socialMedia.tiktok`: Handle dan link TikTok.
- `socialMedia.googleMaps`: Link tujuan Google Maps kedai.

---

## 🚀 Panduan Setup Supabase (Database & Storage)

Skrip SQL lengkap tersedia di file `supabase/schema.sql` (skema lengkap) dan `supabase/storage_and_settings_migration.sql` (migrasi khusus storage & jam operasional).

### Langkah Menjalankan SQL di Supabase:

1. Buka browser dan login ke **[https://supabase.com](https://supabase.com)**.
2. Buka project Anda.
3. Pada sidebar kiri dashboard Supabase, klik ikon **SQL Editor** (ikon terminal `>_`).
4. Klik **New query**.
5. Buka file `supabase/schema.sql` pada repository project ini, copy seluruh kodenya.
6. Paste kode tersebut ke dalam SQL Editor Supabase.
7. Klik tombol **Run** berwarna hijau di pojok kanan bawah.
8. Pastikan muncul notifikasi hijau `Success. No rows returned`.

### Cara Membuat Bucket Storage di Supabase (Jika Dibuat Manual via UI):

Jika skrip SQL di atas sudah dijalankan, bucket `product-images` dan `event-images` sudah otomatis terbuat. Jika ingin membuat/memeriksa secara manual via antarmuka Supabase:

1. Pada sidebar kiri Supabase, klik menu **Storage**.
2. **Bucket Produk**:
   - Klik tombol **New bucket**.
   - Masukkan Name: `product-images`.
   - Centang opsi **Public bucket** (Wajib aktif agar foto produk dapat tampil ke pelanggan).
   - Klik **Save**.
3. **Bucket Event / Promo**:
   - Klik tombol **New bucket**.
   - Masukkan Name: `event-images`.
   - Centang opsi **Public bucket** (Wajib aktif agar banner event dapat tampil ke pelanggan).
   - Klik **Save**.
4. **Periksa Policies**:
   - Buka menu **Storage** > **Policies**.
   - Pastikan pada bucket `product-images` dan `event-images` terdapat policy untuk `SELECT` (Public/Anon) dan `INSERT`, `UPDATE`, `DELETE`.
   - Skrip di file `supabase/storage_and_settings_migration.sql` telah menyiapkan seluruh policy ini secara otomatis.

### Menyambungkan API Keys:

1. Buka menu **Project Settings** (ikon gerigi di sudut kiri bawah).
2. Klik submenu **API**.
3. Copy **Project URL** dan masukkan ke baris `VITE_SUPABASE_URL=` di file `.env`.
4. Copy **Project API keys (anon public)** dan masukkan ke baris `VITE_SUPABASE_ANON_KEY=` di file `.env`.
5. Simpan file `.env`.

---

## ⏰ Pengaturan Jam Operasional & Status Kedai

Admin dapat mengatur jam operasional kapan saja langsung dari **Dashboard Admin**:

1. Masuk ke **Portal Admin COFIX** (link di footer).
2. Pada bagian atas dashboard terdapat kartu **Jam Operasional & Status Kedai**.
3. Tentukan:
   - **Jam Buka (WIB)**: Contoh `07:00`
   - **Jam Tutup (WIB)**: Contoh `21:00`
   - **Status Kedai**:
     - **○ Otomatis berdasarkan jam**: Mengikuti jam buka dan tutup WIB secara otomatis.
     - **○ Tutup sementara**: Segera menutup kedai saat itu juga. Tombol produk di beranda pelanggan akan langsung menampilkan *"Yah lagi tutup"* dan checkout dinonaktifkan.
4. Klik tombol **Simpan Pengaturan Jam**.
5. Pengaturan tersimpan secara permanen di tabel `public.store_settings` Supabase, sehingga berlaku untuk seluruh pelanggan dan perangkat lain secara seketika.

---

## 💳 Panduan Setup Midtrans

1. Kunjungi **[https://dashboard.midtrans.com](https://dashboard.midtrans.com)** (atau **[https://dashboard.sandbox.midtrans.com](https://dashboard.sandbox.midtrans.com)** untuk uji coba).
2. Login ke akun Anda.
3. Buka menu **Settings** > **Access Keys**.
4. Cari bagian **Server Key** dan **Client Key**.
5. Copy nilai **Server Key**.
6. Buka file `.env` pada project, cari variable `MIDTRANS_SERVER_KEY=`, lalu paste nilai tersebut di sana.
7. Copy nilai **Client Key** dan paste pada `MIDTRANS_CLIENT_KEY=`.
8. Jika masih dalam mode Sandbox, pastikan `MIDTRANS_IS_PRODUCTION="false"`. Jika sudah siap produksi, ubah ke `"true"`.
9. Buka menu **Settings** > **Configuration** di dashboard Midtrans.
10. Pada kolom **Payment Notification URL**, masukkan URL backend Anda diikuti `/api/midtrans/notification` (contoh: `https://your-domain.com/api/midtrans/notification`).
11. Klik **Update**.

*Catatan Keamanan: Server Key disimpan aman di backend (`server.ts`) dan tidak pernah dikirim ke browser/frontend.*

---

## 📱 Panduan Setup WhatsApp Fonnte

1. Buka website **[https://fonnte.com](https://fonnte.com)**.
2. Login ke akun Fonnte Anda.
3. Buka menu **Device**.
4. Hubungkan nomor WhatsApp Anda dengan melakukan scan QR Code melalui WhatsApp di handphone Anda (Linked Devices).
5. Setelah status terhubung (*Connected*), cari bagian **API Token** atau **Device Token**.
6. Klik tombol **Copy**.
7. Buka file `.env` pada project Anda.
8. Cari variable `FONNTE_TOKEN=`.
9. Paste token tersebut di sana.
10. Simpan file `.env`.
11. **Nomor Tujuan**: Anda tidak perlu menyetel nomor HP admin di file config. Cukup login ke **Portal Admin COFIX** > klik **Pengaturan Akun** > ubah nomor handphone admin. Sistem secara otomatis mengirim WhatsApp setiap pesanan baru ke nomor tersebut!

---

## 🎨 Cara Mengganti Logo & Asset

Semua file logo dan icon PWA berada di folder `public/`:
- `public/icon.svg`: Logo utama vector COFIX.
- `public/pwa-192x192.png`: Icon homescreen Android/PWA ukuran 192px.
- `public/pwa-512x512.png`: Icon splash screen PWA ukuran 512px.
- `public/apple-touch-icon.png`: Icon homescreen iPhone/iPad ukuran 180px.
- `public/favicon.ico`: Favicon browser tab.

Untuk mengganti logo dengan logo milik Anda:
1. Siapkan file logo Anda dalam format PNG/SVG.
2. Beri nama file sesuai dengan nama file di atas.
3. Gantikan file lama di dalam folder `public/`.
4. Refresh browser Anda.

---

## 🔐 Akun Admin & Manajemen Toko

- URL Admin dapat diakses melalui link **Portal Admin** di bagian paling bawah halaman (Footer).
- **Akun Bawaan (Default)**:
  - Email: `admin@cofix.com`
  - Password: `admin123`
- Setelah login, admin dapat:
  1. Mengatur Jam Operasional dan Status Kedai (Otomatis vs Tutup Sementara).
  2. Menambah, mengedit, mengubah foto (Supabase Storage), mengubah stok, dan menghapus menu kopi.
  3. Menambah promo event untuk carousel beranda (Supabase Storage).
  4. Memproses pesanan dari status **Proses** menjadi **Selesai**.
  5. Menghapus pesanan selesai satuan (tanpa popup konfirmasi) atau sekaligus (dengan popup konfirmasi wajib).
  6. Mengganti nomor HP admin (tujuan notifikasi Fonnte otomatis berganti).

---

## 💻 Cara Menjalankan Secara Lokal

Pastikan Node.js v18+ telah terpasang di komputer Anda.

1. Install dependensi:
   ```bash
   npm install
   ```

2. Jalankan server pengembangan (Frontend + Backend terintegrasi di port 3000):
   ```bash
   npm run dev
   ```

3. Buka browser pada alamat:
   ```text
   http://localhost:3000
   ```

4. Untuk build produksi:
   ```bash
   npm run build
   ```

---

## 🛠️ Troubleshooting Dasar

- **Gambar Muncul Error "Bucket not found"**:
  Pastikan Anda telah membuat bucket `product-images` dan `event-images` di menu Storage Supabase, atau jalankan skrip `supabase/storage_and_settings_migration.sql` di SQL Editor Supabase.
- **Tombol produk bertuliskan "Yah lagi tutup"**:
  Periksa status jam operasional kedai. Jika kedai sedang diatur ke status "Tutup sementara" atau waktu saat ini berada di luar rentang jam operasional (WIB), sistem secara otomatis mengunci fitur keranjang dan checkout.
- **Keranjang memunculkan pesan "Pembaruan Menu Terdeteksi"**:
  Ini adalah fitur pengaman data (*Rule 22*). Jika admin mengubah harga, nama, atau data produk saat pelanggan sedang memilih, sistem mencegah transaksi data usang dan meminta pelanggan memasukkan ulang menu versi terbaru.
- **Gambar gagal di-upload di Dashboard Admin**:
  Batas maksimal ukuran file gambar adalah 2 MB. Pastikan ukuran file tidak melebihi 2 MB dan berformat JPG, PNG, atau WebP.
