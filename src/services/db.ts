// Centralized DB Service using LocalStorage
// This acts as a bridge to make switching to a real backend (Node.js/PostgreSQL) easier in the future.

export interface Member {
  id: string;
  nomorAnggota: string;
  namaLengkap: string;
  nik: string;
  email: string;
  password: string;
  alamat: string;
  telepon: string;
  jenisKelamin: 'L' | 'P';
  tanggalLahir: string;
  tanggalDaftar: string;
  avatarColor: string;
  avatarUrl?: string;
  bio?: string;
}

export interface Admin {
  id: string;
  namaLengkap: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin';
  tanggalDibuat: string;
  avatarColor: string;
}

export const DB_KEYS = {
  MEMBERS: 'disipusda_members',
  ADMINS: 'disipusda_admins',
  ARTICLES: 'disipusda_articles',
  BOOKS: 'disipusda_books',
  BORROWS: 'disipusda_borrows',
  REPORTS: 'disipusda_reports',
  SETTINGS: 'disipusda_settings',
  MEDIA: 'disipusda_media',
  STRUCTURE: 'disipusda_structure',
  ACHIEVEMENTS: 'disipusda_achievements',
  SCHEDULES: 'disipusda_schedules',
  SYSTEM_INFO: 'disipusda_system'
};

export const dbSave = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Dispatch a custom event so same-tab components can react
    window.dispatchEvent(new CustomEvent('dbChange', { detail: { key } }));
  } catch (err: any) {
    if (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      alert("⚠️ Memori browser (LocalStorage) sudah penuh!\n\nWebsite ini menyimpan data direktori di browser Anda. Untuk menyimpan data baru, Anda perlu menghapus beberapa Berita/Media atau Buku yang sudah ada.");
    } else {
      console.error("Gagal menyimpan ke database:", err);
      alert("Terjadi kesalahan saat menyimpan data.");
    }
  }
};

