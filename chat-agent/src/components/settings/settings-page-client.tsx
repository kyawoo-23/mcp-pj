"use client";

import * as React from "react";
import { useRouter } from "@bprogress/next/app";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { SettingsProfileCard } from "@/components/settings/settings-profile-card";
import { SettingsDemographicsCard } from "@/components/settings/settings-demographics-card";
import { SettingsChangePasswordCard } from "@/components/settings/settings-change-password-card";
import {
  EMPTY_DEMOGRAPHICS,
  demographicsFromProfile,
  type DemographicsDisplay,
} from "@/components/settings/settings-demographics";
import type { ProfileFormData } from "@/components/settings/settings-schemas";

const EMPTY_PROFILE: ProfileFormData = {
  full_name: "",
  student_id: "",
  email: "",
};

export function SettingsPageClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [userId, setUserId] = React.useState("");
  const [profile, setProfile] = React.useState<ProfileFormData>(EMPTY_PROFILE);
  const [demographics, setDemographics] =
    React.useState<DemographicsDisplay>(EMPTY_DEMOGRAPHICS);

  React.useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        const { data: row } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (row) {
          setProfile({
            full_name: row.full_name || "",
            email: row.email || user.email || "",
            student_id: row.student_id || "",
          });
          setDemographics(demographicsFromProfile(row));
        }
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Spinner
          variant='circle'
          size='lg'
          className='text-muted-foreground'
          aria-label='Loading settings'
        />
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='flex items-center gap-4 border-b px-4 py-4 md:px-6'>
        <Button variant='ghost' size='icon' onClick={() => router.push("/")}>
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <h1 className='text-xl font-semibold'>Settings</h1>
      </div>

      <div className='flex-1 overflow-y-auto p-4 md:p-6'>
        <div className='mx-auto max-w-2xl space-y-6'>
          {userId ? (
            <SettingsProfileCard userId={userId} defaultValues={profile} />
          ) : null}
          <SettingsDemographicsCard demographics={demographics} />
          <SettingsChangePasswordCard />
        </div>
      </div>
    </div>
  );
}
