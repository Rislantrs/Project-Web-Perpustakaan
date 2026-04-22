import { v4 as uuidv4 } from 'uuid';
import { dbGet, dbSave, DB_KEYS } from './db';
import { sanitizeObject } from '../utils/security';
import { supabase } from './supabase';

// Interfaces remain the same...
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
  img?: string;
}

export interface StructureNode {
  id: string;
  name: string;
  position: string;
  level: number;
  parentId?: string;
  category: string;
  img?: string;
}

// --- SYNC ENGINE ---
export const refreshSettings = async () => {
  // Jalankan semua sync secara paralel agar tidak saling menunggu (waterfall)
  await Promise.allSettled([
    // 1. Sync Settings
    (async () => {
      const { data } = await supabase.from('settings').select('*');
      if (data && data.length > 0) {
        const siteSetts = data.find(s => s.key === 'site_settings')?.value;
        if (siteSetts) dbSave(DB_KEYS.SETTINGS, siteSetts);
      }
    })(),

    // 2. Sync Schedules
    (async () => {
      const { data } = await supabase.from('schedules').select('*');
      if (data && data.length > 0) dbSave(DB_KEYS.SCHEDULES, data);
    })(),

    // 3. Sync Achievements
    (async () => {
      const { data } = await supabase.from('achievements').select('*');
      if (data && data.length > 0) dbSave(DB_KEYS.ACHIEVEMENTS, data);
    })(),

    // 4. Sync Structure
    (async () => {
      const { data } = await supabase.from('structure').select('*');
      if (data && data.length > 0) dbSave(DB_KEYS.STRUCTURE, data);
    })()
  ]);
};

// Helper to filter object keys
function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) result[key] = obj[key];
  });
  return result;
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

export const saveSystemInfo = async (info: SystemInfo, requestedByAdminId?: string) => {
  if (!requestedByAdminId) throw new Error('Akses ditolak: Hanya admin yang dapat mengubah pengaturan.');
  const cleanInfo = sanitizeObject(info);
  dbSave(DB_KEYS.SYSTEM_INFO, cleanInfo);
  await supabase.from('settings').upsert({ key: 'system_info', value: cleanInfo });
  return { success: true, message: 'Pengaturan sistem berhasil diperbarui.' };
};

// Site Settings
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

export const updateSiteSettings = async (settings: SiteSettings, requestedByAdminId?: string) => {
  if (!requestedByAdminId) throw new Error('Akses ditolak: Hanya admin yang dapat mengubah pengaturan situs.');
  const cleanSettings = sanitizeObject(settings);
  dbSave(DB_KEYS.SETTINGS, cleanSettings);
  await supabase.from('settings').upsert({ key: 'site_settings', value: cleanSettings });
  return { success: true, message: 'Pengaturan berhasil disimpan!' };
};

// Schedules
export const getSchedules = (): Schedule[] => {
  return dbGet<Schedule[]>(DB_KEYS.SCHEDULES, []);
};

export const saveSchedules = async (schedules: Schedule[], requestedByAdminId?: string) => {
  if (!requestedByAdminId) throw new Error('Akses ditolak: Hanya admin yang dapat mengubah jadwal.');
  const cleanSchedules = schedules.map(s => sanitizeObject(s));
  dbSave(DB_KEYS.SCHEDULES, cleanSchedules);
  await supabase.from('schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (cleanSchedules.length > 0) {
    const toInsert = cleanSchedules.map(s => pick(s, ['id', 'day', 'hours', 'note']));
    await supabase.from('schedules').insert(toInsert);
  }
  return { success: true, message: 'Jadwal layanan berhasil diperbarui.' };
};

// Achievements
export const getAchievements = (): Achievement[] => {
  return dbGet<Achievement[]>(DB_KEYS.ACHIEVEMENTS, []);
};

export const saveAchievements = async (achievements: Achievement[], requestedByAdminId?: string) => {
  if (!requestedByAdminId) throw new Error('Akses ditolak: Hanya admin yang dapat mengubah prestasi.');
  const cleanAchievements = achievements.map(a => sanitizeObject(a));
  dbSave(DB_KEYS.ACHIEVEMENTS, cleanAchievements);
  await supabase.from('achievements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (cleanAchievements.length > 0) {
    const toInsert = cleanAchievements.map(a => pick(a, ['id', 'title', 'year', 'description', 'img']));
    await supabase.from('achievements').insert(toInsert);
  }
  return { success: true, message: 'Data prestasi berhasil diperbarui.' };
};

// Structure
export const getStructure = (): StructureNode[] => {
  return dbGet<StructureNode[]>(DB_KEYS.STRUCTURE, []);
};

export const addStructureNode = async (node: Omit<StructureNode, 'id'>, requestedByAdminId?: string): Promise<StructureNode> => {
  if (!requestedByAdminId) throw new Error('Akses ditolak: Hanya admin yang dapat mengubah struktur.');
  const nodes = getStructure();
  const cleanNode = sanitizeObject(node as any);
  const newNode = { ...cleanNode, id: uuidv4() } as StructureNode;
  const updatedNodes = [...nodes, newNode];
  dbSave(DB_KEYS.STRUCTURE, updatedNodes);
  await supabase.from('structure').insert(pick(newNode, ['id', 'name', 'position', 'level', 'parentId', 'category', 'img']));
  return newNode;
};

export const getStructureByCategory = (category: string): StructureNode[] => {
  return getStructure().filter(node => node.category === category);
};

export const saveStructure = async (nodes: StructureNode[], requestedByAdminId?: string) => {
  if (!requestedByAdminId) throw new Error('Akses ditolak: Hanya admin yang dapat mengubah struktur.');
  const cleanNodes = nodes.map(n => sanitizeObject(n));
  dbSave(DB_KEYS.STRUCTURE, cleanNodes);
  await supabase.from('structure').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (cleanNodes.length > 0) {
    const toInsert = cleanNodes.map(n => pick(n, ['id', 'name', 'position', 'level', 'parentId', 'category', 'img']));
    await supabase.from('structure').insert(toInsert);
  }
  return { success: true, message: 'Bagan organisasi berhasil diperbarui.' };
};
