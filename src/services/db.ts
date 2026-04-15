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
  localStorage.setItem(key, JSON.stringify(data));
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

  // Initialize structure if empty or insufficient
  const structure = dbGet(DB_KEYS.STRUCTURE, []);
  if (structure.length < 10) {
    const fullStructure = [
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

      // BIDANG PEMBINAAN
      { id: 'B1-1', name: 'Desi Hendrayani, S.TP, M.P', position: 'Kepala Bidang Pembinaan, Pelestarian dan Pengembangan Kearsipan', level: 2, category: 'bidang_pembinaan' },
      { id: 'B1-2', name: 'Eko Sulistiawan, S.E', position: 'Arsiparis Ahli Muda', level: 3, category: 'bidang_pembinaan' },
      { id: 'B1-3', name: 'Namira Ramadhina Putri, A.md.MRA', position: 'JF Arsiparis Pelaksana Terampil', level: 3, category: 'bidang_pembinaan' },
      { id: 'B1-4', name: 'Deni Jatnika Supardi, S.H', position: 'Pranata Kearsipan', level: 3, category: 'bidang_pembinaan' },
      { id: 'B1-5', name: 'Soleh Supena', position: 'Pengadministrasi Keuangan', level: 3, category: 'bidang_pembinaan' },
      { id: 'B1-6', name: 'Yogie Friansyah, S.T', position: 'Pengelola Kearsipan', level: 3, category: 'bidang_pembinaan' },

      // BIDANG PENGELOLAAN
      { id: 'B2-1', name: 'Minar R.S, S.E, M.AP', position: 'Kepala Bidang Pengelolaan dan Pemeliharaan Kearsipan', level: 2, category: 'bidang_pengelolaan' },
      { id: 'B2-2', name: 'Yeni Ernawati, S.H', position: 'Arsiparis Ahli Muda', level: 3, category: 'bidang_pengelolaan' },
      { id: 'B2-3', name: 'Puri Prameswari, S.H', position: 'Arsiparis Ahli Muda', level: 3, category: 'bidang_pengelolaan' },
      { id: 'B2-4', name: 'Yani Lestari', position: 'Pranata Kearsipan', level: 3, category: 'bidang_pengelolaan' },
      { id: 'B2-5', name: 'Asep Sodikin', position: 'Arsiparis Ahli Pertama', level: 3, category: 'bidang_pengelolaan' },
      { id: 'B2-6', name: 'Silvia Dwi Apriliani, A.Md', position: 'JF Arsiparis Pelaksana Terampil', level: 3, category: 'bidang_pengelolaan' },
      { id: 'B2-7', name: 'Maryadi Sudarmono', position: 'Pengelola Kearsipan', level: 3, category: 'bidang_pengelolaan' },

      // BIDANG LAYANAN
      { id: 'B3-1', name: 'Dra. Hj. Uce Martina, AF.MP', position: 'Kepala Bidang Layanan dan Otomasi Perpustakaan', level: 2, category: 'bidang_layanan' },
      { id: 'B3-2', name: 'Emma Hermawati, S.Sos', position: 'Pustakawan Ahli Muda', level: 3, category: 'bidang_layanan' },
      { id: 'B3-3', name: 'Ritta Utami Herawati, S.Sos', position: 'Pustakawan Ahli Muda', level: 3, category: 'bidang_layanan' },
      { id: 'B3-4', name: 'Imadudin Somantri, S.H', position: 'Pustakawan Ahli Muda', level: 3, category: 'bidang_layanan' },
      { id: 'B3-5', name: 'Farhan Kamaludin, A.Md', position: 'JF Pustakawan Terampil', level: 3, category: 'bidang_layanan' },
      { id: 'B3-6', name: 'Ajeng Indah Sulastri, A.Md', position: 'JF Pustakawan Terampil', level: 3, category: 'bidang_layanan' },
      { id: 'B3-7', name: 'Yana Supriatna', position: 'Pengelola Perpustakaan', level: 3, category: 'bidang_layanan' },
      { id: 'B3-8', name: 'Dhany Mudyana, S.Pd', position: 'Pengelola Perpustakaan', level: 3, category: 'bidang_layanan' },
      { id: 'B3-9', name: 'Renaldo Eliferd Potu', position: 'Pengelola Perpustakaan', level: 3, category: 'bidang_layanan' },
      { id: 'B3-10', name: 'Lia Mulyahati', position: 'Pengelola Perpustakaan', level: 3, category: 'bidang_layanan' },

      // BIDANG PENGEMBANGAN
      { id: 'B4-1', name: 'Iyus Jayusman, S.T., M.M', position: 'Kepala Bidang Pengembangan dan Pelestarian Perpustakaan', level: 2, category: 'bidang_pengembangan' },
      { id: 'B4-2', name: 'Irma, S.E', position: 'Pustakawan Ahli Muda', level: 3, category: 'bidang_pengembangan' },
      { id: 'B4-3', name: 'Tonny Prasetya Nugraha', position: 'JF Arsiparis Ahli Pertama', level: 3, category: 'bidang_pengembangan' },
      { id: 'B4-4', name: 'Rendy Iwan Hardian', position: 'Pengelola Perpustakaan', level: 3, category: 'bidang_pengembangan' },
      { id: 'B4-5', name: 'Ecin Kuraesin', position: 'Pengelola Perpustakaan', level: 3, category: 'bidang_pengembangan' },
      { id: 'B4-6', name: 'Dewi Sri Susilawati, S.I.Pus', position: 'Pengelola Perpustakaan', level: 3, category: 'bidang_pengembangan' },

      // DIORAMA
      { id: 'D1', name: 'Edi Rasidi, A.Md', position: 'Kepala UPTD Diorama Kearsipan', level: 2, category: 'diorama' },
      { id: 'D2', name: 'Arie Lukmanul Hakim, S.Ip', position: 'Guide', level: 3, category: 'diorama' },
      { id: 'D3', name: 'Indri Sukma Wirawati, S.T', position: 'Guide', level: 3, category: 'diorama' },
      { id: 'D4', name: 'Indri Sukma Wirawati, S.T', position: 'Guide', level: 3, category: 'diorama' },
      { id: 'D5', name: 'Hadi Kusuma, S.Kom', position: 'Guide', level: 3, category: 'diorama' },
      { id: 'D6', name: 'Rina Sintia', position: 'Penerima Tamu', level: 3, category: 'diorama' },
      { id: 'D7', name: 'Eggy Apriyana Putra', position: 'Petugas Keamanan', level: 3, category: 'diorama' },
    ];
    dbSave(DB_KEYS.STRUCTURE, fullStructure);
  }
};

