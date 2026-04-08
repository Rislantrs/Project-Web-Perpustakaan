// Auth Service — localStorage-based authentication for Disipusda Perpustakaan

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
  avatarUrl?: string; // base64 atau URL foto profil
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

const MEMBERS_KEY = 'disipusda_members';
const CURRENT_USER_KEY = 'disipusda_current_user';
const ADMINS_KEY = 'disipusda_admins';
const CURRENT_ADMIN_KEY = 'disipusda_current_admin';

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

const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const formatDateNow = (): string => {
  const now = new Date();
  return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
};

// === MEMBER FUNCTIONS ===

export const getMembers = (): Member[] => {
  const data = localStorage.getItem(MEMBERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const register = (data: {
  namaLengkap: string;
  nik: string;
  email: string;
  password: string;
  alamat: string;
  telepon: string;
  jenisKelamin: 'L' | 'P';
  tanggalLahir: string;
}): { success: boolean; message: string; member?: Member } => {
  const members = getMembers();

  if (members.find(m => m.email === data.email))
    return { success: false, message: 'Email sudah terdaftar. Silakan gunakan email lain.' };

  if (members.find(m => m.nik === data.nik))
    return { success: false, message: 'NIK sudah terdaftar. Silakan hubungi petugas perpustakaan.' };

  const newMember: Member = {
    id: generateId(),
    nomorAnggota: generateMemberNumber(),
    namaLengkap: data.namaLengkap,
    nik: data.nik,
    email: data.email,
    password: data.password,
    alamat: data.alamat,
    telepon: data.telepon,
    jenisKelamin: data.jenisKelamin,
    tanggalLahir: data.tanggalLahir,
    tanggalDaftar: formatDateNow(),
    avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
  };

  members.push(newMember);
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
  return { success: true, message: `Pendaftaran berhasil! Nomor anggota Anda: ${newMember.nomorAnggota}`, member: newMember };
};

export const login = (emailOrId: string, password: string): { success: boolean; message: string; member?: Member } => {
  const members = getMembers();
  const member = members.find(
    m => (m.email === emailOrId || m.nomorAnggota === emailOrId) && m.password === password
  );
  if (!member) return { success: false, message: 'Email/Nomor Anggota atau password salah.' };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(member));
  return { success: true, message: `Selamat datang, ${member.namaLengkap}!`, member };
};

export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): Member | null => {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const isLoggedIn = (): boolean => !!getCurrentUser();

export const updateMember = (id: string, updates: Partial<Member>): { success: boolean; message: string; member?: Member } => {
  const members = getMembers();
  const idx = members.findIndex(m => m.id === id);
  if (idx === -1) return { success: false, message: 'Member tidak ditemukan.' };

  members[idx] = { ...members[idx], ...updates };
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));

  // Update session if it's the current user
  const current = getCurrentUser();
  if (current?.id === id) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(members[idx]));
  }
  return { success: true, message: 'Profil berhasil diperbarui.', member: members[idx] };
};

export const deleteMember = (id: string): { success: boolean; message: string } => {
  const members = getMembers().filter(m => m.id !== id);
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
  return { success: true, message: 'Anggota berhasil dihapus.' };
};

export const getInitials = (name: string): string =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

// === ADMIN FUNCTIONS ===

const defaultAdmins: Admin[] = [
  {
    id: 'admin_001',
    namaLengkap: 'Super Admin',
    email: 'admin@disipusda.go.id',
    password: 'admin123',
    role: 'super_admin',
    tanggalDibuat: '1 Januari 2024',
    avatarColor: '#0c2f3d',
  },
];

export const getAdmins = (): Admin[] => {
  const data = localStorage.getItem(ADMINS_KEY);
  if (!data) {
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
  const admins = getAdmins();
  const admin = admins.find(a => a.email === email && a.password === password);
  if (!admin) return { success: false, message: 'Email atau password admin salah.' };
  localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify(admin));
  return { success: true, message: `Selamat datang, ${admin.namaLengkap}!`, admin };
};

export const getCurrentAdmin = (): Admin | null => {
  const data = localStorage.getItem(CURRENT_ADMIN_KEY);
  return data ? JSON.parse(data) : null;
};

export const logoutAdmin = (): void => {
  localStorage.removeItem(CURRENT_ADMIN_KEY);
};

export const isAdminLoggedIn = (): boolean => !!getCurrentAdmin();
