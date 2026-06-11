"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AnalysisPayload } from "@/lib/types";
import type { StudyProtocolVersion } from "@/lib/analysis-calculations";

type SuccessResult<T> = { ok: true; data: T };
type ErrorResult = { ok: false; error: string };
export type AnalysisActionResult<T = void> = SuccessResult<T> | ErrorResult;

export type FetchAnalysisResult = {
  data: AnalysisPayload | null;
  error: string | null;
};

export type FetchProtocolCompletionCountsResult = {
  data: Record<StudyProtocolVersion, number> | null;
  error: string | null;
};

async function requireAuthenticatedSupabase() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return supabase;
}

function parseProtocolCompletionCounts(
  raw: unknown,
): Record<StudyProtocolVersion, number> | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const v1 = record.v1_simple;
  const v2 = record.v2_criteria;

  if (typeof v1 !== "number" || typeof v2 !== "number") {
    return null;
  }

  return {
    v1_simple: v1,
    v2_criteria: v2,
  };
}

/**
 * Fetches analysis data from the edge function. Redirects to login if not authenticated.
 * Pass protocolVersion to filter fact tables at the database (recommended for dashboards).
 */
export async function fetchAnalysis(options?: {
  protocolVersion?: StudyProtocolVersion;
}): Promise<FetchAnalysisResult> {
  const supabase = await requireAuthenticatedSupabase();

  const { data, error: invokeError } = await supabase.functions.invoke(
    "analysis",
    {
      body: options?.protocolVersion
        ? { protocol_version: options.protocolVersion }
        : {},
    },
  );

  if (invokeError) {
    return { data: null, error: invokeError.message };
  }

  return { data: data as AnalysisPayload, error: null };
}

/**
 * Lightweight per-protocol completed counts for the /analysis version picker.
 * Completion = distinct user_id in task_interview_responses per protocol_version.
 */
export async function fetchProtocolCompletionCounts(): Promise<FetchProtocolCompletionCountsResult> {
  const supabase = await requireAuthenticatedSupabase();

  const { data, error } = await supabase.rpc("get_protocol_completed_counts");

  if (error) {
    return { data: null, error: error.message };
  }

  const parsed = parseProtocolCompletionCounts(data);
  if (!parsed) {
    return { data: null, error: "Invalid protocol completion counts response" };
  }

  return { data: parsed, error: null };
}

/**
 * Revalidates the analysis page so the server component refetches data.
 * Call from the client (e.g. Retry button) to refresh analysis without a full reload.
 */
export async function revalidateAnalysisAction(): Promise<AnalysisActionResult> {
  try {
    revalidatePath("/analysis");
    revalidatePath("/analysis/v1");
    revalidatePath("/analysis/v2");
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
