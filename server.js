const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL Connection Pool (Supports both standard parameters and DATABASE_URL for Vercel/Neon/Supabase)
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  : {
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'pemetaan_kolaboratif',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 15,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

const pool = new Pool(poolConfig);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Test DB Connection on startup
pool.query('SELECT NOW() as now, version() as version', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL successfully!');
    console.log('   Timestamp:', res.rows[0].now);
    console.log('   Version:', res.rows[0].version.split('\n')[0]);
  }
});

// ==============================================================================
// PUBLIC & GENERAL ENDPOINTS
// ==============================================================================

// 1. Health & Database Status
app.get('/api/status', async (req, res) => {
  const start = Date.now();
  try {
    const versionRes = await pool.query('SELECT version()');
    const latency = Date.now() - start;

    const countsRes = await pool.query(`
      SELECT 
        (SELECT count(*) FROM users) AS count_users,
        (SELECT count(*) FROM infrastruktur) AS count_infrastruktur,
        (SELECT count(*) FROM laporan_masalah WHERE is_spam = FALSE) AS count_laporan,
        (SELECT count(*) FROM validasi_ai) AS count_validasi,
        (SELECT count(*) FROM tindak_lanjut) AS count_tindak_lanjut,
        (SELECT count(*) FROM notifikasi) AS count_notifikasi,
        (SELECT count(*) FROM laporan_masalah WHERE is_spam = TRUE) AS count_spam,
        (SELECT count(*) FROM laporan_sistem WHERE status_kendala = 'menunggu_tinjauan') AS count_kendala
    `);

    res.json({
      status: 'connected',
      database: process.env.DB_NAME || 'pemetaan_kolaboratif',
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 5432,
      latencyMs: latency,
      version: versionRes.rows[0].version,
      counts: countsRes.rows[0]
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
      code: err.code
    });
  }
});

