import { dbGet, dbSave, DB_KEYS, initializeDB, Member as MemberType, Admin as AdminType } from './db';
import bcrypt from 'bcryptjs';
import { clearCurrentMember, getSavedCurrentMember, saveCurrentMember } from './memberSession';
import { supabase } from './supabase';

export type Member = MemberType;
export type Admin = AdminType;

const MEMBERS_KEY = DB_KEYS.MEMBERS;
const ADMINS_KEY = DB_KEYS.ADMINS;
const CURRENT_ADMIN_KEY = 'disipusda_current_admin';
const LOGIN_ATTEMPTS_KEY = 'disipusda_login_attempts';
const ADMINS_TABLE = 'admins';
const MEMBERS_TABLE = 'members';
// HARDCODE SECURITY POLICY:
// Admin account dikunci 15 menit setelah 5 kali percobaan login gagal.
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes lockout
// HARDCODE SECURITY POLICY:
// Durasi sesi admin di browser sebelum wajib login ulang.
const ADMIN_SESSION_TTL = 12 * 60 * 60 * 1000; // 12 hours

// Initialize DB on first import
initializeDB();

const avatarColors = [
  '#8b1c24', '#0c2f3d', '#d6a54a', '#0f6063', '#6b5840',
  '#2d5a27', '#5b3a8c', '#c05621', '#1a6b8a', '#8b4513'
];

const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).substr(2);

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const formatDateNow = (): string => {
  const now = new Date();
  return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
};

type SupabaseAdminRow = {
  id: string;
  nama_lengkap: string;
  email: string;
  password_hash: string;
  role: 'super_admin' | 'admin';
  tanggal_dibuat: string;
  avatar_color: string;
};

type SupabaseMemberRow = {
  id: string;
  nomor_anggota: string;
  nama_lengkap: string;
  nik_masked: string;
  email: string;
  password: string;
  alamat: string;
  telepon: string;
  jenis_kelamin: 'L' | 'P';
  tanggal_lahir: string;
  tanggal_daftar: string;
  avatar_color: string;
  avatar_url?: string;
  bio?: string;
};

const mapAdminRowToModel = (row: SupabaseAdminRow): Admin => ({
  id: row.id,
  namaLengkap: row.nama_lengkap,
  email: row.email,
  password: row.password_hash,
  role: row.role,
  tanggalDibuat: row.tanggal_dibuat || formatDateNow(),
  avatarColor: row.avatar_color || '#0c2f3d',
});

const mapMemberRowToModel = (row: SupabaseMemberRow): Member => ({
  id: row.id,
  nomorAnggota: row.nomor_anggota,
  namaLengkap: row.nama_lengkap,
  nik: row.nik_masked || '************',
  email: (row.email || '').toLowerCase().trim(),
  password: row.password || 'managed-by-supabase-auth',
  alamat: row.alamat || '',
  telepon: row.telepon || '',
  jenisKelamin: row.jenis_kelamin || 'L',
  tanggalLahir: row.tanggal_lahir || '',
  tanggalDaftar: row.tanggal_daftar || formatDateNow(),
  avatarColor: row.avatar_color || '#0c2f3d',
  avatarUrl: row.avatar_url || '',
  bio: row.bio || '',
});

// === MEMBER FUNCTIONS ===

export const getMembers = (): Member[] => {
  return dbGet<Member[]>(MEMBERS_KEY, []);
};

export const logout = (): void => {
  clearCurrentMember();
};

export const getCurrentUser = (): Member | null => {
  return getSavedCurrentMember();
};

export const isLoggedIn = (): boolean => !!getCurrentUser();

