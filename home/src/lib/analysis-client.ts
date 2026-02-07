"use client";

import { createClient } from "@/lib/supabase/client";
import type { AnalysisPayload } from "@/lib/types";

export type FetchAnalysisResult = {
  data: AnalysisPayload | null;
  error: string | null;
};

/**
 * Fetches analysis data from the edge function using client-side Supabase client.
 * This function should be called from client components.
 */
export async function fetchAnalysisClient(): Promise<FetchAnalysisResult> {
  const supabase = createClient();
  
  // Get the current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return { data: null, error: "Not authenticated. Please sign in." };
  }

  // Call the edge function with Authorization header
  const { data, error: invokeError } = await supabase.functions.invoke(
    "analysis",
    {
      body: {},
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (invokeError) {
    return { data: null, error: invokeError.message };
  }

  return { data: data as AnalysisPayload, error: null };
}
