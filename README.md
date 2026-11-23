# Sekitarnya Bekasi - Portal Aspirasi Fasilitas Umum Kota Bekasi

Aplikasi web pemetaan kolaboratif & penampung aspirasi fasilitas umum Kota Bekasi berbasis **Supabase Cloud Serverless** (tanpa backend server lokal).

---

## ⚡ Arsitektur Serverless (Supabase Only)

Aplikasi ini tidak memerlukan server Node.js atau Docker lokal. Seluruh operasi database berjalan langsung melalui **Supabase JavaScript Client v2** dari browser secara aman:

- **Frontend**: Single Page Application (HTML5, Tailwind CSS, Leaflet JS).
- **Backend / Database**: Supabase Cloud (PostgreSQL + PostgREST API).
- **Hosting**: Siap di-deploy langsung ke **Vercel**, Netlify, atau GitHub Pages.

---

## 👥 3 Peran Pengguna (Multi-Role)
1. **Masyarakat**: Menyampaikan aspirasi dan keluhan fasilitas umum (Jalan, Jembatan, Drainase, Halte, dll) dengan menentukan titik lokasi pada peta interaktif Leaflet.
2. **Pemda (Pemerintah Daerah)**: Menerima aspirasi masuk, mengklarifikasi status, dan **wajib memberikan balasan resmi & foto bukti perbaikan** pada setiap masalah yang telah ditangani.
3. **Admin (Super Administrator)**: Hak akses tertinggi untuk memoderasi konten spam, menyunting postingan, mengelola hak akses akun, dan meninjau laporan kendala website.

---

## 🚀 Cara Menjalankan & Menghubungkan ke Supabase

### 1. Siapkan Database Supabase
1. Buat proyek gratis di [supabase.com](https://supabase.com).
2. Masuk ke menu **SQL Editor**, buka berkas [Database/supabase_schema.sql](file:///workspaces/sekitarnyabekasi/Database/supabase_schema.sql), lalu tempel kueri dan klik **Run**.
3. Di **Project Settings ➔ API**, salin **Project URL** dan **Anon Public Key**.

### 2. Atur Kredensial
Buka [supabase-config.js](file:///workspaces/sekitarnyabekasi/supabase-config.js) dan isi:
```javascript
window.SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT_REF.supabase.co',
  anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```
*(Atau Anda bisa langsung membukanya di browser dan memasukkan kredensial melalui tombol "Konfigurasi Supabase" di pojok kanan atas).*

---

## 🌐 Deploy ke Vercel (Preset: "Other")
1. Hubungkan repositori GitHub Anda ke Vercel.
2. Pada pilihan **Framework Preset**, pilih **`Other`**.
3. Biarkan **Build Command** dan **Output Directory** kosong / default.
4. Klik **Deploy**! Aplikasi statis Anda langsung aktif di seluruh dunia.