export const updateMember = async (id: string, updates: Partial<Member>): Promise<{ success: boolean; message: string; member?: Member }> => {
  // Alur aman update profil:
  // 1) sanitasi field sensitif
  // 2) validasi isi update
  // 3) update Supabase
  // 4) sinkronkan local cache + session user aktif
  const members = getMembers();
  const idx = members.findIndex(m => m.id === id);
  if (idx === -1) return { success: false, message: 'Member tidak ditemukan.' };

  // === BACKEND VALIDATION: Block sensitive field tampering from Frontend ===
  const safeUpdates = { ...updates };
  // These fields must NEVER be updated via profile form by the user themselves
  delete safeUpdates.id;
  delete safeUpdates.nomorAnggota;
  delete safeUpdates.tanggalDaftar;
  delete safeUpdates.nik; // NIK cannot be changed after registration

  // Validate name if being updated
  if (safeUpdates.namaLengkap !== undefined && !safeUpdates.namaLengkap.trim()) {
    return { success: false, message: 'Nama lengkap tidak boleh kosong.' };
  }

  // Validate email uniqueness if being changed
  if (safeUpdates.email !== undefined) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeUpdates.email)) {
      return { success: false, message: 'Format email tidak valid.' };
    }
    const emailConflict = members.find(m => m.email === safeUpdates.email && m.id !== id);
    if (emailConflict) return { success: false, message: 'Email sudah digunakan oleh anggota lain.' };
  }

  if (safeUpdates.password) {
    safeUpdates.password = bcrypt.hashSync(safeUpdates.password, 10);
  }

  const payload: Record<string, any> = {};
  if (safeUpdates.namaLengkap !== undefined) payload.nama_lengkap = safeUpdates.namaLengkap;
  if (safeUpdates.email !== undefined) payload.email = safeUpdates.email.toLowerCase().trim();
  if (safeUpdates.password !== undefined) payload.password = safeUpdates.password;
  if (safeUpdates.alamat !== undefined) payload.alamat = safeUpdates.alamat;
  if (safeUpdates.telepon !== undefined) payload.telepon = safeUpdates.telepon;
  if (safeUpdates.jenisKelamin !== undefined) payload.jenis_kelamin = safeUpdates.jenisKelamin;
  if (safeUpdates.tanggalLahir !== undefined) payload.tanggal_lahir = safeUpdates.tanggalLahir;
  if (safeUpdates.avatarColor !== undefined) payload.avatar_color = safeUpdates.avatarColor;
  if (safeUpdates.avatarUrl !== undefined) payload.avatar_url = safeUpdates.avatarUrl;
  if (safeUpdates.bio !== undefined) payload.bio = safeUpdates.bio;

  const { data: updatedRow, error } = await supabase
    .from(MEMBERS_TABLE)
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !updatedRow) {
    return { success: false, message: `Gagal update profil di Supabase: ${error?.message || 'Data tidak ditemukan'}` };
  }

  const updatedMember = mapMemberRowToModel(updatedRow as SupabaseMemberRow);

  members[idx] = updatedMember;
  dbSave(DB_KEYS.MEMBERS, members);

  // Update session if it's the current user
  const current = getCurrentUser();
  if (current?.id === id) {
    saveCurrentMember(updatedMember);
  }
  return { success: true, message: 'Profil berhasil diperbarui.', member: updatedMember };
};

export const deleteMember = async (id: string, requestedById?: string, isSelfDelete: boolean = false): Promise<{ success: boolean; message: string }> => {
  // === BACKEND VALIDATION: Admins or the user themselves can delete the account ===
  if (!requestedById) return { success: false, message: 'Akses ditolak.' };
  if (isSelfDelete && id !== requestedById) return { success: false, message: 'Akses ditolak: Anda hanya dapat menghapus akun Anda sendiri.' };

  const { error } = await supabase.from(MEMBERS_TABLE).delete().eq('id', id);
  if (error) {
    return { success: false, message: `Gagal menghapus akun di Supabase: ${error.message}` };
  }

  const members = getMembers().filter(m => m.id !== id);
  dbSave(DB_KEYS.MEMBERS, members);
  return { success: true, message: 'Akun berhasil dihapus.' };
};

export const getInitials = (name: string): string =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

// === ADMIN FUNCTIONS ===

const getDefaultAdmins = (): Admin[] => [
  {
    id: '00000000-0000-0000-0000-000000000001',
    namaLengkap: 'Super Admin',
    email: 'admin@disipusda.go.id',
    password: '$2a$10$wR.lXz.vXWzJvXw.X.w.X.w.X.w.X.w.X.w.X.w.X.w.X.w.X.w.X',
    role: 'super_admin',
    tanggalDibuat: '14 April 2024',
    avatarColor: '#0c2f3d'
  },
];

const cacheAdmins = (admins: Admin[]) => {
  localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
};

const getCachedAdmins = (): Admin[] => {
  const data = localStorage.getItem(ADMINS_KEY);
  return data ? JSON.parse(data) : [];
};

const ensureDefaultAdmin = async () => {
  // Bootstrap admin default untuk deployment baru,
  // supaya panel admin tidak terkunci saat tabel masih kosong.
  const { data, error } = await supabase.from(ADMINS_TABLE).select('id').limit(1);
  if (error) return;
  if (data && data.length > 0) return;

  const fallback = getDefaultAdmins()[0];
  await supabase.from(ADMINS_TABLE).insert({
    id: fallback.id,
    nama_lengkap: fallback.namaLengkap,
    email: fallback.email,
    password_hash: fallback.password,
    role: fallback.role,
    tanggal_dibuat: fallback.tanggalDibuat,
    avatar_color: fallback.avatarColor,
  });
};

export const getAdmins = async (): Promise<Admin[]> => {
  await ensureDefaultAdmin();
  const { data, error } = await supabase
    .from(ADMINS_TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    const fallback = getCachedAdmins();
    if (fallback.length) return fallback;
    const defaultAdmins = getDefaultAdmins();
    cacheAdmins(defaultAdmins);
    return defaultAdmins;
  }

  const admins = (data || []).map((row) => mapAdminRowToModel(row as SupabaseAdminRow));
  cacheAdmins(admins);
  return admins;
};

