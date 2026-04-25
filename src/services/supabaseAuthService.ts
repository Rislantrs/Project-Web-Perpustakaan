import { supabase } from './supabase';
import { dbGet, dbSave, DB_KEYS, type Member } from './db';
import { saveCurrentMember } from './memberSession';
import type { EmailOtpType, User } from '@supabase/supabase-js';

/**
 * SUPABASE AUTH SERVICE
 * ---------------------
 * Layanan pusat untuk menangani autentikasi pengguna dan sinkronisasi data 
 * antara Supabase Auth (Identity) dan tabel 'members' (Profile).
 */
const MEMBERS_TABLE = 'members';

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
  is_active?: boolean;
};

/** 
 * Daftar warna avatar default untuk anggota baru 
 */
const avatarColors = [
  '#8b1c24', '#0c2f3d', '#d6a54a', '#0f6063', '#6b5840',
  '#2d5a27', '#5b3a8c', '#c05621', '#1a6b8a', '#8b4513'
];

/** 
 * Membuat ID unik untuk fallback jika Supabase Auth ID belum tersedia 
 */
const generateId = (): string =>
  `supabase_${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

/** 
 * Generate nomor anggota resmi perpustakaan format: PWK-YYYY-RANDOM 
 */
const generateMemberNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PWK-${year}-${random}`;
};

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
/** 
 * Format tanggal hari ini ke bahasa Indonesia: "25 April 2026" 
 */
const formatDateNow = (): string => {
  const now = new Date();
  return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
};

/** 
 * Logika Sensor NIK (Masking): 
 * Menyembunyikan seluruh digit NIK kecuali 4 digit terakhir demi privasi.
 */
const maskNik = (value?: string): string => {
  const raw = (value || '').trim();
  if (!raw) return '************';
  if (raw.includes('*')) return raw;
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '************';
  if (digits.length <= 4) return '*'.repeat(digits.length);
  return '*'.repeat(digits.length - 4) + digits.slice(-4);
};

/** 
 * Sanitasi data NIK sebelum dikirim ke frontend 
 */
const sanitizeMemberNik = (member: Member): Member => ({
  ...member,
  nik: maskNik(member.nik),
});

const sanitizeMemberDirectory = (members: Member[]): Member[] => members.map(sanitizeMemberNik);

/** 
 * MAPPING DATA: 
 * Mengubah format baris database (Supabase) ke format Object Member (Aplikasi)
 */
const mapRowToMember = (row: SupabaseMemberRow): Member => ({
  id: row.id,
  nomorAnggota: row.nomor_anggota,
  namaLengkap: row.nama_lengkap,
  nik: maskNik(row.nik_masked),
  email: (row.email || '').toLowerCase().trim(),
  password: row.password || 'managed-by-supabase-auth',
  alamat: row.alamat || '',
  telepon: row.telepon || '',
  jenisKelamin: row.jenis_kelamin || 'L',
  tanggalLahir: row.tanggal_lahir || '',
  tanggalDaftar: row.tanggal_daftar || formatDateNow(),
  avatarColor: row.avatar_color || avatarColors[0],
  avatarUrl: row.avatar_url || '',
  bio: row.bio || '',
});

/** 
 * MAPPING DATA: 
 * Mengubah format Object Member (Aplikasi) ke format baris database (Supabase)
 */
const mapMemberToRow = (member: Member): SupabaseMemberRow => ({
  id: member.id,
  nomor_anggota: member.nomorAnggota,
  nama_lengkap: member.namaLengkap,
  nik_masked: maskNik(member.nik),
  email: member.email,
  password: member.password,
  alamat: member.alamat,
  telepon: member.telepon,
  jenis_kelamin: member.jenisKelamin,
  tanggal_lahir: member.tanggalLahir,
  tanggal_daftar: member.tanggalDaftar,
  avatar_color: member.avatarColor,
  avatar_url: member.avatarUrl,
  bio: member.bio,
  is_active: true,
});

