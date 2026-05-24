import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url && publishableKey);

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    '[Zafirus] Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local to enable multi-tab persistence.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(url, publishableKey)
  : null;
