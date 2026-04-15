import { dbGet, dbSave, DB_KEYS } from './db';

export interface SystemInfo {
  siteName: string;
  tagline: string;
  address: string;
  email: string;
  phone: string;
  whatsapp: string;
  socials: {
    instagram: string;
    facebook: string;
    youtube: string;
  };
  logo: string;
  operatingHours: {
    weekday: string;
    weekend: string;
  };
}

// Added for backward compatibility with Settings.tsx
export interface SiteSettings {
  namaInstansi: string;
  emailKontak: string;
  teleponKontak: string;
  alamatInstansi: string;
  waAdmin: string;
  jamOperasional: string;
  linkGmaps: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  visi: string;
  misi: string[];
}


export interface Schedule {
  id: string;
  day: string;
  hours: string;
  note: string;
}

export interface Achievement {
  id: string;
  title: string;
  year: string;
  description: string;
  icon?: string;
}

export interface StructureNode {
  id: string;
  name: string;
  position: string;
  level: number;
  parentId?: string;
}

// System Info
export const getSystemInfo = (): SystemInfo => {
  return dbGet<SystemInfo>(DB_KEYS.SYSTEM_INFO, {
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
};

export const saveSystemInfo = (info: SystemInfo) => {
  dbSave(DB_KEYS.SYSTEM_INFO, info);
  return { success: true, message: 'Pengaturan sistem berhasil diperbarui.' };
};

// Site Settings (Used by Settings.tsx)
export const getSiteSettings = (): SiteSettings => {
  return dbGet<SiteSettings>(DB_KEYS.SETTINGS, {
    namaInstansi: 'Disipusda Purwakarta',
    emailKontak: 'disipusda@purwakartakab.go.id',
    teleponKontak: '(0264) 200234',
    alamatInstansi: 'Jl. Veteran No. 46, Purwakarta, Jawa Barat',
    waAdmin: '081234567890',
    jamOperasional: 'Senin - Sabtu (08:00 - 16:00)',
    linkGmaps: '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    youtubeUrl: '',
    visi: 'Terwujudnya Masyarakat Purwakarta yang Literat dan Berbudaya Arsip.',
    misi: [
      'Meningkatkan kualitas layanan perpustakaan berbasis teknologi informasi.',
      'Mewujudkan tata kelola kearsipan yang efisien dan akuntabel.',
      'Mendorong minat baca masyarakat melalui inovasi layanan.'
    ]
  });
};

export const updateSiteSettings = (settings: SiteSettings) => {
  dbSave(DB_KEYS.SETTINGS, settings);
  return { success: true, message: 'Pengaturan berhasil disimpan!' };
};


// Schedules
export const getSchedules = (): Schedule[] => {
  return dbGet<Schedule[]>(DB_KEYS.SCHEDULES, []);
};

export const saveSchedules = (schedules: Schedule[]) => {
  dbSave(DB_KEYS.SCHEDULES, schedules);
  return { success: true, message: 'Jadwal layanan berhasil diperbarui.' };
};

// Achievements
export const getAchievements = (): Achievement[] => {
  return dbGet<Achievement[]>(DB_KEYS.ACHIEVEMENTS, []);
};

export const saveAchievements = (achievements: Achievement[]) => {
  dbSave(DB_KEYS.ACHIEVEMENTS, achievements);
  return { success: true, message: 'Data prestasi berhasil diperbarui.' };
};

// Structure
export const getStructure = (): StructureNode[] => {
  return dbGet<StructureNode[]>(DB_KEYS.STRUCTURE, []);
};

export const saveStructure = (nodes: StructureNode[]) => {
  dbSave(DB_KEYS.STRUCTURE, nodes);
  return { success: true, message: 'Bagan organisasi berhasil diperbarui.' };
};
