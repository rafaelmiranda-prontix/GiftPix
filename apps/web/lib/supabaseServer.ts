import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Prefer service key on server; fallback to anon key
const key = serviceKey || anonKey || '';

export const supabaseServer = supabaseUrl && key ? createClient(supabaseUrl, key) : null;
