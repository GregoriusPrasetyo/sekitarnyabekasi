-- ==============================================================================
-- ERD APLIKASI PEMETAAN KOLABORATIF (SEKITARNYA BEKASI)
-- Database: PostgreSQL 16
-- Multi-Role Support: Masyarakat, Pemda, Admin
-- ==============================================================================

-- Drop existing tables with cascade
DROP TABLE IF EXISTS laporan_sistem CASCADE;
DROP TABLE IF EXISTS notifikasi CASCADE;
DROP TABLE IF EXISTS tindak_lanjut CASCADE;
DROP TABLE IF EXISTS validasi_ai CASCADE;
DROP TABLE IF EXISTS laporan_masalah CASCADE;
DROP TABLE IF EXISTS infrastruktur CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop ENUM types if exist
DROP TYPE IF EXISTS role_enum CASCADE;
DROP TYPE IF EXISTS kategori_infrastruktur_enum CASCADE;
DROP TYPE IF EXISTS status_laporan_enum CASCADE;
DROP TYPE IF EXISTS status_validasi_enum CASCADE;

-- ------------------------------------------------------------------------------
-- 1. ENUM DEFINITIONS
-- ------------------------------------------------------------------------------
CREATE TYPE role_enum AS ENUM (
    'masyarakat', 
    'pemda', 
    'admin'
);

CREATE TYPE kategori_infrastruktur_enum AS ENUM (
    'jalan', 
    'jembatan', 
    'drainase', 
    'transportasi_publik', 
    'trotoar', 
    'penerangan_jalan', 
    'taman', 
    'lainnya'
);

CREATE TYPE status_laporan_enum AS ENUM (
    'menunggu_validasi', 
    'terverifikasi', 
    'dalam_tinjauan', 
    'sedang_dikerjakan', 
    'selesai', 
    'ditolak'
);

CREATE TYPE status_validasi_enum AS ENUM (
    'valid', 
    'akurasi_rendah', 
    'duplikat', 
    'anomali', 
    'tidak_valid'
);

-- ------------------------------------------------------------------------------
-- 2. TABLE: Users
-- Role: 'masyarakat', 'pemda', 'admin'
-- ------------------------------------------------------------------------------
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) DEFAULT '$2a$12$defaultHashedCitizenPassword',
    no_telepon VARCHAR(25),
    domisili VARCHAR(100),
    role role_enum NOT NULL DEFAULT 'masyarakat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 3. TABLE: Infrastruktur
-- ------------------------------------------------------------------------------
CREATE TABLE infrastruktur (
    infrastruktur_id SERIAL PRIMARY KEY,
    nama_tempat VARCHAR(200) NOT NULL,
    kategori kategori_infrastruktur_enum NOT NULL,
    deskripsi TEXT,
    alamat TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    foto_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 4. TABLE: Laporan_Masalah
-- Added is_spam column for Admin moderation
-- ------------------------------------------------------------------------------
CREATE TABLE laporan_masalah (
    laporan_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    infrastruktur_id INT REFERENCES infrastruktur(infrastruktur_id) ON DELETE SET NULL,
    judul_laporan VARCHAR(255) NOT NULL,
    deskripsi_masalah TEXT NOT NULL,
    foto_bukti VARCHAR(500),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status_laporan status_laporan_enum NOT NULL DEFAULT 'menunggu_validasi',
    is_spam BOOLEAN NOT NULL DEFAULT FALSE,
    tanggal_lapor TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 5. TABLE: Validasi_AI
-- ------------------------------------------------------------------------------
CREATE TABLE validasi_ai (
    validasi_id SERIAL PRIMARY KEY,
    laporan_id INT NOT NULL REFERENCES laporan_masalah(laporan_id) ON DELETE CASCADE,
    skor_akurasi_koordinat REAL NOT NULL,
    status_validasi status_validasi_enum NOT NULL DEFAULT 'valid',
    catatan_ai TEXT,
    waktu_validasi TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 6. TABLE: Tindak_Lanjut (Pemda Response & Follow-up)
-- ------------------------------------------------------------------------------
CREATE TABLE tindak_lanjut (
    tindak_lanjut_id SERIAL PRIMARY KEY,
    laporan_id INT NOT NULL REFERENCES laporan_masalah(laporan_id) ON DELETE CASCADE,
    pemda_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    keterangan_tindakan TEXT NOT NULL,
    foto_hasil_perbaikan VARCHAR(500),
    status_terbaru VARCHAR(100) NOT NULL,
    waktu_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 7. TABLE: Notifikasi
-- ------------------------------------------------------------------------------
CREATE TABLE notifikasi (
    notifikasi_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    laporan_id INT REFERENCES laporan_masalah(laporan_id) ON DELETE CASCADE,
    pesan TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    waktu_kirim TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 8. TABLE: Laporan_Sistem (Contact / Inform Admin on Website Issues)
-- ------------------------------------------------------------------------------
CREATE TABLE laporan_sistem (
    kendala_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    nama_pelapor VARCHAR(150) NOT NULL,
    email_pelapor VARCHAR(150) NOT NULL,
    kategori_kendala VARCHAR(100) NOT NULL,
    pesan TEXT NOT NULL,
    status_kendala VARCHAR(50) NOT NULL DEFAULT 'menunggu_tinjauan',
    tanggapan_admin TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 9. INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX idx_laporan_user ON laporan_masalah(user_id);
CREATE INDEX idx_laporan_infrastruktur ON laporan_masalah(infrastruktur_id);
CREATE INDEX idx_validasi_laporan ON validasi_ai(laporan_id);
CREATE INDEX idx_tindaklanjut_laporan ON tindak_lanjut(laporan_id);
CREATE INDEX idx_tindaklanjut_pemda ON tindak_lanjut(pemda_id);
CREATE INDEX idx_notifikasi_user ON notifikasi(user_id);
CREATE INDEX idx_notifikasi_laporan ON notifikasi(laporan_id);
CREATE INDEX idx_kendala_status ON laporan_sistem(status_kendala);
