import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "RoastVerse: missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — add them to your .env file. " +
      "See README.md for setup instructions."
  );
}

// The anon key is safe to expose in the browser by design — it's meant to be
// public. Row Level Security policies (see supabase/schema.sql) control what
// it's actually allowed to read/write, not secrecy of the key itself.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
