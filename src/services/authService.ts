import { dbGet, dbSave, DB_KEYS, initializeDB, Member as MemberType, Admin as AdminType } from './db';
import bcrypt from 'bcryptjs';
import { clearCurrentMember, getSavedCurrentMember, saveCurrentMember } from './memberSession';
import { USE_SUPABASE_AUTH } from './backendConfig';
import { supabase } from './supabase';

export type Member = MemberType;
export type Admin = AdminType;

const MEMBERS_KEY = DB_KEYS.MEMBERS;
const ADMINS_KEY = DB_KEYS.ADMINS;
const CURRENT_USER_KEY = 'disipusda_current_user';
const CURRENT_ADMIN_KEY = 'disipusda_current_admin';
const LOGIN_ATTEMPTS_KEY = 'disipusda_login_attempts';
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes lockout
const USER_SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours
const ADMIN_SESSION_TTL = 12 * 60 * 60 * 1000; // 12 hours

// Initialize DB on first import
initializeDB();

const avatarColors = [
  '#8b1c24', '#0c2f3d', '#d6a54a', '#0f6063', '#6b5840',
  '#2d5a27', '#5b3a8c', '#c05621', '#1a6b8a', '#8b4513'
];

const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).substr(2);

const generateMemberNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PWK-${year}-${random}`;
};

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const formatDateNow = (): string => {
  const now = new Date();
  return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
};

// === MEMBER FUNCTIONS ===

export const getMembers = (): Member[] => {
  return dbGet<Member[]>(MEMBERS_KEY, []);
};

const maskNik = (nik: string) => {
  if (!nik) return '';
  return '*'.repeat(nik.length - 4) + nik.slice(-4);
};

export const register = (data: Omit<Member, 'id' | 'nomorAnggota' | 'tanggalDaftar' | 'avatarColor'>): { success: boolean; message: string; member?: Member } => {
  // === BACKEND VALIDATION ===
  if (!data.namaLengkap?.trim()) return { success: false, message: 'Nama lengkap tidak boleh kosong.' };
  if (!data.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { success: false, message: 'Format email tidak valid.' };
  if (!data.password || data.password.length < 6) return { success: false, message: 'Password minimal 6 karakter.' };
  if (!data.nik || data.nik.replace(/\D/g, '').length !== 16) return { success: false, message: 'NIK harus 16 digit angka.' };
  if (!data.telepon || !/^\d{8,15}$/.test(data.telepon.replace(/\D/g, ''))) return { success: false, message: 'Nomor telepon tidak valid.' };

  const members = getMembers();

  // Check duplicate NIK (masking check)
  const maskedTarget = maskNik(data.nik);
  if (members.find(m => m.nik === maskedTarget)) {
    return { success: false, message: 'NIK ini sudah terdaftar sebagai anggota.' };
  }

  if (members.find(m => m.email === data.email.toLowerCase().trim())) {
    return { success: false, message: 'Email sudah digunakan.' };
  }

  const newMember: Member = {
    id: generateId(),
    nomorAnggota: generateMemberNumber(),
    namaLengkap: data.namaLengkap.trim(),
    nik: maskedTarget,
    email: data.email.toLowerCase().trim(),
    password: bcrypt.hashSync(data.password, 10),
    alamat: data.alamat?.trim() || '',
    telepon: data.telepon.replace(/\D/g, ''),
    jenisKelamin: data.jenisKelamin,
    tanggalLahir: data.tanggalLahir,
    tanggalDaftar: formatDateNow(),
    avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
  };

  members.push(newMember);
  dbSave(DB_KEYS.MEMBERS, members);
  return { success: true, message: `Pendaftaran berhasil! Nomor anggota Anda: ${newMember.nomorAnggota}`, member: newMember };
};

export const login = (emailOrIdOrNik: string, password: string): { success: boolean; message: string; member?: Member } => {
  const attempts = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}');
  const userKey = emailOrIdOrNik.toLowerCase();
  
  // Check lockout
  if (attempts[userKey] && attempts[userKey].count >= 5) {
    const now = Date.now();
    const timeLeft = attempts[userKey].lastAttempt + LOCKOUT_TIME - now;
    if (timeLeft > 0) {
      const minutes = Math.ceil(timeLeft / 60000);
      return { success: false, message: `Akun terkunci sementara karena terlalu banyak percobaan gagal. Silakan coba lagi dalam ${minutes} menit.` };
    } else {
      // Lockout expired, reset
      delete attempts[userKey];
    }
  }

  const members = getMembers();
  const member = members.find(
    m => (m.email === emailOrIdOrNik || m.nomorAnggota === emailOrIdOrNik || m.nik === emailOrIdOrNik) && bcrypt.compareSync(password, m.password)
  );

  if (!member) {
    // Record failed attempt
    const count = (attempts[userKey]?.count || 0) + 1;
    attempts[userKey] = { count, lastAttempt: Date.now() };
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
    
    const remaining = 5 - count;
    const msg = remaining > 0 
      ? `Email/ID/NIK atau password salah. Sisa percobaan: ${remaining}`
      : 'Email/ID/NIK atau password salah. Akun Anda dikunci selama 15 menit.';
    return { success: false, message: msg };
  }

  // Successful login, clear attempts
  delete attempts[userKey];
  localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));

  const sessionData = {
    member,
    expiresAt: Date.now() + USER_SESSION_TTL
  };
  saveCurrentMember(sessionData.member, sessionData.expiresAt);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionData));
  return { success: true, message: `Selamat datang, ${member.namaLengkap}!`, member };
};

export const logout = (): void => {
  if (USE_SUPABASE_AUTH) {
    supabase.auth.signOut().catch((err) => console.warn('Supabase signOut gagal:', err));
  }
  clearCurrentMember();
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): Member | null => {
  const cachedMember = getSavedCurrentMember();
  if (cachedMember) return cachedMember;

  // === SECURITY: Cross-verify session against the actual database ===
  const sessionStr = localStorage.getItem(CURRENT_USER_KEY);
  if (!sessionStr) return null;
  
  const sessionData = JSON.parse(sessionStr);
  if (!sessionData || !sessionData.member || !sessionData.expiresAt) return null;

  // Check if session has expired
  if (Date.now() > sessionData.expiresAt) {
    logout();
    return null;
  }

  const memberId = sessionData.member.id;
  const verified = getMembers().find(m => m.id === memberId);
  return verified || null; // Return null if ID no longer exists in DB
};

export const isLoggedIn = (): boolean => !!getCurrentUser();

export const resetPassword = (email: string, nik: string, newPass: string): { success: boolean; message: string } => {
  if (newPass.length < 6) return { success: false, message: 'Password baru minimal 6 karakter.' };
  const members = getMembers();
  // Find member matching email AND masked nik
  const idx = members.findIndex(m => m.email === email && m.nik === nik);

  if (idx !== -1) {
    members[idx].password = bcrypt.hashSync(newPass, 10);
    dbSave(DB_KEYS.MEMBERS, members);
    return { success: true, message: 'Password berhasil direset. Silakan login.' };
  }
  return { success: false, message: 'Data tidak cocok. Pastikan Email & NIK benar.' };
};

export const updateMember = (id: string, updates: Partial<Member>): { success: boolean; message: string; member?: Member } => {
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

  members[idx] = { ...members[idx], ...safeUpdates };
  dbSave(DB_KEYS.MEMBERS, members);

  // Update session if it's the current user
  const current = getCurrentUser();
  if (current?.id === id) {
    const existingSession = localStorage.getItem(CURRENT_USER_KEY);
    const expiresAt = existingSession ? (() => {
      try {
        const parsed = JSON.parse(existingSession);
        return parsed?.expiresAt;
      } catch {
        return undefined;
      }
    })() : undefined;
    saveCurrentMember(members[idx], expiresAt);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(expiresAt ? { member: members[idx], expiresAt } : { member: members[idx] }));
  }
  return { success: true, message: 'Profil berhasil diperbarui.', member: members[idx] };
};

export const deleteMember = (id: string, requestedById?: string, isSelfDelete: boolean = false): { success: boolean; message: string } => {
  // === BACKEND VALIDATION: Admins or the user themselves can delete the account ===
  if (!requestedById) return { success: false, message: 'Akses ditolak.' };
  if (isSelfDelete && id !== requestedById) return { success: false, message: 'Akses ditolak: Anda hanya dapat menghapus akun Anda sendiri.' };

  const members = getMembers().filter(m => m.id !== id);
  dbSave(DB_KEYS.MEMBERS, members);
  return { success: true, message: 'Akun berhasil dihapus.' };
};

export const getInitials = (name: string): string =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

// === ADMIN FUNCTIONS ===

const getDefaultAdmins = (): Admin[] => [
  {
    id: 'admin_001',
    namaLengkap: 'Super Admin',
    email: 'admin@disipusda.go.id',
    password: bcrypt.hashSync('admin123', 10),
    role: 'super_admin',
    tanggalDibuat: '1 Januari 2024',
    avatarColor: '#0c2f3d',
  },
];

export const getAdmins = (): Admin[] => {
  const data = localStorage.getItem(ADMINS_KEY);
  if (!data) {
    const defaultAdmins = getDefaultAdmins();
    localStorage.setItem(ADMINS_KEY, JSON.stringify(defaultAdmins));
    return defaultAdmins;
  }
  return JSON.parse(data);
};

export const addAdmin = (data: { namaLengkap: string; email: string; password: string; role: 'super_admin' | 'admin' }): { success: boolean; message: string } => {
  const admins = getAdmins();
  if (admins.find(a => a.email === data.email))
    return { success: false, message: 'Email admin sudah terdaftar.' };

  admins.push({
    id: generateId(),
    ...data,
    password: bcrypt.hashSync(data.password, 10),
    tanggalDibuat: formatDateNow(),
    avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
  });
  localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
  return { success: true, message: `Admin "${data.namaLengkap}" berhasil ditambahkan.` };
};

export const deleteAdmin = (id: string): { success: boolean; message: string } => {
  const admins = getAdmins();
  const target = admins.find(a => a.id === id);
  if (target?.role === 'super_admin')
    return { success: false, message: 'Super Admin tidak dapat dihapus.' };
  const filtered = admins.filter(a => a.id !== id);
  localStorage.setItem(ADMINS_KEY, JSON.stringify(filtered));
  return { success: true, message: 'Admin berhasil dihapus.' };
};

export const updateAdmin = (id: string, updates: Partial<Admin>): { success: boolean; message: string } => {
  const admins = getAdmins();
  const idx = admins.findIndex(a => a.id === id);
  if (idx === -1) return { success: false, message: 'Admin tidak ditemukan.' };
  admins[idx] = { ...admins[idx], ...updates };
  localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
  return { success: true, message: 'Admin berhasil diperbarui.' };
};

export const loginAdmin = (email: string, password: string): { success: boolean; message: string; admin?: Admin } => {
  const attempts = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}');
  const adminKey = `admin_${email.toLowerCase()}`;

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

  const admins = getAdmins();
  const admin = admins.find(a => a.email === email && bcrypt.compareSync(password, a.password));
  
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
    expiresAt: Date.now() + ADMIN_SESSION_TTL
  };
  localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify(sessionData));
  return { success: true, message: `Selamat datang, ${admin.namaLengkap}!`, admin };
};

export const getCurrentAdmin = (): Admin | null => {
  // === SECURITY: Cross-verify session against the actual admin database ===
  const sessionStr = localStorage.getItem(CURRENT_ADMIN_KEY);
  if (!sessionStr) return null;
  
  const sessionData = JSON.parse(sessionStr);
  if (!sessionData || !sessionData.admin || !sessionData.expiresAt) return null;

  // Check expiration
  if (Date.now() > sessionData.expiresAt) {
    logoutAdmin();
    return null;
  }

  const adminId = sessionData.admin.id;
  const verified = getAdmins().find(a => a.id === adminId);
  return verified || null;
};

export const logoutAdmin = (): void => {
  localStorage.removeItem(CURRENT_ADMIN_KEY);
};

export const isAdminLoggedIn = (): boolean => !!getCurrentAdmin();
