// ==============================================================================
// AUTH & SUPABASE CLIENT HELPER (SEKITARNYA BEKASI)
// Mendukung Login & Sign Up untuk Masyarakat, Pemda, dan Admin
// ==============================================================================

window.AuthApp = (function () {
  let sbClient = null;

  // 1. Ambil Kredensial Supabase
  function getCredentials() {
    const storedUrl = localStorage.getItem('supabase_url');
    const storedKey = localStorage.getItem('supabase_anon_key');
    if (storedUrl && storedKey) {
      return { url: storedUrl.trim(), key: storedKey.trim() };
    }
    if (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url && window.SUPABASE_CONFIG.anonKey) {
      return { url: window.SUPABASE_CONFIG.url.trim(), key: window.SUPABASE_CONFIG.anonKey.trim() };
    }
    return null;
  }

  // 2. Inisialisasi Supabase Client
  function getSupabase() {
    if (sbClient) return sbClient;
    const creds = getCredentials();
    if (creds && creds.url && creds.key && window.supabase) {
      try {
        sbClient = window.supabase.createClient(creds.url, creds.key);
      } catch (e) {
        console.warn('Gagal menginisialisasi client Supabase:', e);
      }
    }
    return sbClient;
  }

  // 3. Validasi Password Berdasarkan Ketentuan:
  // - Huruf kecil & besar (mixed lower & upper cases)
  // - Minimum 8 karakter
  // - Mengandung simbol / karakter khusus
  function validatePassword(password) {
    const minLength = (password || '').length >= 8;
    const hasLower = /[a-z]/.test(password || '');
    const hasUpper = /[A-Z]/.test(password || '');
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password || '');

    const valid = minLength && hasLower && hasUpper && hasSymbol;
    return {
      valid,
      minLength,
      hasLower,
      hasUpper,
      hasSymbol,
      message: valid ? 'Password memenuhi syarat' : 'Password harus minimal 8 karakter, kombinasi huruf besar & kecil, serta simbol.'
    };
  }

  // 4. Session Management
  function getSession() {
    try {
      const data = localStorage.getItem('sekitarnyabekasi_session');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(user) {
    localStorage.setItem('sekitarnyabekasi_session', JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem('sekitarnyabekasi_session');
  }

  function logout(redirectPath) {
    clearSession();
    window.location.href = redirectPath || 'index.html';
  }

  // 5. Akun Standar / Fallback Cepat (Memastikan Akun Selalu Dapat Diuji)
  const defaultAccounts = [
    {
      user_id: 1,
      username: 'admin',
      nama: 'Super Administrator',
      email: 'admin@sekitarnyabekasi.go.id',
      password: 'Un1qu3Ech!na4@',
      role: 'admin',
      domisili: 'Bekasi Selatan'
    },
    {
      user_id: 2,
      username: 'disbima_bekasi',
      nama: 'Dinas Bina Marga & SDA Kota Bekasi',
      email: 'disbima@bekasikota.go.id',
      password: 'PemdaBima2026!',
      role: 'pemda',
      domisili: 'Bekasi Selatan'
    },
    {
      user_id: 3,
      username: 'dishub_bekasi',
      nama: 'Dinas Perhubungan Kota Bekasi',
      email: 'dishub@bekasikota.go.id',
      password: 'DishubBks2026!',
      role: 'pemda',
      domisili: 'Bekasi Timur'
    },
    {
      user_id: 4,
      username: 'warga_bekasi',
      nama: 'Budi Santoso',
      email: 'budi.santoso@gmail.com',
      password: 'WargaBks2026!',
      role: 'masyarakat',
      domisili: 'Bekasi Barat'
    }
  ];

  // 6. Login Handler per Role
  async function login(role, identifier, password) {
    const idClean = (identifier || '').trim();
    const pwClean = (password || '').trim();

    // Verifikasi Khusus Admin (Constraint: username -> admin, password -> Un1qu3Ech!na4@)
    if (role === 'admin') {
      if (idClean === 'admin' && pwClean === 'Un1qu3Ech!na4@') {
        const adminUser = defaultAccounts.find(a => a.username === 'admin');
        setSession(adminUser);
        return { success: true, user: adminUser };
      } else {
        return { success: false, error: 'Username atau Password Admin salah! (Gunakan username: admin)' };
      }
    }

    const client = getSupabase();

    // Jika Supabase terhubung, query langsung ke tabel users
    if (client) {
      try {
        let query = client.from('users').select('*').eq('role', role).eq('password', pwClean);
        if (role === 'masyarakat') {
          // Masyarakat: login = username or email, password
          query = query.or(`username.eq.${idClean},email.eq.${idClean.toLowerCase()}`);
        } else if (role === 'pemda') {
          // PEMDA: login = username, password
          query = query.eq('username', idClean);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data && data.length > 0) {
          const user = data[0];
          setSession(user);
          return { success: true, user };
        }
      } catch (err) {
        console.warn('Supabase query error, mencoba verifikasi akun lokal:', err);
      }
    }

    // Fallback verifikasi akun default / demo jika Supabase belum terisi
    let matched = null;
    if (role === 'masyarakat') {
      matched = defaultAccounts.find(a => 
        a.role === 'masyarakat' && 
        (a.username.toLowerCase() === idClean.toLowerCase() || a.email.toLowerCase() === idClean.toLowerCase()) && 
        a.password === pwClean
      );
    } else if (role === 'pemda') {
      matched = defaultAccounts.find(a => 
        a.role === 'pemda' && 
        a.username.toLowerCase() === idClean.toLowerCase() && 
        a.password === pwClean
      );
    }

    if (matched) {
      setSession(matched);
      return { success: true, user: matched };
    }

    return { success: false, error: 'Kredensial login tidak cocok. Pastikan username/email dan password sudah benar.' };
  }

  // 7. Sign Up Handler (Masyarakat & Pemda)
  async function signUp(role, payload) {
    const { username, email, password, nama, domisili, no_telepon } = payload;

    // Validasi Password Sesuai Constraint
    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return { success: false, error: pwCheck.message };
    }

    const uNameClean = (username || '').trim().toLowerCase();
    const emailClean = (email || '').trim().toLowerCase();

    if (!uNameClean || !emailClean || !password) {
      return { success: false, error: 'Username, Email, dan Password wajib diisi!' };
    }

    const client = getSupabase();
    if (client) {
      try {
        // Cek duplikasi username atau email
        const { data: existing } = await client.from('users')
          .select('username, email')
          .or(`username.eq.${uNameClean},email.eq.${emailClean}`);

        if (existing && existing.length > 0) {
          const isU = existing.some(e => e.username === uNameClean);
          return { success: false, error: isU ? 'Username sudah terdaftar! Pilih username lain.' : 'Email sudah terdaftar!' };
        }

        const newUser = {
          username: uNameClean,
          nama: (nama || uNameClean).trim(),
          email: emailClean,
          password: password.trim(),
          domisili: domisili || 'Bekasi',
          no_telepon: no_telepon || '',
          role: role
        };

        const { data, error } = await client.from('users').insert(newUser).select('*').single();
        if (error) throw error;

        setSession(data);
        return { success: true, user: data };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    // Demo Mode Sign Up
    const newUser = {
      user_id: Date.now(),
      username: uNameClean,
      nama: (nama || uNameClean).trim(),
      email: emailClean,
      password: password.trim(),
      domisili: domisili || 'Bekasi',
      no_telepon: no_telepon || '',
      role: role
    };
    defaultAccounts.push(newUser);
    setSession(newUser);
    return { success: true, user: newUser };
  }

  return {
    getCredentials,
    getSupabase,
    validatePassword,
    getSession,
    setSession,
    clearSession,
    logout,
    login,
    signUp,
    defaultAccounts
  };
})();
