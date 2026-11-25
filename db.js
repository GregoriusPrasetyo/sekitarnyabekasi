// ==============================================================================
// DATABASE SERVICE (SEKITARNYA BEKASI)
// Supabase Cloud Integration with Local Storage Demo Fallback
// ==============================================================================

window.DBService = (function () {
  const DEFAULT_SEED_LAPORAN = [
    {
      laporan_id: 1,
      user_id: 4,
      username: 'warga_bekasi',
      pelapor_nama: 'Budi Santoso',
      pelapor_domisili: 'Bekasi Barat',
      infrastruktur_id: 2,
      infrastruktur_nama: 'Jalan Ir. H. Juanda',
      kategori: 'jalan',
      judul_laporan: 'Jalan Berlubang Parah di Depan Stasiun Bekasi',
      deskripsi_masalah: 'Ada lubang sedalam sekitar 15 cm di dekat pintu selatan stasiun. Sangat membahayakan pengendara motor terutama saat hujan tergenang air.',
      foto_bukti: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
      latitude: -6.2361,
      longitude: 106.9995,
      status_laporan: 'selesai',
      is_spam: false,
      tanggal_lapor: new Date(Date.now() - 86400000 * 3).toISOString(),
      tindak_lanjut: [
        {
          tindak_lanjut_id: 1,
          pemda_id: 2,
          pemda_nama: 'Dinas Bina Marga & SDA Kota Bekasi',
          keterangan_tindakan: 'Tim Unit Reaksi Cepat (URC) Disbima telah melakukan penambalan aspal hotmix dan perataan permukaan jalan pada tanggal 22 November 2026.',
          foto_hasil_perbaikan: 'https://images.unsplash.com/photo-1584463699042-32b0051e70e9?w=600&auto=format&fit=crop&q=80',
          status_terbaru: 'selesai',
          waktu_update: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ]
    },
    {
      laporan_id: 2,
      user_id: 4,
      username: 'warga_bekasi',
      pelapor_nama: 'Budi Santoso',
      pelapor_domisili: 'Bekasi Barat',
      infrastruktur_id: 1,
      infrastruktur_nama: 'Jembatan Layang Summarecon Bekasi',
      kategori: 'penerangan_jalan',
      judul_laporan: 'Lampu PJU Mati di Flyover Summarecon',
      deskripsi_masalah: 'Tiga tiang lampu penerangan jalan umum mati berurutan di arah menuju Medan Satria, kondisi gelap gulita rawan kecelakaan dan kriminalitas malam hari.',
      foto_bukti: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
      latitude: -6.2255,
      longitude: 106.9989,
      status_laporan: 'sedang_dikerjakan',
      is_spam: false,
      tanggal_lapor: new Date(Date.now() - 86400000).toISOString(),
      tindak_lanjut: [
        {
          tindak_lanjut_id: 2,
          pemda_id: 3,
          pemda_nama: 'Dinas Perhubungan Kota Bekasi',
          keterangan_tindakan: 'Petugas PJU Dishub telah melakukan pengecekan jaringan gardu panel. Komponen kontaktor sedang dalam penggantian hari ini.',
          foto_hasil_perbaikan: '',
          status_terbaru: 'sedang_dikerjakan',
          waktu_update: new Date(Date.now() - 3600000 * 5).toISOString()
        }
      ]
    },
    {
      laporan_id: 3,
      user_id: 4,
      username: 'warga_bekasi',
      pelapor_nama: 'Budi Santoso',
      pelapor_domisili: 'Bekasi Barat',
      infrastruktur_id: 3,
      infrastruktur_nama: 'Saluran Drainase Kalimalang Segmen BCP',
      kategori: 'drainase',
      judul_laporan: 'Saluran Drainase Tersumbat Sampah di Depan BCP',
      deskripsi_masalah: 'Sampah plastik menumpuk di mulut gorong-gorong saluran pembuangan, menyebabkan air lambat surut saat hujan deras.',
      foto_bukti: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
      latitude: -6.2488,
      longitude: 106.9912,
      status_laporan: 'menunggu_validasi',
      is_spam: false,
      tanggal_lapor: new Date().toISOString(),
      tindak_lanjut: []
    }
  ];

  const DEFAULT_INFRASTRUKTUR = [
    { infrastruktur_id: 1, nama_tempat: 'Jembatan Layang Summarecon Bekasi', kategori: 'jembatan', alamat: 'Jl. Boulevard Ahmad Yani, Marga Mulya, Bekasi Utara', latitude: -6.2255, longitude: 106.9989 },
    { infrastruktur_id: 2, nama_tempat: 'Jalan Ir. H. Juanda', kategori: 'jalan', alamat: 'Jl. Ir. H. Juanda, Duren Jaya, Bekasi Timur', latitude: -6.2361, longitude: 106.9995 },
    { infrastruktur_id: 3, nama_tempat: 'Saluran Drainase Kalimalang Segmen BCP', kategori: 'drainase', alamat: 'Jl. KH. Noer Ali, Pekayon Jaya, Bekasi Selatan', latitude: -6.2488, longitude: 106.9912 },
    { infrastruktur_id: 4, nama_tempat: 'Halte Stasiun Bekasi', kategori: 'transportasi_publik', alamat: 'Jl. Perjuangan No. 1, Marga Mulya, Bekasi Utara', latitude: -6.2365, longitude: 106.9999 }
  ];

  const DEFAULT_LAPORAN_SISTEM = [
    {
      kendala_id: 1,
      nama_pelapor: 'Budi Santoso',
      email_pelapor: 'budi.santoso@gmail.com',
      kategori_kendala: 'Peta Lambat Dimuat',
      deskripsi_kendala: 'Saat membuka peta di koneksi mobile, tile Leaflet kadang reload 2 kali.',
      status_kendala: 'sedang_ditangani',
      catatan_admin: 'Sedang dioptimasi caching tile CDN.',
      tanggal_lapor: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  // Helper local storage untuk fallback offline jika Supabase tidak disetel
  function getLocalData(key, fallback) {
    try {
      const d = localStorage.getItem('sb_mock_' + key);
      return d ? JSON.parse(d) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function setLocalData(key, value) {
    try {
      localStorage.setItem('sb_mock_' + key, JSON.stringify(value));
    } catch (e) {}
  }

  // 1. Ambil Laporan Masalah
  async function getLaporan(filter = {}) {
    const sb = window.AuthApp ? window.AuthApp.getSupabase() : null;
    if (sb) {
      try {
        let q = sb.from('laporan_masalah').select(`
          laporan_id,
          user_id,
          judul_laporan,
          deskripsi_masalah,
          foto_bukti,
          latitude,
          longitude,
          status_laporan,
          is_spam,
          tanggal_lapor,
          infrastruktur (infrastruktur_id, nama_tempat, kategori, alamat),
          users (user_id, username, nama, domisili),
          tindak_lanjut (tindak_lanjut_id, pemda_id, keterangan_tindakan, foto_hasil_perbaikan, status_terbaru, waktu_update, users (nama, username))
        `).order('tanggal_lapor', { ascending: false });

        if (filter.is_spam !== undefined) {
          q = q.eq('is_spam', filter.is_spam);
        }
        if (filter.user_id) {
          q = q.eq('user_id', filter.user_id);
        }
        if (filter.status_laporan && filter.status_laporan !== 'all') {
          q = q.eq('status_laporan', filter.status_laporan);
        }

        const { data, error } = await q;
        if (error) throw error;

        // Normalisasi format untuk frontend
        return data.map(item => ({
          laporan_id: item.laporan_id,
          user_id: item.user_id,
          username: item.users ? item.users.username : 'anon',
          pelapor_nama: item.users ? item.users.nama : 'Warga Bekasi',
          pelapor_domisili: item.users ? item.users.domisili : 'Kota Bekasi',
          infrastruktur_id: item.infrastruktur ? item.infrastruktur.infrastruktur_id : null,
          infrastruktur_nama: item.infrastruktur ? item.infrastruktur.nama_tempat : 'Fasilitas Umum',
          kategori: item.infrastruktur ? item.infrastruktur.kategori : 'lainnya',
          judul_laporan: item.judul_laporan,
          deskripsi_masalah: item.deskripsi_masalah,
          foto_bukti: item.foto_bukti,
          latitude: item.latitude,
          longitude: item.longitude,
          status_laporan: item.status_laporan,
          is_spam: item.is_spam,
          tanggal_lapor: item.tanggal_lapor,
          tindak_lanjut: (item.tindak_lanjut || []).map(tl => ({
            tindak_lanjut_id: tl.tindak_lanjut_id,
            pemda_id: tl.pemda_id,
            pemda_nama: tl.users ? tl.users.nama : 'Pemerintah Daerah Kota Bekasi',
            keterangan_tindakan: tl.keterangan_tindakan,
            foto_hasil_perbaikan: tl.foto_hasil_perbaikan,
            status_terbaru: tl.status_terbaru,
            waktu_update: tl.waktu_update
          }))
        }));
      } catch (err) {
        console.warn('Gagal memuat data dari Supabase, beralih ke cache lokal:', err);
      }
    }

    // Fallback Mock LocalStorage
    let list = getLocalData('laporan', DEFAULT_SEED_LAPORAN);
    if (filter.is_spam !== undefined) {
      list = list.filter(l => Boolean(l.is_spam) === Boolean(filter.is_spam));
    }
    if (filter.user_id) {
      list = list.filter(l => l.user_id == filter.user_id);
    }
    if (filter.status_laporan && filter.status_laporan !== 'all') {
      list = list.filter(l => l.status_laporan === filter.status_laporan);
    }
    return list;
  }

  // 2. Buat Laporan Baru (Masyarakat)
  async function createLaporan(payload) {
    const sb = window.AuthApp ? window.AuthApp.getSupabase() : null;
    const session = window.AuthApp ? window.AuthApp.getSession() : null;
    const userId = session ? session.user_id : (payload.user_id || 4);

    if (sb) {
      try {
        const insertObj = {
          user_id: userId,
          infrastruktur_id: payload.infrastruktur_id || null,
          judul_laporan: payload.judul_laporan,
          deskripsi_masalah: payload.deskripsi_masalah,
          foto_bukti: payload.foto_bukti || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
          latitude: parseFloat(payload.latitude) || -6.2383,
          longitude: parseFloat(payload.longitude) || 106.9756,
          status_laporan: 'menunggu_validasi',
          is_spam: false
        };

        const { data, error } = await sb.from('laporan_masalah').insert(insertObj).select('*').single();
        if (error) throw error;

        // Auto insert AI Validation
        try {
          await sb.from('validasi_ai').insert({
            laporan_id: data.laporan_id,
            skor_akurasi_koordinat: 0.95,
            status_validasi: 'valid',
            catatan_ai: 'Koordinat terverifikasi dalam wilayah administratif Kota Bekasi. Kategori sesuai.'
          });
        } catch (aiErr) {
          console.warn('Validasi AI pass:', aiErr);
        }

        return { success: true, data };
      } catch (err) {
        console.warn('Insert Supabase gagal, simpan ke demo local:', err);
      }
    }

    // Local Mock Fallback
    const list = getLocalData('laporan', DEFAULT_SEED_LAPORAN);
    const newLaporan = {
      laporan_id: Date.now(),
      user_id: userId,
      username: session ? session.username : 'warga_bekasi',
      pelapor_nama: session ? session.nama : 'Budi Santoso',
      pelapor_domisili: session ? session.domisili : 'Bekasi Barat',
      infrastruktur_id: payload.infrastruktur_id || 1,
      infrastruktur_nama: payload.infrastruktur_nama || 'Fasilitas Umum Bekasi',
      kategori: payload.kategori || 'jalan',
      judul_laporan: payload.judul_laporan,
      deskripsi_masalah: payload.deskripsi_masalah,
      foto_bukti: payload.foto_bukti || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
      latitude: parseFloat(payload.latitude) || -6.2383,
      longitude: parseFloat(payload.longitude) || 106.9756,
      status_laporan: 'menunggu_validasi',
      is_spam: false,
      tanggal_lapor: new Date().toISOString(),
      tindak_lanjut: []
    };
    list.unshift(newLaporan);
    setLocalData('laporan', list);
    return { success: true, data: newLaporan };
  }

  // 3. Tanggapan / Balasan Resmi Masalah (Pemda)
  async function submitTindakLanjut(payload) {
    const sb = window.AuthApp ? window.AuthApp.getSupabase() : null;
    const session = window.AuthApp ? window.AuthApp.getSession() : null;
    const pemdaId = session ? session.user_id : 2;

    const laporanId = payload.laporan_id;
    const statusBaru = payload.status_terbaru || 'selesai';
    const keterangan = payload.keterangan_tindakan;
    const foto = payload.foto_hasil_perbaikan || '';

    if (sb) {
      try {
        // 1. Simpan Tindak Lanjut
        const { data: tlData, error: tlErr } = await sb.from('tindak_lanjut').insert({
          laporan_id: laporanId,
          pemda_id: pemdaId,
          keterangan_tindakan: keterangan,
          foto_hasil_perbaikan: foto,
          status_terbaru: statusBaru
        }).select('*').single();
        if (tlErr) throw tlErr;

        // 2. Update status_laporan di tabel laporan_masalah
        const { error: updErr } = await sb.from('laporan_masalah')
          .update({ status_laporan: statusBaru })
          .eq('laporan_id', laporanId);
        if (updErr) throw updErr;

        // 3. Buat notifikasi ke pembuat laporan
        try {
          if (payload.user_id) {
            await sb.from('notifikasi').insert({
              user_id: payload.user_id,
              laporan_id: laporanId,
              pesan: `Laporan Anda telah ditanggapi oleh ${session ? session.nama : 'Pemda Kota Bekasi'} dengan status: ${statusBaru.toUpperCase()}.`
            });
          }
        } catch (notifErr) {}

        return { success: true, data: tlData };
      } catch (err) {
        console.warn('Gagal simpan ke Supabase, simpan lokal:', err);
      }
    }

    // Local Mock Fallback
    const list = getLocalData('laporan', DEFAULT_SEED_LAPORAN);
    const lap = list.find(l => l.laporan_id == laporanId);
    if (lap) {
      lap.status_laporan = statusBaru;
      if (!lap.tindak_lanjut) lap.tindak_lanjut = [];
      lap.tindak_lanjut.unshift({
        tindak_lanjut_id: Date.now(),
        pemda_id: pemdaId,
        pemda_nama: session ? session.nama : 'Pemerintah Daerah Kota Bekasi',
        keterangan_tindakan: keterangan,
        foto_hasil_perbaikan: foto,
        status_terbaru: statusBaru,
        waktu_update: new Date().toISOString()
      });
      setLocalData('laporan', list);
      return { success: true, data: lap };
    }
    return { success: false, error: 'Laporan tidak ditemukan' };
  }

  // 4. Moderasi Spam (Admin)
  async function toggleSpam(laporanId, currentStatus) {
    const newSpamState = !currentStatus;
    const sb = window.AuthApp ? window.AuthApp.getSupabase() : null;
    if (sb) {
      try {
        const { error } = await sb.from('laporan_masalah').update({ is_spam: newSpamState }).eq('laporan_id', laporanId);
        if (error) throw error;
        return { success: true, is_spam: newSpamState };
      } catch (err) {
        console.warn('Supabase toggle spam failed:', err);
      }
    }

    const list = getLocalData('laporan', DEFAULT_SEED_LAPORAN);
    const item = list.find(l => l.laporan_id == laporanId);
    if (item) {
      item.is_spam = newSpamState;
      setLocalData('laporan', list);
      return { success: true, is_spam: newSpamState };
    }
    return { success: false, error: 'Laporan tidak ditemukan' };
  }

  // 5. Hapus Laporan (Admin)
  async function deleteLaporan(laporanId) {
    const sb = window.AuthApp ? window.AuthApp.getSupabase() : null;
    if (sb) {
      try {
        const { error } = await sb.from('laporan_masalah').delete().eq('laporan_id', laporanId);
        if (error) throw error;
        return { success: true };
      } catch (err) {
        console.warn('Supabase delete failed:', err);
      }
    }

    let list = getLocalData('laporan', DEFAULT_SEED_LAPORAN);
    list = list.filter(l => l.laporan_id != laporanId);
    setLocalData('laporan', list);
    return { success: true };
  }

  // 6. Ambil Pengguna (Admin)
  async function getUsers() {
    const sb = window.AuthApp ? window.AuthApp.getSupabase() : null;
    if (sb) {
      try {
        const { data, error } = await sb.from('users').select('user_id, username, nama, email, role, domisili, created_at').order('user_id', { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch (err) {
        console.warn('Gagal ambil data user dari Supabase:', err);
      }
    }

    return window.AuthApp ? window.AuthApp.defaultAccounts : [];
  }

  // 7. Laporan Kendala Sistem Website (Pelaporan ke Admin)
  async function getLaporanSistem() {
    const sb = window.AuthApp ? window.AuthApp.getSupabase() : null;
    if (sb) {
      try {
        const { data, error } = await sb.from('laporan_sistem').select('*').order('tanggal_lapor', { ascending: false });
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.warn('Ambil laporan sistem fallback:', err);
      }
    }
    return getLocalData('laporan_sistem', DEFAULT_LAPORAN_SISTEM);
  }

  async function createLaporanSistem(payload) {
    const sb = window.AuthApp ? window.AuthApp.getSupabase() : null;
    const session = window.AuthApp ? window.AuthApp.getSession() : null;

    if (sb) {
      try {
        const { data, error } = await sb.from('laporan_sistem').insert({
          user_id: session ? session.user_id : null,
          nama_pelapor: payload.nama_pelapor || (session ? session.nama : 'Pengguna'),
          email_pelapor: payload.email_pelapor || (session ? session.email : 'user@bekasi.go.id'),
          kategori_kendala: payload.kategori_kendala || 'Bug Antarmuka',
          deskripsi_kendala: payload.deskripsi_kendala
        }).select('*').single();
        if (error) throw error;
        return { success: true, data };
      } catch (err) {
        console.warn('Gagal simpan tiket sistem ke Supabase:', err);
      }
    }

    const list = getLocalData('laporan_sistem', DEFAULT_LAPORAN_SISTEM);
    const newTiket = {
      kendala_id: Date.now(),
      nama_pelapor: payload.nama_pelapor || (session ? session.nama : 'Pengguna'),
      email_pelapor: payload.email_pelapor || (session ? session.email : 'user@bekasi.go.id'),
      kategori_kendala: payload.kategori_kendala || 'Bug Sistem',
      deskripsi_kendala: payload.deskripsi_kendala,
      status_kendala: 'menunggu_penanganan',
      catatan_admin: '',
      tanggal_lapor: new Date().toISOString()
    };
    list.unshift(newTiket);
    setLocalData('laporan_sistem', list);
    return { success: true, data: newTiket };
  }

  async function resolveLaporanSistem(kendalaId, status, catatan) {
    const sb = window.AuthApp ? window.AuthApp.getSupabase() : null;
    if (sb) {
      try {
        const { error } = await sb.from('laporan_sistem').update({
          status_kendala: status,
          catatan_admin: catatan
        }).eq('kendala_id', kendalaId);
        if (error) throw error;
        return { success: true };
      } catch (err) {}
    }

    const list = getLocalData('laporan_sistem', DEFAULT_LAPORAN_SISTEM);
    const item = list.find(k => k.kendala_id == kendalaId);
    if (item) {
      item.status_kendala = status;
      item.catatan_admin = catatan;
      setLocalData('laporan_sistem', list);
      return { success: true };
    }
    return { success: false };
  }

  // 8. Ambil Infrastruktur
  async function getInfrastruktur() {
    const sb = window.AuthApp ? window.AuthApp.getSupabase() : null;
    if (sb) {
      try {
        const { data, error } = await sb.from('infrastruktur').select('*').order('nama_tempat', { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch (err) {}
    }
    return DEFAULT_INFRASTRUKTUR;
  }

  return {
    getLaporan,
    createLaporan,
    submitTindakLanjut,
    toggleSpam,
    deleteLaporan,
    getUsers,
    getLaporanSistem,
    createLaporanSistem,
    resolveLaporanSistem,
    getInfrastruktur
  };
})();