const syncMemberToSupabase = async (member: Member) => {
  const payload = mapMemberToRow(member);
  const { error } = await supabase
    .from(MEMBERS_TABLE)
    .upsert(payload, { onConflict: 'id' });
  if (error) {
    console.warn('Sync member ke Supabase gagal:', error.message);
  }
};

const sanitizeStoredMembers = () => {
  const members = dbGet<Member[]>(DB_KEYS.MEMBERS, []);
  if (!members.length) return;
  const sanitized = sanitizeMemberDirectory(members);
  const changed = sanitized.some((member, index) => member.nik !== (members[index]?.nik || ''));
  if (changed) dbSave(DB_KEYS.MEMBERS, sanitized);
};

sanitizeStoredMembers();

const syncMemberDirectory = (member: Member) => {
  const members = sanitizeMemberDirectory(dbGet<Member[]>(DB_KEYS.MEMBERS, []));
  const next = members.filter((item) => item.email !== member.email && item.id !== member.id);
  const normalized = sanitizeMemberNik(member);
  next.push(normalized);
  dbSave(DB_KEYS.MEMBERS, next);
  void syncMemberToSupabase(normalized);
};

export const refreshMembersFromSupabase = async (): Promise<Member[]> => {
  const { data, error } = await supabase
    .from(MEMBERS_TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Gagal ambil data dari Supabase, pakai data lokal:', error.message);
    return dbGet<Member[]>(DB_KEYS.MEMBERS, []);
  }

  const members = (data || []).map((row) => mapRowToMember(row as SupabaseMemberRow));
  
  // Update data lokal agar sama persis dengan Cloud
  dbSave(DB_KEYS.MEMBERS, sanitizeMemberDirectory(members));
  
  return members;
};

/** 
 * DELETE MEMBER: 
 * Menghapus permanen anggota dari database Cloud (Supabase) dan cache Lokal.
 */
export const deleteMemberFromSupabase = async (memberId: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Mencoba menghapus member dengan ID:', memberId);
    
    // 1. Hapus dari tabel Members (Membutuhkan SQL Bypass RLS)
    const { error, count } = await supabase
      .from(MEMBERS_TABLE)
      .delete({ count: 'exact' })
      .eq('id', memberId);

    if (error) {
      console.error('Database Error saat hapus:', error);
      return { success: false, message: `Gagal menghapus: ${error.message}` };
    }

    // Jika count adalah 0, berarti ID tidak ditemukan di database Cloud
    if (count === 0) {
      console.warn('Hapus berhasil dijalankan tapi 0 baris terpengaruh. Cek RLS atau ID.');
      return { 
        success: false, 
        message: 'Gagal: Data tidak ditemukan di Cloud atau akses ditolak oleh sistem keamanan (RLS).' 
      };
    }

    // 2. Bersihkan dari Local Storage (Cache)
    const localMembers = dbGet<Member[]>(DB_KEYS.MEMBERS, []).filter((member) => member.id !== memberId);
    dbSave(DB_KEYS.MEMBERS, localMembers);
    
    return { success: true, message: 'Anggota berhasil dihapus secara permanen dari sistem.' };
  } catch (err: any) {
    return { success: false, message: `Eror Sistem: ${err.message}` };
  }
};



/** 
 * REGISTER: 
 * Alur pendaftaran anggota baru (Supabase Auth + Database Profile).
 */
