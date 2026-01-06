"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
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

export function SettingsPageClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);

  const [formData, setFormData] = React.useState({
    id: "",
    full_name: "",
    email: "",
    student_id: "",
  });

  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          setFormData({
            id: user.id,
            full_name: profile.full_name || "",
            email: profile.email || user.email || "",
            student_id: profile.student_id || "",
          });
        }
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          student_id: formData.student_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", formData.id);

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

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        Loading settings...
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='px-4 py-4 container mx-auto'>
        <Button variant='link' size='icon' onClick={() => router.back()}>
          <ArrowLeft className='h-5 w-5' />
        </Button>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-4 md:p-6'>
        <div className='mx-auto max-w-2xl space-y-6'>
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your profile information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className='space-y-6'>
                {/* Name */}
                <div className='space-y-2'>
                  <Label htmlFor='name'>Full Name</Label>
                  <Input
                    id='name'
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    placeholder='Enter your full name'
                  />
                </div>

                {/* Email */}
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    value={formData.email}
                    disabled
                    className='bg-muted'
                  />
                </div>

                {/* Student ID */}
                <div className='space-y-2'>
                  <Label htmlFor='student_id'>Student ID</Label>
                  <Input
                    id='student_id'
                    type='number'
                    value={formData.student_id}
                    onChange={(e) =>
                      setFormData({ ...formData, student_id: e.target.value })
                    }
                    placeholder='Enter Student ID'
                  />
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
        </div>
      </div>
    </div>
  );
}
