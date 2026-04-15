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

  // Initialize schedules if empty
  const schedules = dbGet(DB_KEYS.SCHEDULES, []);
  if (schedules.length === 0) {
    dbSave(DB_KEYS.SCHEDULES, [
      { id: '1', day: 'Senin - Kamis', hours: '08:00 - 15:30', note: 'Layanan Mandiri & Pinjam' },
      { id: '2', day: 'Jumat', hours: '08:00 - 16:00', note: 'Layanan Terbatas' },
      { id: '3', day: 'Sabtu', hours: '09:00 - 12:00', note: 'Layanan Weekend' },
    ]);
  }
};
