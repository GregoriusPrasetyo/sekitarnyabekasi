-- ==============================================================================
-- SEED DATA: ERD APLIKASI PEMETAAN KOLABORATIF (SEKITARNYA BEKASI)
-- Data realistis seputar Kota Bekasi
-- ==============================================================================

-- 1. Insert Sample Users
INSERT INTO users (user_id, nama, email, password, no_telepon, role) VALUES
(1, 'Budi Santoso', 'budi.santoso@gmail.com', '$2a$12$hashedPasswordUserBudi123456', '081289123456', 'masyarakat'),
(2, 'Siti Rahmawati', 'siti.rahmawati@gmail.com', '$2a$12$hashedPasswordUserSiti123456', '081377889900', 'masyarakat'),
(3, 'Dian Kusuma', 'dian.kusuma@gmail.com', '$2a$12$hashedPasswordUserDian123456', '085711223344', 'masyarakat'),
(4, 'Ir. Bambang Hermanto', 'bambang.disbima@bekasikota.go.id', '$2a$12$hashedPasswordPemdaBambang123', '081198765432', 'pemda'),
(5, 'Hendra Wijaya', 'hendra.dishub@bekasikota.go.id', '$2a$12$hashedPasswordPemdaHendra123', '081234567890', 'pemda'),
(6, 'Administrator Sekitarnya Bekasi', 'admin@sekitarnyabekasi.go.id', '$2a$12$hashedPasswordAdminSuper123', '081112223334', 'admin')
ON CONFLICT (user_id) DO NOTHING;

-- Set user sequence to next value
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));

