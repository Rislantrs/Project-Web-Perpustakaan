import { supabase } from './supabase';
import { dbGet, dbSave, DB_KEYS, type Member } from './db';
import { saveCurrentMember } from './memberSession';

const avatarColors = [
  '#8b1c24', '#0c2f3d', '#d6a54a', '#0f6063', '#6b5840',
  '#2d5a27', '#5b3a8c', '#c05621', '#1a6b8a', '#8b4513'
];

const generateId = (): string =>
  `supabase_${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

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

const syncMemberDirectory = (member: Member) => {
  const members = dbGet<Member[]>(DB_KEYS.MEMBERS, []);
  const next = members.filter((item) => item.email !== member.email && item.id !== member.id);
  next.push(member);
  dbSave(DB_KEYS.MEMBERS, next);
};

const buildMember = (payload: {
  email: string;
  namaLengkap?: string;
  nik?: string;
  alamat?: string;
  telepon?: string;
  jenisKelamin?: 'L' | 'P';
  tanggalLahir?: string;
  authId?: string;
}): Member => ({
  id: payload.authId || generateId(),
  nomorAnggota: generateMemberNumber(),
  namaLengkap: payload.namaLengkap?.trim() || payload.email.split('@')[0],
  nik: payload.nik || '',
  email: payload.email.toLowerCase().trim(),
  password: 'managed-by-supabase-auth',
  alamat: payload.alamat?.trim() || '',
  telepon: payload.telepon?.replace(/\D/g, '') || '',
  jenisKelamin: payload.jenisKelamin || 'L',
  tanggalLahir: payload.tanggalLahir || '',
  tanggalDaftar: formatDateNow(),
  avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
});

export const registerWithSupabase = async (data: {
  namaLengkap: string;
  nik: string;
  email: string;
  password: string;
  alamat?: string;
  telepon?: string;
  jenisKelamin?: 'L' | 'P';
  tanggalLahir?: string;
}): Promise<{ success: boolean; message: string; member?: Member }> => {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        namaLengkap: data.namaLengkap,
        nik: data.nik,
        alamat: data.alamat,
        telepon: data.telepon,
        jenisKelamin: data.jenisKelamin,
        tanggalLahir: data.tanggalLahir,
      },
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  const member = buildMember({
    email: data.email,
    namaLengkap: data.namaLengkap,
    nik: data.nik,
    alamat: data.alamat,
    telepon: data.telepon,
    jenisKelamin: data.jenisKelamin,
    tanggalLahir: data.tanggalLahir,
    authId: authData.user?.id,
  });

  syncMemberDirectory(member);
  saveCurrentMember(member);

  return {
    success: true,
    message: authData.session
      ? `Akun Supabase berhasil dibuat. Selamat datang, ${member.namaLengkap}!`
      : 'Akun dibuat. Cek email Anda untuk konfirmasi jika diperlukan oleh setting Supabase.',
    member,
  };
};

export const loginWithSupabase = async (email: string, password: string): Promise<{ success: boolean; message: string; member?: Member }> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { success: false, message: error?.message || 'Login Supabase gagal.' };
  }

  const members = dbGet<Member[]>(DB_KEYS.MEMBERS, []);
  const meta = data.user.user_metadata || {};
  const existing = members.find((member) => member.email === email.toLowerCase().trim() || member.id === data.user.id);
  const member = existing || buildMember({
    email,
    namaLengkap: meta.namaLengkap,
    nik: meta.nik,
    alamat: meta.alamat,
    telepon: meta.telepon,
    jenisKelamin: meta.jenisKelamin,
    tanggalLahir: meta.tanggalLahir,
    authId: data.user.id,
  });

  syncMemberDirectory(member);
  saveCurrentMember(member);

  return {
    success: true,
    message: `Selamat datang, ${member.namaLengkap}!`,
    member,
  };
};

export const resetPasswordWithSupabase = async (email: string): Promise<{ success: boolean; message: string }> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: 'Tautan reset password sudah dikirim ke email Anda.' };
};