export const dbGet = <T,>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return defaultValue;
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Error reading DB key "${key}":`, err);
    return defaultValue;
  }
};

// Seed Data Manager
export const initializeDB = () => {
  // Always ensure default admins exist
  const admins = dbGet(DB_KEYS.ADMINS, []);
  if (admins.length === 0) {
    const defaultAdmins = [
      {
        id: 'A-1',
        namaLengkap: 'Super Admin',
        email: 'admin@disipusda.go.id',
        password: 'admin123',
        role: 'super_admin',
        tanggalDibuat: '14 April 2024',
        avatarColor: '#0c2f3d'
      }
    ];
    dbSave(DB_KEYS.ADMINS, defaultAdmins);
  }

  // Ensure our specific dummy user exists
  const members: Member[] = dbGet<Member[]>(DB_KEYS.MEMBERS, []);
  const dummyEmail = 'rislantristansyah@gmail.com';
  const existingDummyIndex = members.findIndex(m => m.email === dummyEmail);

  if (existingDummyIndex === -1) {
    const defaultMember: Member = {
      id: 'M-Dummy',
      nomorAnggota: 'PWK-2024-001',
      namaLengkap: 'Rislan Tristansyah',
      nik: '****************7406',
      email: dummyEmail,
      password: 'user123',
      alamat: 'Purwakarta, Jawa Barat',
      telepon: '087735167406',
      jenisKelamin: 'L',
      tanggalLahir: '1995-01-01',
      tanggalDaftar: '14 April 2024',
      avatarColor: '#8b1c24'
    };
    members.push(defaultMember);
    dbSave(DB_KEYS.MEMBERS, members);
  } else {
    // If found but using old dummy format, we could update it here
    // For now, if it exists, we leave it to let user change their password
  }
  
  // Initialize system info if empty
  const systemInfo = dbGet(DB_KEYS.SYSTEM_INFO, null);
  if (!systemInfo) {
    dbSave(DB_KEYS.SYSTEM_INFO, {
      siteName: 'Disipusda Purwakarta',
      tagline: 'Dinas Arsip & Perpustakaan Daerah Kabupaten Purwakarta',
      address: 'Jl. Veteran No. 46, Purwakarta, Jawa Barat',
      email: 'disipusda@purwakartakab.go.id',
      phone: '(0264) 200234',
      whatsapp: '081234567890',
      socials: {
        instagram: 'https://instagram.com/disipusdapwk',
        facebook: 'https://facebook.com/disipusdapwk',
        youtube: 'https://youtube.com/disipusdapwk'
      },
      logo: '',
      operatingHours: {
        weekday: '08:00 - 16:00',
        weekend: 'Tutup'
      }
    });
  }

  // Initialize structure
  const structure = dbGet<any[]>(DB_KEYS.STRUCTURE, []);
  const defaultStructure = [
    // PIMPINAN
    { id: 'S1', name: 'AAN, S.Pd.I., K.P., M.Si.', position: 'Kepala Dinas', level: 1, category: 'pimpinan', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600' },
    { id: 'S2', name: 'Dr. Kusnandar, S.Pd, M.T', position: 'Sekretaris Dinas', level: 1, category: 'pimpinan', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600' },

    // SEKRETARIAT
    { id: 'S3', name: 'Lasmi Binawati, S.E', position: 'Kepala Sub Bagian Keuangan', level: 2, category: 'sekretariat' },
    { id: 'S4', name: 'Hj. Elly Setiadewi, S.T, M.M', position: 'Analis Sumber Daya Manusia Aparatur', level: 2, category: 'sekretariat' },
    { id: 'S5', name: 'Abdul Gani, S.E, M.M', position: 'Perencana Ahli Muda', level: 2, category: 'sekretariat' },
    { id: 'S6', name: 'Rd. Ronnie Kurniawan, S.T', position: 'Bendahara Pengeluaran', level: 3, category: 'sekretariat' },
    { id: 'S7', name: 'Ika Puspita Sari', position: 'Pengelola Kepegawaian', level: 3, category: 'sekretariat' },
    { id: 'S8', name: 'Sri Cahyani', position: 'Pengadministrasi Keuangan', level: 3, category: 'sekretariat' },
    { id: 'S9', name: 'Ratni Nuryati', position: 'Pengelola Akuntansi', level: 3, category: 'sekretariat' },
    { id: 'S10', name: 'Ahmad Kosidin', position: 'Pengelola Sarana dan Prasarana', level: 3, category: 'sekretariat' },
    { id: 'S11', name: 'Abdul Rauf', position: 'Pengadministrasi Umum', level: 3, category: 'sekretariat' },
    { id: 'S12', name: 'Evi Sri Nuryanti, A.Md', position: 'JF Arsiparis Penyelia', level: 3, category: 'sekretariat' },
    { id: 'S13', name: 'Bibo Satrio, A.Md', position: 'JF Arsiparis Pelaksana Lanjutan', level: 3, category: 'sekretariat' },
    { id: 'S14', name: 'Diki Waryanto, A.Md', position: 'JF Arsiparis Pelaksana Lanjutan', level: 3, category: 'sekretariat' },
    { id: 'S15', name: 'Fabianto Wahyu K.J., S.Komp', position: 'JF Pranata Komputer Ahli Pertama', level: 3, category: 'sekretariat' },
    { id: 'S16', name: 'Hendra Irawan, S.T', position: 'JF Pranata Komputer Ahli Pertama', level: 3, category: 'sekretariat' },
    { id: 'S17', name: 'Maudina Hanifah, S.M', position: 'Pengelola Kearsipan', level: 3, category: 'sekretariat' },
    { id: 'S18', name: 'Muhammad Ghiffari', position: 'Pengelola Kearsipan', level: 3, category: 'sekretariat' },
    { id: 'S19', name: 'Zahran Labib Sulaiman', position: 'Pengelola Kearsipan', level: 3, category: 'sekretariat' },
    { id: 'S20', name: 'Setiawan', position: 'Pengelola Barang dan Jasa', level: 3, category: 'sekretariat' },
    { id: 'S21', name: 'Karyono', position: 'Petugas Kebersihan', level: 3, category: 'sekretariat' },
    { id: 'S22', name: 'Ade Jakaria', position: 'Petugas Kebersihan', level: 3, category: 'sekretariat' },
    { id: 'S23', name: 'Markuwat', position: 'Petugas Keamanan', level: 3, category: 'sekretariat' },
    { id: 'S24', name: 'Sutrisno', position: 'Petugas Kebersihan', level: 3, category: 'sekretariat' },
    { id: 'S25', name: 'Muhamad Fahri Mubarok', position: 'Petugas Keamanan', level: 3, category: 'sekretariat' },

    // DIORAMA
    { id: 'D1', name: 'Edi Rasidi, A.Md', position: 'Kepala UPTD Diorama Kearsipan', level: 2, category: 'diorama' },
    { id: 'D2', name: 'Arie Lukmanul Hakim, S.Ip', position: 'Guide', level: 3, category: 'diorama' },
    { id: 'D3', name: 'Fairuz Hadiani Mardhiyah Putri, S.Pd.M.Pd', position: 'Guide', level: 3, category: 'diorama' },
    { id: 'D4', name: 'Indri Sukma Wirawati, S.T', position: 'Guide', level: 3, category: 'diorama' },
    { id: 'D5', name: 'Chandra Januar W., S.Sos', position: 'Guide', level: 3, category: 'diorama' },
    { id: 'D6', name: 'Yopi Aprianto, S.T', position: 'Guide', level: 3, category: 'diorama' },
    { id: 'D7', name: 'Dina Meylinda, S.E', position: 'Guide', level: 3, category: 'diorama' },
    { id: 'D8', name: 'Hadi Kusuma, S.Kom', position: 'Guide', level: 3, category: 'diorama' },
    { id: 'D9', name: 'Mutia Faramida, A.Md I.Kom', position: 'Guide', level: 3, category: 'diorama' },
    { id: 'D10', name: 'Rina Sintia', position: 'Penerima Tamu', level: 3, category: 'diorama' },
    { id: 'D11', name: 'Rani Meydianti', position: 'Penerima Tamu', level: 3, category: 'diorama' },
    { id: 'D12', name: 'Amirah S. Zahra', position: 'Penerima Tamu', level: 3, category: 'diorama' },
    { id: 'D13', name: 'Erika Putri Hidayah', position: 'Penerima Tamu', level: 3, category: 'diorama' },
    { id: 'D14', name: 'Rifan Pratama', position: 'Petugas Kebersihan', level: 3, category: 'diorama' },
    { id: 'D15', name: 'Ari Riyanto', position: 'Petugas Kebersihan', level: 3, category: 'diorama' },
    { id: 'D16', name: 'Derry Wijaya Kusumah, S.M', position: 'Petugas Kebersihan', level: 3, category: 'diorama' },
    { id: 'D17', name: 'Ali Muslihat', position: 'Petugas Kebersihan', level: 3, category: 'diorama' },
    { id: 'D18', name: 'Eggy Apriyana Putra', position: 'Petugas Keamanan', level: 3, category: 'diorama' },
    { id: 'D19', name: 'Hendra Sujana', position: 'Petugas Keamanan', level: 3, category: 'diorama' },
    { id: 'D20', name: 'Muhamad Jembar', position: 'Petugas Keamanan', level: 3, category: 'diorama' },
    { id: 'D21', name: 'Enjang Hasanudin', position: 'Petugas Keamanan', level: 3, category: 'diorama' },
    { id: 'D22', name: 'Rachman Saleh', position: 'Petugas Keamanan', level: 3, category: 'diorama' },
    { id: 'D23', name: 'Muhamad Mansyur', position: 'Petugas Keamanan', level: 3, category: 'diorama' },
    { id: 'D24', name: 'Irvan Maulana', position: 'Petugas Keamanan', level: 3, category: 'diorama' },
    { id: 'D25', name: 'Zulkarnaen', position: 'Petugas Keamanan', level: 3, category: 'diorama' },
    { id: 'D26', name: 'Mohamad Saepuloh', position: 'Petugas Keamanan', level: 3, category: 'diorama' },

    // BIDANG PEMBINAAN
    { id: 'B1-1', name: 'Desi Hendrayani, S.TP, M.P', position: 'Kepala Bidang Pembinaan, Pelestarian dan Pengembangan Kearsipan', level: 2, category: 'bidang_pembinaan' },
    { id: 'B1-2', name: 'Eko Sulistiawan, S.E', position: 'Arsiparis Ahli Muda', level: 3, category: 'bidang_pembinaan' },
    
    // BIDANG PENGELOLAAN
    { id: 'B2-1', name: 'Minar R.S, S.E, M.AP', position: 'Kepala Bidang Pengelolaan dan Pemeliharaan Kearsipan', level: 2, category: 'bidang_pengelolaan' },
    
    // BIDANG LAYANAN
    { id: 'B3-1', name: 'Dra. Hj. Uce Martina, AF.MP', position: 'Kepala Bidang Layanan dan Otomasi Perpustakaan', level: 2, category: 'bidang_layanan' },
    { id: 'B3-2', name: 'Emma Hermawati, S.Sos', position: 'Pustakawan Ahli Muda', level: 3, category: 'bidang_layanan' },
    { id: 'B3-3', name: 'Ritta Utami Herawati, S.Sos', position: 'Pustakawan Ahli Muda', level: 3, category: 'bidang_layanan' },
    { id: 'B3-4', name: 'Imadudin Somantri, S.H', position: 'Pustakawan Ahli Muda', level: 3, category: 'bidang_layanan' },
    { id: 'B3-5', name: 'Farhan Kamaludin, A.Md', position: 'JF Pustakawan Terampil', level: 3, category: 'bidang_layanan' },
    { id: 'B3-6', name: 'Ajeng Indah Sulastri, A.Md', position: 'JF Pustakawan Terampil', level: 3, category: 'bidang_layanan' },
    { id: 'B3-7', name: 'Yana Supriatna', position: 'Pengelola Perpustakaan', level: 3, category: 'bidang_layanan' },
    { id: 'B3-8', name: 'Dhany Mudyana, S.Pd', position: 'Pengelola Perpustakaan', level: 3, category: 'bidang_layanan' },
    { id: 'B3-9', name: 'Muhamad Noval', position: 'Pengelola Perpustakaan', level: 3, category: 'bidang_layanan' },
    { id: 'B3-10', name: 'Renaldo Eliferd Potu', position: 'Pengelola Perpustakaan', level: 3, category: 'bidang_layanan' },
    { id: 'B3-11', name: 'Jesica Prisilia H., S.I.Pus', position: 'Pengelola Perpustakaan', level: 3, category: 'bidang_layanan' },
    { id: 'B3-12', name: 'Misbah Munir, S.Pdi', position: 'Pengelola Perpustakaan', level: 3, category: 'bidang_layanan' },
    { id: 'B3-13', name: 'Lia Mulyahati', position: 'Pengelola Perpustakaan', level: 3, category: 'bidang_layanan' },
    { id: 'B3-14', name: 'Hana Sari Nurjihan, S.Pd', position: 'Pengelola Perpustakaan', level: 3, category: 'bidang_layanan' },

    // BIDANG PENGEMBANGAN
    { id: 'B4-1', name: 'Iyus Jayusman, S.T., M.M', position: 'Kepala Bidang Pengembangan dan Pelestarian Perpustakaan', level: 2, category: 'bidang_pengembangan' },
  ];

  if (structure.length === 0) {
    dbSave(DB_KEYS.STRUCTURE, defaultStructure);
  }

  // Initialize achievements
  const achievements = dbGet<any[]>(DB_KEYS.ACHIEVEMENTS, []);
  if (achievements.length <= 1) {
    const defaultAchievements = [
      { id: 'AC-1', year: '2025', title: 'Penghargaan Pengawasan Kearsipan Eksternal Tahun 2025', description: 'Piagam Penghargaan Pengawasan Kearsipan - Pengawasan Kearsipan Eksternal Tahun 2025' },
      { id: 'AC-2', year: '2025', title: 'Penghargaan Dinas Arsip dan Perpustakaan 2025', description: 'Berperan Aktif dalam Kegiatan Perbaikan Arsip Korporasi PhUsaka - Piagam Penghargaan Provinsi Jawa Barat' },
      { id: 'AC-3', year: '2024', title: 'Terbaik ke 2 Penyedia Jasa Informasi Kearsipan Melalui SIKN/JIKN Tahun 2024', description: 'Piagam Penghargaan Provinsi Jawa Barat' },
      { id: 'AC-4', year: '2024', title: 'Dinas Arsip dan Purwakarta Memperoleh Penghargaan Inovasi', description: 'Piagam Penghargaan Inovasi PADI Purwakarta - Juara Harapan 1 Optimalisasi Pelayanan Website' },
      { id: 'AC-5', year: '2024', title: 'Penghargaan Inovasi Disarpus Terbanyak', description: 'Penghargaan Lomba Inovasi Daerah - Peserta Inovasi Terbanyak' },
      { id: 'AC-6', year: '2023', title: 'Perpustakaan Umum Prosentasi Pengunjung Terbanyak dibanding Jumlah Penduduk Tahun 2023', description: 'Penghargaan Disipusda Jabar' },
      { id: 'AC-7', year: '2023', title: 'Duta Baca Favorit Tingkat Provinsi 2023', description: 'Prestasi Duta Baca Favorit' },
      { id: 'AC-8', year: '2023', title: 'NOMINEE ANUGRAH PURWAKALGRHA INDONESIA MUSEUM AWARD 2023', description: 'Kategori Museum Cerdas - Komunitas Jelajah Jakarta' },
      { id: 'AC-9', year: '2023', title: 'Penggerak TPBIS Tahun 2023', description: 'PENGERAK TPBIS TINGKAT PROVINSI - Transformasi Perpustakaan Berbasis Inklusi Sosial' },
      { id: 'AC-10', year: '2022', title: 'Inovasi Gerakan Anak Membaca Buku (AMBU) Tingkat Kabupaten', description: 'Inovasi Literasi Daerah' },
      { id: 'AC-11', year: '2021', title: 'Terbaik Dalam Implementasi Program TPBIS', description: 'Dinas Perpustakaan Kabupaten/Kota Terbaik Dalam Implementasi Program Transformasi Perpustakaan Berbasis Inklusi Sosial (TPBIS) Tingkat Nasional' },
      { id: 'AC-12', year: '2020', title: 'Perpustakaan Kabupaten Terbaik Tingkat Nasional', description: 'Penghargaan Perpustakaan Terbaik' },
      { id: 'AC-13', year: '2020', title: 'Duta Baca Tingkat Provinsi Harapan 1', description: 'Prestasi Literasi Jawa Barat' },
      { id: 'AC-14', year: '2018', title: 'Sistem Informasi Pelayanan Publik (SIMADU)', description: 'Tingkat Provinsi Jawa Barat Kategori TOP 22' },
      { id: 'AC-15', year: '2015', title: 'Juara ke 3 LKD Terbaik Nasional', description: 'Lembaga Kearsipan Daerah Terbaik Nasional oleh ANRI' },
      { id: 'AC-16', year: '2011', title: 'Juara peringkat V Pemilihan Arsip Teladan', description: 'Tingkat Propinsi Jawa Barat' },
      { id: 'AC-17', year: '2011', title: 'Juara II Penyelenggraan Kearsipan', description: 'Tingkat Propinsi Jawa Barat' },
      { id: 'AC-18', year: '2010', title: 'Juara III Lomba mengetik denga Komputer', description: 'Dalam Rangka Hari Jadi Purwakarta Ke.179 tahun 2010' },
      { id: 'AC-19', year: '2009', title: 'Terbaik II penyelenggaraan Kearsipan', description: 'Kategori Kabupaten/Kota tingkat Propinsi Jawa Barat' },
      { id: 'AC-20', year: '2008', title: 'Meraih Juara Kearsipan II (Dua) Tingkat Provinsi Jawa Barat', description: 'Lomba Evaluasi Penyelenggaraan Kearsipan Tingkat Provinsi Jawa Barat' },
      { id: 'AC-21', year: '2006', title: 'Juara I Pengelolaan Administrasi Kepegawaian Terbaik', description: 'Tingkat Kabupaten Purwakarta' },
      { id: 'AC-22', year: '2005', title: 'Evaluasi Pengelolaan Arsip Tingkat Kecamatan', description: 'Terbaik I: Pasawahan, Terbaik II: Campaka, Terbaik III: Babakancikao' },
      { id: 'AC-23', year: '2005', title: 'Prestasi Kinerja Tenaga Fungsional Arsiparis Terbaik I', description: 'Tingkat Propinsi Jawa Barat (Arsiparis Teladan)' },
      { id: 'AC-24', year: '2004', title: 'Meraih Juara Arsiparis Teladan I (Satu)', description: 'Tingkat Propinsi Jawa Barat' },
      { id: 'AC-25', year: '2004', title: 'Meraih Juara Kearsipan I (satu) Tingkat Propinsi Jawa Barat', description: 'Kantor Arsip Daerah Percontohan di Propinsi Jawa Barat' },
      { id: 'AC-26', year: '2003', title: 'Meraih Juara II terbaik Kearsipan Tingkat Propinsi Jawa Barat', description: 'Penghargaan Kearsipan' },
      { id: 'AC-27', year: '2003', title: 'Meraih Juara Harapan III Lomba Arsiparis Teladan', description: 'Terbaik I Lomba Evaluasi penyelenggaraan Kearsipan' },
    ];
    dbSave(DB_KEYS.ACHIEVEMENTS, defaultAchievements);
  }
};
