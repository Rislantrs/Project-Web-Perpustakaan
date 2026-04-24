/// <reference types="vite/client" />

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const USE_SUPABASE_DATA = true;
export const USE_SUPABASE_AUTH = true;
export const BACKEND_MODE = 'supabase' as const;
export const AUTH_PROVIDER = 'supabase' as const;
export const HAS_SUPABASE_CONFIG = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const assertSupabaseEnv = (): void => {
  if (!HAS_SUPABASE_CONFIG) {
    throw new Error('Supabase environment is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
};
