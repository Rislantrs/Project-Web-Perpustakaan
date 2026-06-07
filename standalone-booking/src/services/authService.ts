import { supabase } from './supabase';

export interface Admin {
  id: string;
  namaLengkap: string;
  email: string;
  role: 'super_admin' | 'admin';
  avatarColor?: string;
}

const CURRENT_ADMIN_KEY = 'disipusda_current_admin';

export const isLoggedIn = (): boolean => {
  return !!sessionStorage.getItem(CURRENT_ADMIN_KEY);
};

export const isAdminLoggedIn = (): boolean => {
  return isLoggedIn();
};

export const getCurrentAdmin = (): Admin | null => {
  const sessionStr = sessionStorage.getItem(CURRENT_ADMIN_KEY);
  if (!sessionStr) return null;
  try {
    const data = JSON.parse(sessionStr);
    return data.admin || null;
  } catch {
    return null;
  }
};

export const loginAdmin = async (email: string, password: string): Promise<{ success: boolean; message: string; admin?: Admin }> => {
  const normalizedEmail = email.toLowerCase().trim();

  // Log in using Supabase Auth
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (authError) {
    return {
      success: false,
      message: `Email atau password salah: ${authError.message}`,
    };
  }

  // Fetch admin profile details from the 'admins' table
  const { data: adminRow, error: adminError } = await supabase
    .from('admins')
    .select('*')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (adminError || !adminRow) {
    await supabase.auth.signOut();
    return {
      success: false,
      message: 'Akun berhasil login, tetapi Anda tidak memiliki akses sebagai admin.',
    };
  }

  const admin: Admin = {
    id: adminRow.id,
    namaLengkap: adminRow.nama_lengkap,
    email: adminRow.email,
    role: adminRow.role,
    avatarColor: adminRow.avatar_color || '#0c2f3d',
  };

  sessionStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify({ admin, expiresAt: Date.now() + 12 * 60 * 60 * 1000 }));
  return { success: true, message: `Selamat datang, ${admin.namaLengkap}!`, admin };
};

export const logoutAdmin = (): void => {
  sessionStorage.removeItem(CURRENT_ADMIN_KEY);
  void supabase.auth.signOut();
};

export const getInitials = (name: string): string =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