export const addAdmin = async (data: { namaLengkap: string; email: string; password: string; role: 'super_admin' | 'admin' }): Promise<{ success: boolean; message: string }> => {
  const admins = await getAdmins();
  if (admins.find(a => a.email === data.email))
    return { success: false, message: 'Email admin sudah terdaftar.' };

  const payload = {
    id: generateId(),
    nama_lengkap: data.namaLengkap,
    email: data.email.toLowerCase().trim(),
    password_hash: bcrypt.hashSync(data.password, 10),
    role: data.role,
    tanggal_dibuat: formatDateNow(),
    avatar_color: avatarColors[Math.floor(Math.random() * avatarColors.length)],
  };

  const { error } = await supabase.from(ADMINS_TABLE).insert(payload);
  if (error) {
    return { success: false, message: `Gagal menambah admin: ${error.message}` };
  }

  const refreshed = await getAdmins();
  cacheAdmins(refreshed);
  return { success: true, message: `Admin "${data.namaLengkap}" berhasil ditambahkan.` };
};

export const deleteAdmin = async (id: string): Promise<{ success: boolean; message: string }> => {
  const admins = await getAdmins();
  const target = admins.find(a => a.id === id);
  if (target?.role === 'super_admin')
    return { success: false, message: 'Super Admin tidak dapat dihapus.' };

  const { error } = await supabase.from(ADMINS_TABLE).delete().eq('id', id);
  if (error) {
    return { success: false, message: `Gagal menghapus admin: ${error.message}` };
  }

  const filtered = (await getAdmins()).filter(a => a.id !== id);
  cacheAdmins(filtered);
  return { success: true, message: 'Admin berhasil dihapus.' };
};

export const updateAdmin = async (id: string, updates: Partial<Admin>): Promise<{ success: boolean; message: string }> => {
  const admins = await getAdmins();
  const idx = admins.findIndex(a => a.id === id);
  if (idx === -1) return { success: false, message: 'Admin tidak ditemukan.' };

  const payload: Record<string, any> = {};
  if (updates.namaLengkap !== undefined) payload.nama_lengkap = updates.namaLengkap;
  if (updates.email !== undefined) payload.email = updates.email.toLowerCase().trim();
  if (updates.password !== undefined) payload.password_hash = bcrypt.hashSync(updates.password, 10);
  if (updates.role !== undefined) payload.role = updates.role;
  if (updates.avatarColor !== undefined) payload.avatar_color = updates.avatarColor;

  const { error } = await supabase.from(ADMINS_TABLE).update(payload).eq('id', id);
  if (error) {
    return { success: false, message: `Gagal memperbarui admin: ${error.message}` };
  }

  cacheAdmins(await getAdmins());
  return { success: true, message: 'Admin berhasil diperbarui.' };
};

export const loginAdmin = async (email: string, password: string): Promise<{ success: boolean; message: string; admin?: Admin }> => {
  // Rate-limit login admin berbasis localStorage.
  // Catatan: ini proteksi sisi client, proteksi server-side tetap disarankan.
  const attempts = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}');
  const normalizedEmail = email.toLowerCase().trim();
  const adminKey = `admin_${normalizedEmail}`;

  // Check lockout
  if (attempts[adminKey] && attempts[adminKey].count >= 5) {
    const now = Date.now();
    const timeLeft = attempts[adminKey].lastAttempt + LOCKOUT_TIME - now;
    if (timeLeft > 0) {
      const minutes = Math.ceil(timeLeft / 60000);
      return { success: false, message: `Akses admin dikunci sementara. Coba lagi dalam ${minutes} menit.` };
    } else {
      delete attempts[adminKey];
    }
  }

  const admins = await getAdmins();
  const admin = admins.find(a => {
    if (a.email !== normalizedEmail) return false;
    try {
      // Coba cek pakai Bcrypt (Hash)
      return bcrypt.compareSync(password, a.password);
    } catch (e) {
      // Fallback: Jika di DB masih tulisan biasa (Plain Text)
      return password === a.password;
    }
  });
  
  if (!admin) {
    const count = (attempts[adminKey]?.count || 0) + 1;
    attempts[adminKey] = { count, lastAttempt: Date.now() };
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
    
    const remaining = 5 - count;
    return { 
      success: false, 
      message: remaining > 0 
        ? `Email atau password admin salah. Sisa percobaan: ${remaining}` 
        : 'Akses dikunci selama 15 menit.' 
    };
  }

  delete attempts[adminKey];
  localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));

  const sessionData = {
    admin,
    // Expired session ditangani di getCurrentAdmin().
    expiresAt: Date.now() + ADMIN_SESSION_TTL
  };
  localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify(sessionData));
  return { success: true, message: `Selamat datang, ${admin.namaLengkap}!`, admin };
};

export const getCurrentAdmin = (): Admin | null => {
  const sessionStr = localStorage.getItem(CURRENT_ADMIN_KEY);
  if (!sessionStr) return null;
  
  const sessionData = JSON.parse(sessionStr);
  if (!sessionData || !sessionData.admin || !sessionData.expiresAt) return null;

  // Check expiration
  if (Date.now() > sessionData.expiresAt) {
    logoutAdmin();
    return null;
  }

  return sessionData.admin;
};

export const logoutAdmin = (): void => {
  localStorage.removeItem(CURRENT_ADMIN_KEY);
};

export const isAdminLoggedIn = (): boolean => !!getCurrentAdmin();
