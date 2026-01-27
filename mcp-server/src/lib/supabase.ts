import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../supabase/types/database.types"

let supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Get or create the Supabase client instance using service role key.
 * This is for server-to-server communication, not for client-side use.
 */
export function getSupabase(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
    );
  }

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseInstance;
}
