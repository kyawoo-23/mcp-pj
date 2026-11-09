"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { STUDY_CONSENT_VERSION } from "@/lib/study-consent";

type SuccessResult<T> = { ok: true; data: T };
type ErrorResult = { ok: false; error: string };

export async function recordStudyConsentAction(): Promise<
  SuccessResult<{ consentedAt: string }> | ErrorResult
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You need to sign in again." };
  }

  const consentedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      consent_version: STUDY_CONSENT_VERSION,
      consented_at: consentedAt,
      updated_at: consentedAt,
    })
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to record study consent:", error);
    return {
      ok: false,
      error: "Failed to save your agreement. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  return { ok: true, data: { consentedAt } };
}
