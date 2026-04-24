export type BackendMode = 'supabase' | 'local' | 'custom-sql' | 'mongo';
export type AuthProvider = 'supabase' | 'local';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const normalizeMode = (value?: string): BackendMode => {
  const mode = (value || '').toLowerCase();
  if (mode === 'local' || mode === 'custom-sql' || mode === 'mongo') return mode;
  return 'supabase';
};

// Ubah lewat .env tanpa edit halaman:
// VITE_BACKEND_MODE=supabase | local | custom-sql | mongo
// VITE_AUTH_PROVIDER=supabase | local
// VITE_SUPABASE_URL=...
// VITE_SUPABASE_ANON_KEY=...
//
// Untuk client yang sudah punya SQL/Mongo, cukup ganti mode di sini lalu
// arahkan service layer ke adapter baru. UI tidak perlu dirombak.
export const BACKEND_MODE: BackendMode =
  SUPABASE_URL && SUPABASE_ANON_KEY ? normalizeMode(import.meta.env.VITE_BACKEND_MODE) : 'local';

export const AUTH_PROVIDER: AuthProvider =
  BACKEND_MODE === 'supabase' && SUPABASE_URL && SUPABASE_ANON_KEY
    ? ((import.meta.env.VITE_AUTH_PROVIDER || 'supabase').toLowerCase() === 'local' ? 'local' : 'supabase')
    : 'local';

export const USE_SUPABASE_DATA = BACKEND_MODE === 'supabase';
export const USE_SUPABASE_AUTH = AUTH_PROVIDER === 'supabase';
export const HAS_SUPABASE_CONFIG = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
