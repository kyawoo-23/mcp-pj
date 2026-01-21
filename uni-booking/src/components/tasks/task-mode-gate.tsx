"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type {
  Profile,
  TaskSession,
  SystemType,
  TaskProgressStatus,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";
import { writeStoredTaskSession } from "@/lib/task-mode-client";

interface TaskModeGateProps {
  profile: Pick<Profile, "id" | "age_range" | "gender"> | null;
  session: Pick<TaskSession, "id" | "status" | "system_type"> | null;
  systemType: SystemType;
}

const ageOptions: Array<{ value: Profile["age_range"]; label: string }> = [
  { value: "under_18", label: "Under 18" },
  { value: "18_24", label: "18-24" },
  { value: "25_34", label: "25-34" },
  { value: "35_44", label: "35-44" },
  { value: "45_54", label: "45-54" },
  { value: "55_plus", label: "55+" },
  { value: "prefer_not_say", label: "Prefer not to say" },
];

const genderOptions: Array<{ value: Profile["gender"]; label: string }> = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "prefer_not_say", label: "Prefer not to say" },
];

export function TaskModeGate({
  profile,
  session,
  systemType,
}: TaskModeGateProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [ageRange, setAgeRange] = useState<Profile["age_range"] | null>(
    profile?.age_range ?? null,
  );
  const [gender, setGender] = useState<Profile["gender"] | null>(
    profile?.gender ?? null,
  );
  const [saving, setSaving] = useState(false);

  const requiresDemographics = useMemo(() => {
    return !profile?.age_range || !profile?.gender;
  }, [profile]);

  useEffect(() => {
    if (session?.status === "in_progress") {
      if (session.id) {
        writeStoredTaskSession({ id: session.id, systemType });
      }
      router.push("/tasks/session");
    }
  }, [session, router, systemType]);

  if (session?.status === "in_progress") {
    return null;
  }

  if (!profile) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background p-6'>
        <div className='absolute left-6 top-6'>
          <Button
            variant='ghost'
            onClick={() => router.push("/facilities")}
            className='w-fit'
          >
            <ChevronLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
        </div>
        <Card className='w-full max-w-xl'>
          <CardHeader>
            <CardTitle>Task Mode</CardTitle>
            <CardDescription>Profile not found.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleStart = async () => {
    if (requiresDemographics) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const { data: upserted } = await supabase
        .from("task_sessions")
        .upsert(
          {
            user_id: profile.id,
            system_type: systemType,
            status: "in_progress" as TaskProgressStatus,
            started_at: now,
            updated_at: now,
          },
          { onConflict: "user_id,system_type" },
        )
        .select()
        .single();

      if (upserted) {
        writeStoredTaskSession({ id: upserted.id, systemType });
      }

      router.push("/tasks/session");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDemographics = async () => {
    if (!ageRange || !gender) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          age_range: ageRange,
          gender,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) {
        toast.error("Failed to save demographics", {
          description: error.message,
        });
        return;
      }

      toast.success("Demographics saved successfully");

      // Start the task session directly after saving demographics
      const now = new Date().toISOString();
      const { data: upserted } = await supabase
        .from("task_sessions")
        .upsert(
          {
            user_id: profile.id,
            system_type: systemType,
            status: "in_progress" as TaskProgressStatus,
            started_at: now,
            updated_at: now,
          },
          { onConflict: "user_id,system_type" },
        )
        .select()
        .single();

      if (upserted) {
        writeStoredTaskSession({ id: upserted.id, systemType });
      }

      router.push("/tasks/session");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-6'>
      <div className='absolute left-6 top-6'>
        <Button variant='ghost' onClick={() => router.back()} className='w-fit'>
          <ChevronLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
      </div>
      <Card className='w-full max-w-xl shadow-lg'>
        <CardHeader>
          <CardTitle>Task Mode</CardTitle>
          <CardDescription>
            Complete the short demographics check and start your task session.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {requiresDemographics && (
            <>
              <div className='space-y-2'>
                <Label>Age range</Label>
                <Select
                  value={ageRange ?? undefined}
                  onValueChange={(value) =>
                    setAgeRange(value as Profile["age_range"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select your age range' />
                  </SelectTrigger>
                  <SelectContent>
                    {ageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value || ""}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>Gender</Label>
                <Select
                  value={gender ?? undefined}
                  onValueChange={(value) =>
                    setGender(value as Profile["gender"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select your gender' />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value || ""}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          {!requiresDemographics && (
            <p className='text-sm text-muted-foreground'>
              Your demographics are already recorded. You can start or resume
              the task session.
            </p>
          )}
        </CardContent>
        <CardFooter className='flex justify-end gap-2'>
          <Button
            onClick={
              requiresDemographics ? handleSaveDemographics : handleStart
            }
            disabled={
              saving || (requiresDemographics && (!ageRange || !gender))
            }
          >
            {saving ? "Starting..." : "Start Task Session"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
