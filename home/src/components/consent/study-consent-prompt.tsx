import { createClient } from "@/lib/supabase/server";
import { STUDY_CONSENT_VERSION } from "@/lib/study-consent";
import { StudyConsentAccountDialog } from "@/components/consent/study-consent-account-dialog";

export async function StudyConsentPrompt() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("consent_version, consented_at")
    .eq("id", user.id)
    .maybeSingle();

  if (
    profile?.consented_at &&
    profile.consent_version === STUDY_CONSENT_VERSION
  ) {
    return null;
  }

  return <StudyConsentAccountDialog />;
}
