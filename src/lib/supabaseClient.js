// lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// ✅ FIRST: declare the constants
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const STORAGE_BUCKET =
  import.meta.env.VITE_SUPABASE_BUCKET || "mixtape-tracks";

// ✅ THEN: log them
console.log("[DEBUG] SUPABASE_URL:", SUPABASE_URL);
console.log("[DEBUG] Anon key present?", !!SUPABASE_ANON_KEY);
console.log("[DEBUG] Bucket:", STORAGE_BUCKET);

// Used by the rest of the app to know if cloud sync is available
export const isSupabaseConfigured =
  Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);

console.log("[DEBUG] isSupabaseConfigured:", isSupabaseConfigured);

// Only create a client if config is present
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export default supabase;