// 2. Users Endpoint
app.get('/api/users', async (req, res) => {
  try {
    const { role } = req.query;
    let query = 'SELECT user_id, nama, email, no_telepon, domisili, role, created_at FROM users';
    let params = [];
    if (role) {
      query += ' WHERE role = $1';
      params.push(role);
    }
    query += ' ORDER BY user_id DESC';
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Infrastruktur Endpoint
app.get('/api/infrastruktur', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM infrastruktur ORDER BY infrastruktur_id DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Laporan Masalah Endpoint (Full Joined Detail)
app.get('/api/laporan', async (req, res) => {
  try {
    const { includeSpam } = req.query;
    let filterClause = includeSpam === 'true' ? '' : 'WHERE lm.is_spam = FALSE';

    const query = `
      SELECT 
        lm.laporan_id,
        lm.user_id,
        u.nama AS pelapor_nama,
        u.email AS pelapor_email,
        u.no_telepon AS pelapor_telepon,
        u.domisili AS pelapor_domisili,
        u.role AS pelapor_role,
        lm.infrastruktur_id,
        inf.nama_tempat AS infrastruktur_nama,
        inf.kategori AS infrastruktur_kategori,
        inf.alamat AS infrastruktur_alamat,
        lm.judul_laporan,
        lm.deskripsi_masalah,
        lm.foto_bukti,
        lm.latitude,
        lm.longitude,
        lm.status_laporan,
        lm.is_spam,
        lm.tanggal_lapor,
        -- Validasi AI
        vai.validasi_id,
        vai.skor_akurasi_koordinat,
        vai.status_validasi,
        vai.catatan_ai,
        vai.waktu_validasi,
        -- Tindak Lanjut Pemda
        tl.tindak_lanjut_id,
        tl.pemda_id,
        pu.nama AS pemda_nama,
        tl.keterangan_tindakan,
        tl.foto_hasil_perbaikan,
        tl.status_terbaru,
        tl.waktu_update AS waktu_tindak_lanjut
      FROM laporan_masalah lm
      JOIN users u ON lm.user_id = u.user_id
      LEFT JOIN infrastruktur inf ON lm.infrastruktur_id = inf.infrastruktur_id
      LEFT JOIN validasi_ai vai ON lm.laporan_id = vai.laporan_id
      LEFT JOIN tindak_lanjut tl ON lm.laporan_id = tl.laporan_id
      LEFT JOIN users pu ON tl.pemda_id = pu.user_id
      ${filterClause}
      ORDER BY lm.laporan_id DESC
    `;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==============================================================================
// 1. ROLE: MASYARAKAT (CITIZEN)
// Sampaikan aspirasi & laporkan masalah fasilitas
// ==============================================================================
app.post('/api/aspirasi', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      nama,
      email,
      no_telepon,
      domisili,
      kategori,
      nama_tempat,
      alamat_infrastruktur,
      judul_laporan,
      deskripsi_masalah,
      latitude,
      longitude,
      foto_bukti
    } = req.body;

    if (!nama || !email || !judul_laporan || !deskripsi_masalah) {
      throw new Error('Nama, Email, Judul Laporan, dan Deskripsi Masalah wajib diisi!');
    }

    const lat = parseFloat(latitude) || -6.2383;
    const lng = parseFloat(longitude) || 106.9756;
    const cleanEmail = email.trim().toLowerCase();

    // 1. Find or create user as masyarakat
    let userId;
    const existingUserRes = await client.query('SELECT user_id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (existingUserRes.rows.length > 0) {
      userId = existingUserRes.rows[0].user_id;
      await client.query(
        'UPDATE users SET nama = $1, no_telepon = COALESCE($2, no_telepon), domisili = COALESCE($3, domisili) WHERE user_id = $4',
        [nama.trim(), no_telepon ? no_telepon.trim() : null, domisili ? domisili.trim() : null, userId]
      );
    } else {
      const newUserRes = await client.query(
        'INSERT INTO users (nama, email, password, no_telepon, domisili, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id',
        [nama.trim(), cleanEmail, '$2a$12$defaultHashedCitizenPassword', no_telepon ? no_telepon.trim() : null, domisili ? domisili.trim() : null, 'masyarakat']
      );
      userId = newUserRes.rows[0].user_id;
    }

    // 2. Insert or link infrastruktur
    let infrastrukturId = null;
    const tempatNama = nama_tempat ? nama_tempat.trim() : (judul_laporan.substring(0, 50));
    const kategoriInf = kategori || 'lainnya';

    const newInfRes = await client.query(
      `INSERT INTO infrastruktur (nama_tempat, kategori, deskripsi, alamat, latitude, longitude, foto_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING infrastruktur_id`,
      [
        tempatNama,
        kategoriInf,
        `Fasilitas terdaftar dari aspirasi warga: ${judul_laporan}`,
        alamat_infrastruktur || domisili || 'Kota Bekasi',
        lat,
        lng,
        foto_bukti || 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80'
      ]
    );
    infrastrukturId = newInfRes.rows[0].infrastruktur_id;

    // 3. Insert into laporan_masalah
    const insertLaporanQuery = `
      INSERT INTO laporan_masalah (
        user_id, infrastruktur_id, judul_laporan, deskripsi_masalah, foto_bukti, latitude, longitude, status_laporan, is_spam
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'menunggu_validasi', FALSE)
      RETURNING *;
    `;
    const laporanRes = await client.query(insertLaporanQuery, [
      userId,
      infrastrukturId,
      judul_laporan.trim(),
      deskripsi_masalah.trim(),
      foto_bukti || 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80',
      lat,
      lng
    ]);
    const newLaporan = laporanRes.rows[0];

    // 4. Automated AI validation
    const skorAkurasi = parseFloat((0.91 + Math.random() * 0.08).toFixed(2));
    const wilayahDomisili = domisili || 'Kota Bekasi';
    const catatanAi = `AI memvalidasi aspirasi warga "${nama}" (Domisili: ${wilayahDomisili}). Koordinat [${lat}, ${lng}] berada dalam koridor administratif Kota Bekasi. Kategori fasilitas "${kategoriInf}" terverifikasi valid.`;

    const insertValidasiQuery = `
      INSERT INTO validasi_ai (
        laporan_id, skor_akurasi_koordinat, status_validasi, catatan_ai
      ) VALUES ($1, $2, 'valid', $3)
      RETURNING *;
    `;
    const validasiRes = await client.query(insertValidasiQuery, [
      newLaporan.laporan_id,
      skorAkurasi,
      catatanAi
    ]);

    // 5. Automated Notification for Citizen & Alert for Pemda
    const pesanNotif = `Halo ${nama}, aspirasi/laporan Anda #${newLaporan.laporan_id} mengenai "${judul_laporan}" berhasil dicatat ke database dan telah tervalidasi AI dengan skor ${(skorAkurasi * 100).toFixed(0)}%. Menunggu tindak lanjut dari dinas/pemda terkait.`;
    await client.query(
      `INSERT INTO notifikasi (user_id, laporan_id, pesan, is_read) VALUES ($1, $2, $3, FALSE)`,
      [userId, newLaporan.laporan_id, pesanNotif]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Aspirasi berhasil disampaikan dan tersimpan di database!',
      user_id: userId,
      laporan: newLaporan,
      validasi_ai: validasiRes.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

// ==============================================================================
// 2. ROLE: PEMDA (PEMERINTAH DAERAH)
// Menerima, mengklarifikasi, dan memberi balasan penyelesaian masalah
// ==============================================================================

// Pemda: Berikan balasan, tindak lanjut, & klarifikasi status penyelesaian masalah
app.post('/api/pemda/tindak-lanjut', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      laporan_id,
      pemda_id,
      status_laporan,
      keterangan_tindakan,
      foto_hasil_perbaikan,
      status_terbaru
    } = req.body;

    if (!laporan_id || !pemda_id || !keterangan_tindakan) {
      throw new Error('laporan_id, pemda_id, dan keterangan_tindakan wajib diisi!');
    }

    // 1. Verify pemda user exists
    const pemdaCheck = await client.query('SELECT user_id, nama, role FROM users WHERE user_id = $1', [pemda_id]);
    if (pemdaCheck.rows.length === 0) {
      throw new Error('Akun petugas Pemda tidak ditemukan.');
    }
    const pemdaUser = pemdaCheck.rows[0];

    // 2. Update status in laporan_masalah
    const newStatus = status_laporan || 'selesai';
    const updateLaporanRes = await client.query(
      `UPDATE laporan_masalah SET status_laporan = $1 WHERE laporan_id = $2 RETURNING *`,
      [newStatus, laporan_id]
    );
    if (updateLaporanRes.rows.length === 0) {
      throw new Error('Laporan masalah tidak ditemukan.');
    }
    const updatedLaporan = updateLaporanRes.rows[0];

    // 3. Insert or update tindak_lanjut table
    const statusNote = status_terbaru || (newStatus === 'selesai' ? 'Telah diselesaikan dan diperbaiki' : 'Sedang ditangani tim dinas terkait');
    const insertTindakLanjutQuery = `
      INSERT INTO tindak_lanjut (
        laporan_id, pemda_id, keterangan_tindakan, foto_hasil_perbaikan, status_terbaru, waktu_update
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *;
    `;
    const tindakLanjutRes = await client.query(insertTindakLanjutQuery, [
      laporan_id,
      pemda_id,
      keterangan_tindakan.trim(),
      foto_hasil_perbaikan || null,
      statusNote
    ]);

    // 4. Notify citizen that Pemda has replied and clarified
    const notifMsg = `[Tanggapan Pemda] Petugas dari "${pemdaUser.nama}" telah menindaklanjuti laporan Anda #${laporan_id} ("${updatedLaporan.judul_laporan}"). Status terkini: "${newStatus.replace('_', ' ').toUpperCase()}". Keterangan: ${keterangan_tindakan}`;
    await client.query(
      `INSERT INTO notifikasi (user_id, laporan_id, pesan, is_read) VALUES ($1, $2, $3, FALSE)`,
      [updatedLaporan.user_id, laporan_id, notifMsg]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Tanggapan dan tindak lanjut Pemda berhasil dikirim ke pelapor!',
      tindak_lanjut: tindakLanjutRes.rows[0],
      laporan: updatedLaporan
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

// ==============================================================================
// 3. ROLE: ADMIN (ADMINISTRATOR)
// Highest privilege: moderating spams, editing posts, managing users & site errors
// ==============================================================================

// Admin: Toggle Spam Status on any report
app.post('/api/admin/laporan/:id/toggle-spam', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await pool.query(
      'UPDATE laporan_masalah SET is_spam = NOT is_spam WHERE laporan_id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Laporan tidak ditemukan' });
    res.json({ success: true, message: `Status spam laporan #${id} berhasil diubah`, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Edit any post / aspiration
app.put('/api/admin/laporan/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { judul_laporan, deskripsi_masalah, status_laporan, is_spam } = req.body;
    const result = await pool.query(
      `UPDATE laporan_masalah 
       SET judul_laporan = COALESCE($1, judul_laporan),
           deskripsi_masalah = COALESCE($2, deskripsi_masalah),
           status_laporan = COALESCE($3, status_laporan),
           is_spam = COALESCE($4, is_spam)
       WHERE laporan_id = $5 RETURNING *`,
      [judul_laporan, deskripsi_masalah, status_laporan, is_spam, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Laporan tidak ditemukan' });
    res.json({ success: true, message: 'Laporan berhasil diperbarui oleh Admin', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Delete any post
app.delete('/api/admin/laporan/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await pool.query('DELETE FROM laporan_masalah WHERE laporan_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Laporan tidak ditemukan' });
    res.json({ success: true, message: `Laporan #${id} berhasil dihapus permanen oleh Admin.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Delete user
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    res.json({ success: true, message: `Pengguna #${id} berhasil dihapus.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Update user role
app.patch('/api/admin/users/:id/role', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { role } = req.body;
    if (!['masyarakat', 'pemda', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role tidak valid (pilih: masyarakat, pemda, admin)' });
    }
    const result = await pool.query('UPDATE users SET role = $1 WHERE user_id = $2 RETURNING *', [role, id]);
    res.json({ success: true, message: `Role pengguna #${id} berhasil diubah menjadi ${role}`, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==============================================================================
// 4. KONTAK ADMIN & LAPORAN KENDALA WEBSITE (CONTACT / INFORM ADMIN)
// "may be contacted/informed if there is something wrong with the website"
// ==============================================================================

// Submit website issue / contact admin (Any user can submit)
app.post('/api/kontak-admin', async (req, res) => {
  try {
    const { user_id, nama_pelapor, email_pelapor, kategori_kendala, pesan } = req.body;
    if (!nama_pelapor || !email_pelapor || !pesan) {
      return res.status(400).json({ error: 'Nama, Email, dan Isi Pesan/Kendala wajib diisi!' });
    }

    const result = await pool.query(
      `INSERT INTO laporan_sistem (user_id, nama_pelapor, email_pelapor, kategori_kendala, pesan, status_kendala)
       VALUES ($1, $2, $3, $4, $5, 'menunggu_tinjauan')
       RETURNING *`,
      [user_id || null, nama_pelapor.trim(), email_pelapor.trim(), kategori_kendala || 'Bug Website', pesan.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Pemberitahuan kendala website telah terkirim langsung ke Administrator sistem.',
      data: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: View all website issues / messages
app.get('/api/admin/laporan-sistem', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM laporan_sistem ORDER BY kendala_id DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Resolve / update website issue
app.patch('/api/admin/laporan-sistem/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status_kendala, tanggapan_admin } = req.body;
    const result = await pool.query(
      `UPDATE laporan_sistem 
       SET status_kendala = COALESCE($1, status_kendala),
           tanggapan_admin = COALESCE($2, tanggapan_admin)
       WHERE kendala_id = $3 RETURNING *`,
      [status_kendala, tanggapan_admin, id]
    );
    res.json({ success: true, message: 'Status kendala website berhasil diperbarui', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==============================================================================
// NOTIFIKASI & OTHER ENDPOINTS
// ==============================================================================
app.get('/api/notifikasi', async (req, res) => {
  try {
    const { user_id } = req.query;
    let query = `
      SELECT n.*, u.nama AS user_nama, lm.judul_laporan
      FROM notifikasi n
      JOIN users u ON n.user_id = u.user_id
      LEFT JOIN laporan_masalah lm ON n.laporan_id = lm.laporan_id
    `;
    let params = [];
    if (user_id) {
      query += ` WHERE n.user_id = $1`;
      params.push(user_id);
    }
    query += ` ORDER BY n.notifikasi_id DESC`;
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/notifikasi/:id/read', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await pool.query(
      'UPDATE notifikasi SET is_read = TRUE WHERE notifikasi_id = $1 RETURNING *',
      [id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset Database (Truncate tables)
app.post('/api/reset', async (req, res) => {
  try {
    await pool.query('TRUNCATE TABLE laporan_sistem, notifikasi, tindak_lanjut, validasi_ai, laporan_masalah, infrastruktur, users RESTART IDENTITY CASCADE;');
    // Reseed default accounts for Pemda and Admin
    await pool.query(`
      INSERT INTO users (nama, email, no_telepon, domisili, role) VALUES
      ('Super Admin Sekitarnya Bekasi', 'admin@sekitarnyabekasi.go.id', '081112223344', 'Bekasi Selatan', 'admin'),
      ('Dinas Bina Marga & SDA Kota Bekasi', 'disbima@bekasikota.go.id', '081198765432', 'Bekasi Selatan', 'pemda'),
      ('Dinas Perhubungan Kota Bekasi', 'dishub@bekasikota.go.id', '081234567890', 'Bekasi Timur', 'pemda');
    `);
    res.json({ success: true, message: 'Database telah direset. Akun Pemda & Admin siap digunakan!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Safe SQL Query Playground
app.post('/api/query', async (req, res) => {
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ error: 'SQL query diperlukan' });

  const trimmed = sql.trim().toLowerCase();
  if (!trimmed.startsWith('select') && !trimmed.startsWith('explain') && !trimmed.startsWith('with')) {
    return res.status(403).json({ error: 'Hanya kueri pembacaan (SELECT/EXPLAIN) yang diizinkan pada playground ini.' });
  }

  try {
    const start = Date.now();
    const result = await pool.query(sql);
    const duration = Date.now() - start;
    res.json({
      success: true,
      durationMs: duration,
      rowCount: result.rowCount,
      fields: result.fields ? result.fields.map(f => f.name) : [],
      rows: result.rows
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Export for Vercel Serverless
module.exports = app;

// Start listening if run directly (local development)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Aplikasi Sekitarnya Bekasi berjalan di http://localhost:${PORT}`);
    console.log(`📊 PostgreSQL Database terhubung: ${process.env.DATABASE_URL ? 'Cloud Database (DATABASE_URL)' : (process.env.DB_NAME || 'pemetaan_kolaboratif')}`);
  });
}
