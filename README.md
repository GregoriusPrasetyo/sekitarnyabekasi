# Sekitarnya Bekasi - Portal Aspirasi Fasilitas Umum Multi-Role

Aplikasi web kolaboratif Kota Bekasi dengan arsitektur **Multi-Role** berbasis PostgreSQL 16:
1. **Masyarakat (Citizen)**: Menyampaikan aspirasi & laporan fasilitas umum melalui forum dan peta interaktif.
2. **Pemda (Pemerintah Daerah Kota Bekasi)**: Menerima, mengklarifikasi, dan wajib memberi balasan resmi serta tindak lanjut penyelesaian masalah.
3. **Admin (Super Administrator)**: Hak akses tertinggi (highest privilege) untuk moderasi postingan, penanganan spam, kelola pengguna & role, serta pusat pelaporan kendala website.

---

## 👥 Rincian Hak Akses & Peran (Role)

| Peran | Hak Akses & Kemampuan |
|---|---|
| **Masyarakat** | - Mengisi formulir aspirasi (Nama, Email, Domisili Kecamatan, No. Telp, Fasilitas, Foto, Titik Koordinat Peta).<br>- Memantau status penanganan dan membaca balasan resmi dari Pemda di Forum Aspirasi.<br>- Mengirimkan laporan kendala sistem/website kepada Admin. |
| **Pemda** | - Menerima antrean aspirasi masyarakat berdasarkan wilayah Kota Bekasi.<br>- Mengklarifikasi status laporan (`menunggu_validasi`, `terverifikasi`, `dalam_tinjauan`, `sedang_dikerjakan`, `selesai`, `ditolak`).<br>- **Wajib memberikan balasan resmi & tindak lanjut** pada setiap masalah yang diselesaikan (`tindak_lanjut` table & auto notification). |
| **Admin** | - **Highest Privilege**: Mengedit seluruh judul & deskripsi laporan di web.<br>- **Moderasi Spam**: Menandai postingan sebagai spam atau menghapus postingan permanen.<br>- **Manajemen Pengguna**: Mengubah role pengguna (`masyarakat`, `pemda`, `admin`) atau menghapus pengguna.<br>- **Pusat Kendala Website**: Menerima aduan bug, error, atau spam dari pengguna dan memperbarui status penanganannya. |

---

## 🗄️ Tabel Database PostgreSQL (`pemetaan_kolaboratif`)
1. **`users`**: Data akun pengguna, domisili, nomor telepon, dan role ENUM (`masyarakat`, `pemda`, `admin`).
2. **`infrastruktur`**: Aset fasilitas umum (Jalan, Jembatan, Drainase, Halte, PJU, dll) beserta koordinat GPS.
3. **`laporan_masalah`**: Aspirasi masyarakat lengkap dengan koordinat, foto, status, dan flag `is_spam`.
4. **`validasi_ai`**: Skor akurasi koordinat dan analisis otomatis AI.
5. **`tindak_lanjut`**: Log balasan resmi dan bukti perbaikan fisik dari dinas Pemda.
6. **`notifikasi`**: Riwayat pemberitahuan status bagi pelapor.
7. **`laporan_sistem`**: Wadah kontak pengguna ke Admin untuk melaporkan kendala/bug website.

---

## 🚀 Menjalankan Aplikasi
```bash
# 1. Jalankan server (Node.js + PostgreSQL)
node server.js
```
Akses portal melalui browser di: **`http://localhost:3000`**
Gunakan bilah pemilih peran di bagian atas halaman untuk beralih antara portal **Masyarakat**, **Pemda**, dan **Admin**.
