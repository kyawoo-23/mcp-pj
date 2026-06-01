"use client";

import * as React from "react";
import { useRouter } from "@bprogress/next/app";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import {
  profileSchema,
  type ProfileFormData,
} from "@/components/settings/settings-schemas";

export function SettingsProfileCard({
  userId,
  defaultValues,
}: {
  userId: string;
  defaultValues: ProfileFormData;
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          student_id: data.student_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      router.refresh();
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your profile information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='full_name'>
              Full Name <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='full_name'
              placeholder='Enter your full name'
              {...register("full_name")}
            />
            {errors.full_name && (
              <p className='text-sm text-destructive'>
                {errors.full_name.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              disabled
              className='bg-muted'
              {...register("email")}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='student_id'>
              Student ID <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='student_id'
              type='text'
              placeholder='Enter Student ID'
              {...register("student_id")}
            />
            {errors.student_id && (
              <p className='text-sm text-destructive'>
                {errors.student_id.message}
              </p>
            )}
          </div>

          <div className='flex justify-end'>
            <Button type='submit' disabled={isSaving}>
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save className='mr-2 h-4 w-4' />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
