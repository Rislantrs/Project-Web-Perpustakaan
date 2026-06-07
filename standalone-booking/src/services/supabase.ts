import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Shared singleton client untuk auth, database, dan storage.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