export const registerWithSupabase = async (data: {
  namaLengkap: string;
  nik: string;
  email: string;
  password: string;
  alamat?: string;
  telepon?: string;
  jenisKelamin?: 'L' | 'P';
  tanggalLahir?: string;
}): Promise<{ success: boolean; message: string; member?: Member; requiresEmailVerification?: boolean; email?: string }> => {
  const normalizedEmail = data.email.toLowerCase().trim();
  
  // 1. Registrasi ke Supabase Auth (Identity)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: data.password,
    options: {
      data: {
        namaLengkap: data.namaLengkap.trim(),
        nik: data.nik.trim(),
        alamat: data.alamat?.trim() || '',
        telepon: data.telepon?.replace(/\D/g, '') || '',
        jenisKelamin: data.jenisKelamin || 'L',
        tanggalLahir: data.tanggalLahir || '',
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    }
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      return { success: false, message: 'Email sudah terdaftar. Silakan gunakan email lain atau reset password.' };
    }
    return { success: false, message: `Gagal mendaftar: ${authError.message}` };
  }

  if (!authData.user) {
    return { success: false, message: 'Gagal membuat akun. Silakan coba lagi.' };
  }

  // Jika user baru benar-benar dibuat (identities tidak kosong)
  const isNewUser = authData.user.identities && authData.user.identities.length > 0;
  
  if (!isNewUser) {
     return { success: false, message: 'Email ini sudah pernah digunakan. Periksa kotak masuk email Anda untuk link verifikasi sebelumnya.' };
  }

  // Buat objek member untuk disimpan lokal sebagai cache
  const newMember = buildMember({
    email: normalizedEmail,
    namaLengkap: data.namaLengkap,
    nik: data.nik,
    alamat: data.alamat,
    telepon: data.telepon,
    jenisKelamin: data.jenisKelamin,
    tanggalLahir: data.tanggalLahir,
    authId: authData.user.id,
  });

  // Simpan ke tabel public.members di Supabase
  const { error: dbError } = await supabase
    .from(MEMBERS_TABLE)
    .insert([mapMemberToRow(newMember)]);

  if (dbError) {
    console.error('Error saving member to DB table:', dbError);
    // Kita tetap lanjut karena user auth sudah berhasil dibuat
  }

  syncMemberDirectory(newMember);
  
  return { 
    success: true, 
    message: 'Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.',
    member: newMember,
    requiresEmailVerification: true,
    email: normalizedEmail
  };
};

const syncMemberFromAuthUser = (user: User): Member => {
  const members = dbGet<Member[]>(DB_KEYS.MEMBERS, []);
  const existing = members.find((member) => member.id === user.id || member.email === (user.email || '').toLowerCase().trim());
  const meta = user.user_metadata || {};

  const member = existing || buildMember({
    email: user.email || '',
    namaLengkap: meta.namaLengkap,
    nik: meta.nik,
    alamat: meta.alamat,
    telepon: meta.telepon,
    jenisKelamin: meta.jenisKelamin,
    tanggalLahir: meta.tanggalLahir,
    authId: user.id,
  });

  syncMemberDirectory(member);
  saveCurrentMember(member);
  return member;
};

export type AuthCallbackResult = {
  success: boolean;
  message: string;
  type?: string;
};

type CallbackOtpType = 'signup' | 'magiclink';

const parseAuthUrl = (inputUrl: string) => {
  const url = new URL(inputUrl);
  const queryParams = url.searchParams;
  const hashParams = new URLSearchParams((url.hash || '').replace(/^#/, ''));

  const code = queryParams.get('code');
  const queryType = queryParams.get('type');
  const hashType = hashParams.get('type');
  const tokenHash = queryParams.get('token_hash') || hashParams.get('token_hash');
  const type = (queryType || hashType || '').toLowerCase();
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');

  return {
    code,
    type,
    tokenHash,
    accessToken,
    refreshToken,
  };
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
  nik: maskNik(payload.nik),
  email: payload.email.toLowerCase().trim(),
  password: 'managed-by-supabase-auth',
  alamat: payload.alamat?.trim() || '',
  telepon: payload.telepon?.replace(/\D/g, '') || '',
  jenisKelamin: payload.jenisKelamin || 'L',
  tanggalLahir: payload.tanggalLahir || '',
  tanggalDaftar: formatDateNow(),
  avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
});



/** 
 * LOGIN: 
 * Melakukan autentikasi email & password ke Supabase Auth.
 */
export const loginWithSupabase = async (email: string, password: string): Promise<{ success: boolean; message: string; member?: Member; needsVerification?: boolean; email?: string }> => {
  const normalizedEmail = email.toLowerCase().trim();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error || !data.user) {
    const msg = error?.message || 'Login Supabase gagal.';
    // Cek apakah error disebabkan karena email belum dikonfirmasi
    const needsVerification = /email.*confirm|confirmed|verify/i.test(msg);
    return { success: false, message: msg, needsVerification, email: normalizedEmail };
  }

  // Ambil data profil dari Metadata/Database dan sinkronkan ke lokal
  const member = syncMemberFromAuthUser(data.user);

  return {
    success: true,
    message: `Selamat datang, ${member.namaLengkap}!`,
    member,
  };
};

