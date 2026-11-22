# Dokumentasi Database: ERD Aplikasi Pemetaan Kolaboratif (Sekitarnya Bekasi)

Database ini dibangun menggunakan **PostgreSQL 16** berdasarkan diagram ERD sistem pemetaan kolaboratif Kota Bekasi.

---

## 1. Konfigurasi Koneksi PostgreSQL
- **Host**: `127.0.0.1` (atau `localhost`)
- **Port**: `5432`
- **Database Name**: `pemetaan_kolaboratif`
- **User**: `postgres`
- **Password**: `postgres`
- **URL Koneksi**: `postgresql://postgres:postgres@127.0.0.1:5432/pemetaan_kolaboratif`

---

## 2. Struktur Relasi & 6 Entitas ERD

### 🔑 Users
Menyimpan data pengguna (masyarakat pelapor, petugas pemda/SKPD, dan admin).
- `user_id` (INT, PK, Auto Increment)
- `nama` (VARCHAR(150))
- `email` (VARCHAR(150), UNIQUE)
- `password` (VARCHAR(255))
- `no_telepon` (VARCHAR(25))
- `role` (ENUM: `'masyarakat'`, `'pemda'`, `'admin'`)

### 🔑 Infrastruktur
Menyimpan aset fasilitas umum dan infrastruktur Kota Bekasi beserta titik koordinat geografis.
- `infrastruktur_id` (INT, PK, Auto Increment)
- `nama_tempat` (VARCHAR(200))
- `kategori` (ENUM: `'jalan'`, `'jembatan'`, `'drainase'`, `'transportasi_publik'`, `'trotoar'`, `'penerangan_jalan'`, `'taman'`, `'lainnya'`)
- `deskripsi` (TEXT)
- `alamat` (TEXT)
- `latitude` (DOUBLE PRECISION)
- `longitude` (DOUBLE PRECISION)
- `foto_url` (VARCHAR(500))

### 🔑 Laporan_Masalah
Menyimpan aspirasi dan keluhan kerusakan fasilitas umum dari warga.
- `laporan_id` (INT, PK, Auto Increment)
- `user_id` (INT, FK ➔ `users.user_id`)
- `infrastruktur_id` (INT, FK ➔ `infrastruktur.infrastruktur_id`)
- `judul_laporan` (VARCHAR(255))
- `deskripsi_masalah` (TEXT)
- `foto_bukti` (VARCHAR(500))
- `latitude` (DOUBLE PRECISION)
- `longitude` (DOUBLE PRECISION)
- `status_laporan` (ENUM: `'menunggu_validasi'`, `'terverifikasi'`, `'dalam_tinjauan'`, `'sedang_dikerjakan'`, `'selesai'`, `'ditolak'`)
- `tanggal_lapor` (TIMESTAMP WITH TIME ZONE)

### 🔑 Validasi_AI
Menyimpan hasil audit otomatis berbasis AI terhadap akurasi koordinat dan deteksi gambar bukti.
- `validasi_id` (INT, PK, Auto Increment)
- `laporan_id` (INT, FK ➔ `laporan_masalah.laporan_id`)
- `skor_akurasi_koordinat` (FLOAT / REAL)
- `status_validasi` (ENUM: `'valid'`, `'akurasi_rendah'`, `'duplikat'`, `'anomali'`, `'tidak_valid'`)
- `catatan_ai` (TEXT)
- `waktu_validasi` (TIMESTAMP WITH TIME ZONE)

### 🔑 Tindak_Lanjut
Menyimpan log pekerjaan dan perbaikan lapangan oleh dinas/pemda terkait.
- `tindak_lanjut_id` (INT, PK, Auto Increment)
- `laporan_id` (INT, FK ➔ `laporan_masalah.laporan_id`)
- `pemda_id` (INT, FK ➔ `users.user_id`)
- `keterangan_tindakan` (TEXT)
- `foto_hasil_perbaikan` (VARCHAR(500))
- `status_terbaru` (VARCHAR(100))
- `waktu_update` (TIMESTAMP WITH TIME ZONE)

### 🔑 Notifikasi
Menyimpan pesan pemberitahuan status tindak lanjut kepada pelapor maupun penugasan petugas pemda.
- `notifikasi_id` (INT, PK, Auto Increment)
- `user_id` (INT, FK ➔ `users.user_id`)
- `laporan_id` (INT, FK ➔ `laporan_masalah.laporan_id`)
- `pesan` (TEXT)
- `is_read` (BOOLEAN)
- `waktu_kirim` (TIMESTAMP WITH TIME ZONE)

---

## 3. Menjalankan Ulang Skrip DDL & Seed

```bash
# Menjalankan schema SQL (DDL)
docker exec -i postgres-db psql -U postgres -d pemetaan_kolaboratif < Database/schema.sql

# Menjalankan data dummy realistis Kota Bekasi (Seed)
docker exec -i postgres-db psql -U postgres -d pemetaan_kolaboratif < Database/seed.sql
```
