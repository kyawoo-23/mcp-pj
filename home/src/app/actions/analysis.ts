"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AnalysisPayload } from "@/lib/types";

type SuccessResult<T> = { ok: true; data: T };
type ErrorResult = { ok: false; error: string };
export type AnalysisActionResult<T = void> = SuccessResult<T> | ErrorResult;

export type FetchAnalysisResult = {
  data: AnalysisPayload | null;
  error: string | null;
};

/**
 * Fetches analysis data from the edge function. Redirects to login if not authenticated.
 * Use in server components (e.g. analysis page).
 */
export async function fetchAnalysis(): Promise<FetchAnalysisResult> {
  const supabase = await createClient();
  const [
    { data: { user } },
    { data: { session } },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);

  if (!user) {
    redirect("/auth/login");
  }

  if (!session?.access_token) {
    return { data: null, error: "Session missing. Please sign in again." };
  }

  // Server-side invoke() may not send the JWT in production (cookie vs header).
  // Pass the access token explicitly so the Edge Function receives Authorization.
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

/**
 * Revalidates the analysis page so the server component refetches data.
 * Call from the client (e.g. Retry button) to refresh analysis without a full reload.
 */
export async function revalidateAnalysisAction(): Promise<AnalysisActionResult> {
  try {
    revalidatePath("/analysis");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("Revalidate analysis error:", err);
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Failed to refresh analysis.",
    };
  }
}