export const resetPasswordWithSupabase = async (email: string): Promise<{ success: boolean; message: string }> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback`,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: 'Tautan reset password sudah dikirim ke email Anda.' };
};

export const resendSignupVerification = async (email: string): Promise<{ success: boolean; message: string }> => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) return { success: false, message: error.message };
  return { success: true, message: 'Email verifikasi berhasil dikirim ulang.' };
};

/** 
 * MANUAL OTP VERIFICATION: 
 * Digunakan jika user memasukkan kode angka 8-digit dari email secara manual.
 */
export const verifySignupOtp = async (email: string, token: string): Promise<{ success: boolean; message: string }> => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  });

  if (error) return { success: false, message: error.message };
  if (data.user) syncMemberFromAuthUser(data.user);
  return { success: true, message: 'Verifikasi berhasil. Akun Anda sudah aktif.' };
};

export const updatePasswordAfterRecovery = async (password: string): Promise<{ success: boolean; message: string }> => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { success: false, message: error.message };
  return { success: true, message: 'Password berhasil diperbarui. Silakan login kembali.' };
};

export const consumeAuthCallbackUrl = async (): Promise<AuthCallbackResult> => {
  try {
    const { code, type, tokenHash, accessToken, refreshToken } = parseAuthUrl(window.location.href);

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) return { success: false, message: error.message };
      if (data.user) syncMemberFromAuthUser(data.user);
      return { success: true, message: 'Autentikasi berhasil.', type };
    }

    if (tokenHash && type) {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as EmailOtpType,
      });
      if (error) return { success: false, message: error.message };
      if (data.user) syncMemberFromAuthUser(data.user);
      return { success: true, message: 'Verifikasi link berhasil.', type };
    }

    if (accessToken && refreshToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) return { success: false, message: error.message };
      if (data.user) syncMemberFromAuthUser(data.user);
      return { success: true, message: 'Sesi autentikasi berhasil dipulihkan.', type };
    }

    return { success: false, message: 'Link autentikasi tidak valid atau sudah kedaluwarsa.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Gagal memproses link autentikasi.' };
  }
};

export const verifyAuthCallbackTokenHash = async (
  tokenHash: string,
  type: CallbackOtpType,
): Promise<AuthCallbackResult> => {
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return { success: false, message: error.message, type };
  }

  if (data.user) {
    syncMemberFromAuthUser(data.user);
  }

  return { success: true, message: 'Link verifikasi berhasil diproses.', type };
};

export const consumeAuthCallbackFromLink = async (link: string): Promise<AuthCallbackResult> => {
  try {
    const { code, type, tokenHash, accessToken, refreshToken } = parseAuthUrl(link);

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) return { success: false, message: error.message };
      if (data.user) syncMemberFromAuthUser(data.user);
      return { success: true, message: 'Link berhasil diverifikasi.', type };
    }

    if (tokenHash && type) {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as EmailOtpType,
      });
      if (error) return { success: false, message: error.message };
      if (data.user) syncMemberFromAuthUser(data.user);
      return { success: true, message: 'Link berhasil diverifikasi.', type };
    }

    if (accessToken && refreshToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) return { success: false, message: error.message };
      if (data.user) syncMemberFromAuthUser(data.user);
      return { success: true, message: 'Sesi autentikasi berhasil dipulihkan.', type };
    }

    return { success: false, message: 'Link verifikasi tidak valid.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Gagal memproses link verifikasi.' };
  }
};
