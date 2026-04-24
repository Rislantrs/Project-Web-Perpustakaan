import { createClient } from '@supabase/supabase-js';
import { assertSupabaseEnv } from './backendConfig';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

assertSupabaseEnv();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
