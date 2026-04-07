// Auth Service — localStorage-based authentication for Disipusda Perpustakaan

export interface Member {
  id: string;
  nomorAnggota: string;
  namaLengkap: string;
  nik: string;
  email: string;
  password: string; // In production, this would be hashed
  alamat: string;
  telepon: string;
  jenisKelamin: 'L' | 'P';
  tanggalLahir: string;
  tanggalDaftar: string;
  avatarColor: string;
}

const MEMBERS_KEY = 'disipusda_members';
const CURRENT_USER_KEY = 'disipusda_current_user';

const avatarColors = [
  '#8b1c24', '#0c2f3d', '#d6a54a', '#0f6063', '#6b5840',
  '#2d5a27', '#5b3a8c', '#c05621', '#1a6b8a', '#8b4513'
];

const generateMemberNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PWK-${year}-${random}`;
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

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

  // Check duplicate email
  if (members.find(m => m.email === data.email)) {
    return { success: false, message: 'Email sudah terdaftar. Silakan gunakan email lain.' };
  }

  // Check duplicate NIK
  if (members.find(m => m.nik === data.nik)) {
    return { success: false, message: 'NIK sudah terdaftar. Silakan hubungi petugas perpustakaan.' };
  }

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const now = new Date();

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
    tanggalDaftar: `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
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

  if (!member) {
    return { success: false, message: 'Email/Nomor Anggota atau password salah.' };
  }

  // Save current user (without password)
  const safeUser = { ...member };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));

  return { success: true, message: `Selamat datang, ${member.namaLengkap}!`, member };
};

export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): Member | null => {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const isLoggedIn = (): boolean => {
  return !!getCurrentUser();
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
