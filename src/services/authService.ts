import { dbGet, dbSave, DB_KEYS, initializeDB, Member as MemberType, Admin as AdminType } from './db';
import bcrypt from 'bcryptjs';
import { clearCurrentMember, getSavedCurrentMember, saveCurrentMember } from './memberSession';

export type Member = MemberType;
export type Admin = AdminType;

const MEMBERS_KEY = DB_KEYS.MEMBERS;
const ADMINS_KEY = DB_KEYS.ADMINS;
const CURRENT_ADMIN_KEY = 'disipusda_current_admin';
const LOGIN_ATTEMPTS_KEY = 'disipusda_login_attempts';
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes lockout
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
    saveCurrentMember(members[idx]);
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
