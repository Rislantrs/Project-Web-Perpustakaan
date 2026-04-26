import { createClient } from '@supabase/supabase-js';
import { assertSupabaseEnv } from './backendConfig';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail-fast: hentikan app lebih awal jika env wajib belum diisi.
assertSupabaseEnv();

// Shared singleton client untuk auth, database, dan storage.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
