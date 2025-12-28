import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsPageClient } from "@/components/settings/settings-page-client";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <SettingsPageClient />;
}