-- 2. Insert Sample Infrastruktur
INSERT INTO infrastruktur (infrastruktur_id, nama_tempat, kategori, deskripsi, alamat, latitude, longitude, foto_url) VALUES
(1, 'Stasiun Kereta Api Bekasi Kota', 'transportasi_publik', 'Stasiun komuter dan antarkota pusat Kota Bekasi yang melayani KRL Commuter Line Cikarang Line.', 'Jl. Ir. H. Juanda No. 1, Duren Jaya, Kec. Bekasi Timur, Kota Bekasi', -6.236160, 106.999400, 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'),
(2, 'Halte Transpatriot GOR Bekasi', 'transportasi_publik', 'Shelter pemberhentian bus Transpatriot koridor 1 depan Stadion Patriot Candrabhaga.', 'Jl. Ahmad Yani No. 2, Kayuringin Jaya, Kec. Bekasi Selatan, Kota Bekasi', -6.233520, 106.992210, 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80'),
(3, 'Flyover Summarecon Bekasi (KH Noer Ali)', 'jembatan', 'Jembatan layang ikonik penghubung Jl. Ahmad Yani dan kawasan Summarecon Bekasi.', 'Jl. Ahmad Yani, Marga Mulya, Kec. Bekasi Utara, Kota Bekasi', -6.225540, 106.999820, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'),
(4, 'Saluran Drainase Utama Kalimalang', 'drainase', 'Saluran air pengendali limpasan hujan dan aliran air baku utama Bekasi Barat.', 'Jl. KH. Noer Ali, Jakasampurna, Kec. Bekasi Barat, Kota Bekasi', -6.248210, 106.974530, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'),
(5, 'Jembatan Besi Rawalumbu', 'jembatan', 'Jembatan penghubung antar RW di bantaran kali Rawalumbu untuk akses warga.', 'Jl. Pramuka RT 03/RW 02, Pengasinan, Kec. Rawalumbu, Kota Bekasi', -6.271030, 106.997540, 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=800&q=80'),
(6, 'Penerangan Jalan Umum Jl. Chairil Anwar', 'penerangan_jalan', 'Deretan tiang lampu penerangan jalan umum arteri penghubung Kalimalang dan Tol Bekasi Timur.', 'Jl. Chairil Anwar, Margahayu, Kec. Bekasi Timur, Kota Bekasi', -6.254820, 107.010210, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'),
(7, 'Jalur Pedestrian dan Trotoar Jl. Juanda', 'trotoar', 'Trotoar ramah difabel dan pejalan kaki penghubung stasiun Bekasi ke terminal bus.', 'Jl. Ir. H. Juanda, Margahayu, Kec. Bekasi Selatan, Kota Bekasi', -6.238050, 106.996020, 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (infrastruktur_id) DO NOTHING;

-- Set sequence
SELECT setval('infrastruktur_infrastruktur_id_seq', (SELECT MAX(infrastruktur_id) FROM infrastruktur));

-- 3. Insert Sample Laporan Masalah
INSERT INTO laporan_masalah (laporan_id, user_id, infrastruktur_id, judul_laporan, deskripsi_masalah, foto_bukti, latitude, longitude, status_laporan, tanggal_lapor) VALUES
(1, 1, 4, 'Saluran drainase tersumbat sampah plastik', 'Air meluap ke badan jalan saat hujan deras kemarin sore sekitar 1 jam, menyebabkan genangan setinggi 25 cm dan kemacetan di depan ruko.', 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=800&q=80', -6.248210, 106.974530, 'sedang_dikerjakan', NOW() - INTERVAL '3 days'),
(2, 2, 6, 'Penerangan jalan mati total di malam hari', 'Lampu PJU sepanjang kira-kira 250 meter padam total sejak 2 hari lalu. Ruas jalan sangat gelap dan rawan kecelakaan bagi pesepeda motor.', 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80', -6.254820, 107.010210, 'terverifikasi', NOW() - INTERVAL '2 days'),
(3, 3, 2, 'Papan informasi rute Transpatriot rusak & kaca retak', 'Kaca dinding shelter retak terkena dahan tumbang dan papan display trayek bus tidak terbaca oleh penumpang umum.', 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80', -6.233520, 106.992210, 'selesai', NOW() - INTERVAL '5 days'),
(4, 1, 3, 'Lubang aspal di sambungan expansion joint flyover', 'Terdapat celah lubang pada aspal sambungan jembatan layang arah Summarecon. Cukup dalam dan berbahaya jika terinjak motor kecepatan tinggi.', 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80', -6.225540, 106.999820, 'menunggu_validasi', NOW() - INTERVAL '4 hours')
ON CONFLICT (laporan_id) DO NOTHING;

-- Set sequence
SELECT setval('laporan_masalah_laporan_id_seq', (SELECT MAX(laporan_id) FROM laporan_masalah));

-- 4. Insert Sample Validasi AI
INSERT INTO validasi_ai (validasi_id, laporan_id, skor_akurasi_koordinat, status_validasi, catatan_ai, waktu_validasi) VALUES
(1, 1, 0.96, 'valid', 'AI memverifikasi koordinat GPS cocok dengan segmen drainase Kalimalang (deviasi 4.2 meter). Analisis visual mengonfirmasi deteksi genangan air dan penumpukan debris sampah.', NOW() - INTERVAL '3 days' + INTERVAL '15 minutes'),
(2, 2, 0.93, 'valid', 'Koordinat terpetakan pada aset PJU Dinas Perhubungan segmen Chairil Anwar. Foto bukti terdeteksi diambil saat malam hari dengan tingkat pencahayaan di bawah 5 lux.', NOW() - INTERVAL '2 days' + INTERVAL '10 minutes'),
(3, 3, 0.98, 'valid', 'Koordinat presisi tinggi pada Halte Transpatriot GOR Bekasi. Pengenalan pola citra menunjukkan retakan panel pelindung shelter sebesar 45 cm.', NOW() - INTERVAL '5 days' + INTERVAL '5 minutes'),
(4, 4, 0.88, 'valid', 'Koordinat berada pada rentang lajur Flyover Summarecon. Estimasi kedalaman lubang aspal terdeteksi 4-7 cm, memerlukan penanganan keselamatan jalan.', NOW() - INTERVAL '3 hours')
ON CONFLICT (validasi_id) DO NOTHING;

-- Set sequence
SELECT setval('validasi_ai_validasi_id_seq', (SELECT MAX(validasi_id) FROM validasi_ai));

-- 5. Insert Sample Tindak Lanjut
INSERT INTO tindak_lanjut (tindak_lanjut_id, laporan_id, pemda_id, keterangan_tindakan, foto_hasil_perbaikan, status_terbaru, waktu_update) VALUES
(1, 1, 4, 'Tim Unit Reaksi Cepat (URC) Dinas Bina Marga dan SDA Kota Bekasi telah menurunkan 8 personel beserta armada pengangkut lumpur untuk pengerukan sedimentasi saluran.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', 'Pembersihan saluran 75% selesai, aliran air kembali lancar', NOW() - INTERVAL '1 day'),
(2, 3, 5, 'Dinas Perhubungan Kota Bekasi telah mengganti panel kaca shelter dengan akrilik tempered baru dan memasang stiker peta rute koridor 1 & 2 terbaru.', 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80', 'Fasilitas halte selesai diperbaiki dan telah berfungsi normal 100%', NOW() - INTERVAL '2 days')
ON CONFLICT (tindak_lanjut_id) DO NOTHING;

-- Set sequence
SELECT setval('tindak_lanjut_tindak_lanjut_id_seq', (SELECT MAX(tindak_lanjut_id) FROM tindak_lanjut));

-- 6. Insert Sample Notifikasi
INSERT INTO notifikasi (notifikasi_id, user_id, laporan_id, pesan, is_read, waktu_kirim) VALUES
(1, 1, 1, 'Laporan Anda #1 "Saluran drainase tersumbat..." sedang ditangani oleh Tim URC Dinas Bina Marga & SDA.', FALSE, NOW() - INTERVAL '1 day'),
(2, 2, 2, 'Laporan Anda #2 "Penerangan jalan mati total..." telah berhasil divalidasi oleh AI dengan skor akurasi 93%. Diteruskan ke Dishub Kota Bekasi.', TRUE, NOW() - INTERVAL '2 days'),
(3, 3, 3, 'Kabar baik! Laporan Anda #3 mengenai Halte Transpatriot telah SELESAI ditindaklanjuti oleh Dinas Perhubungan.', TRUE, NOW() - INTERVAL '2 days'),
(4, 1, 4, 'Laporan Anda #4 "Lubang aspal di flyover..." telah masuk ke sistem dan sedang dalam antrean verifikasi petugas.', FALSE, NOW() - INTERVAL '3 hours'),
(5, 4, 1, '[TUGAS DISBIMA] Laporan baru terkait drainase Jl. KH Noer Ali telah dialokasikan ke divisi pemeliharaan Anda.', TRUE, NOW() - INTERVAL '3 days')
ON CONFLICT (notifikasi_id) DO NOTHING;

-- Set sequence
SELECT setval('notifikasi_notifikasi_id_seq', (SELECT MAX(notifikasi_id) FROM notifikasi));
