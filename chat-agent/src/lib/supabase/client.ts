import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../../../supabase/types/database.types";

export function createClient() {
  const holder: { client?: SupabaseClient<Database> } = {};

  const client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: {
        accessToken: async () => {
          const { data } = await holder.client!.auth.getSession();
          return data.session?.access_token ?? null;
        },
      },
    },
  );

  holder.client = client;
  return client;
}
