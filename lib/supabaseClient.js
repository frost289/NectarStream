import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yqtiklukkhjewtvwbahg.supabase.co';
const supabaseAnonKey = 'sb_publishable_FIPJq5192eoq-udLuGl0yg_rYJ5rTue';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);