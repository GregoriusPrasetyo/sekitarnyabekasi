# ⚡ Konfigurasi Database Supabase Cloud (Sekitarnya Bekasi)

Repositori ini telah dikonfigurasi **100% Client-Side ke Supabase Cloud** tanpa memerlukan server backend lokal (no local server). 

Aplikasi web dapat langsung di-deploy ke **Vercel, Netlify, atau GitHub Pages** sebagai web statis modern.

---

## 🚀 Panduan Setup Supabase (Hanya 2 Menit)

### Langkah 1: Buat Proyek di Supabase
1. Buka [https://supabase.com](https://supabase.com) dan login/daftar akun gratis.
2. Klik tombol **New Project**.
3. Beri nama proyek (misal: `sekitarnyabekasi`) dan tentukan password database.
4. Pilih region terdekat (misal: `Singapore (ap-southeast-1)`).

### Langkah 2: Eksekusi Skema Database
1. Pada dashboard proyek Supabase Anda, buka menu **SQL Editor** (ikon terminal di bilah samping kiri).
2. Klik **New Query**.
3. Buka berkas [Database/supabase_schema.sql](file:///workspaces/sekitarnyabekasi/Database/supabase_schema.sql), lalu salin seluruh kodenya.
4. Tempel (*paste*) kode tersebut ke SQL Editor Supabase, lalu klik tombol **Run** (atau tekan `Ctrl + Enter`).
5. Seluruh tabel, tipe data ENUM, relasi foreign key, index, dan kebijakan Row Level Security (RLS) akan otomatis dibuat dan siap digunakan!

### Langkah 3: Ambil Kredensial API Supabase
1. Di dashboard Supabase, buka menu **Project Settings** (ikon gerigi di kiri bawah) ➔ pilih **API**.
2. Salin 2 nilai berikut:
   - **Project URL** (contoh: `https://xyzabcdefghijklmnopq.supabase.co`)
   - **Project API Keys (`anon` / `public`)** (kunci panjang berawalan `eyJhbGci...`)

### Langkah 4: Hubungkan ke Aplikasi Web
Anda dapat menghubungkannya dengan salah satu dari dua cara berikut:

* **Cara A (Melalui File Repositori)**:
  Buka berkas [supabase-config.js](file:///workspaces/sekitarnyabekasi/supabase-config.js) lalu masukkan kredensial:
  ```javascript
  window.SUPABASE_CONFIG = {
    url: 'https://xyzabcdefghijklmnopq.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  };
  ```

* **Cara B (Langsung di Tampilan Web)**:
  Buka `index.html` di browser Anda, klik tombol **"Konfigurasi Supabase"** di pojok kanan atas, lalu masukkan Project URL dan Anon Key Anda. Pengaturan ini akan tersimpan di browser Anda.

---

## 🗄️ Struktur Entitas di Supabase
1. **`users`**: Warga, petugas Pemda, dan Admin.
2. **`infrastruktur`**: Aset fasilitas publik di Kota Bekasi.
3. **`laporan_masalah`**: Aspirasi & keluhan warga (dilengkapi flag `is_spam`).
4. **`validasi_ai`**: Hasil verifikasi otomatis koordinat lokasi & kategori fasilitas.
5. **`tindak_lanjut`**: Log balasan resmi & bukti foto perbaikan dari dinas Pemda.
6. **`notifikasi`**: Pemberitahuan status penanganan untuk akun warga.
7. **`laporan_sistem`**: Tiket laporan kendala website yang dikirimkan ke Admin.
