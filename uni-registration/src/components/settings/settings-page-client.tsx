"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  student_id: z.string().min(1, "Student ID is required"),
  email: z.string(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function SettingsPageClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [userId, setUserId] = React.useState("");

  const [isSaving, setIsSaving] = React.useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = React.useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmitForm,
    reset: resetPassword,
    setError: setPasswordError,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          resetProfile({
            full_name: profile.full_name || "",
            email: profile.email || user.email || "",
            student_id: profile.student_id || "",
          });
        }
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [resetProfile]);

  const onProfileSubmit = async (data: ProfileFormData) => {
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

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsPasswordSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user found");

      const { data: rpcData, error } = await supabase.rpc("changepassword", {
        current_plain_password: data.currentPassword,
        new_plain_password: data.newPassword,
        current_id: user.id,
      });

      if (error) throw error;

      if ((rpcData as unknown as string) === "incorrect") {
        setPasswordError("currentPassword", {
          type: "manual",
          message: "Incorrect current password",
        });
        return;
      }

      if ((rpcData as unknown as string) === "success") {
        resetPassword();
        toast.success("Password updated successfully");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    } finally {
      setIsPasswordSaving(false);
    }
  };

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
      {/* Header */}
      <div className='px-4 py-4 container mx-auto'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => router.back()}
          className='cursor-pointer'
        >
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
              <form
                onSubmit={handleProfileSubmit(onProfileSubmit)}
                className='space-y-6'
              >
                {/* Name */}
                <div className='space-y-2'>
                  <Label htmlFor='full_name'>
                    Full Name <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id='full_name'
                    placeholder='Enter your full name'
                    {...registerProfile("full_name")}
                  />
                  {profileErrors.full_name && (
                    <p className='text-sm text-destructive'>
                      {profileErrors.full_name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    disabled
                    className='bg-muted'
                    {...registerProfile("email")}
                  />
                </div>

                {/* Student ID */}
                <div className='space-y-2'>
                  <Label htmlFor='student_id'>
                    Student ID <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id='student_id'
                    type='text'
                    placeholder='Enter Student ID'
                    {...registerProfile("student_id")}
                  />
                  {profileErrors.student_id && (
                    <p className='text-sm text-destructive'>
                      {profileErrors.student_id.message}
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

          {/* Change Password Section */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handlePasswordSubmitForm(onPasswordSubmit)}
                className='space-y-6'
              >
                <div className='space-y-2'>
                  <Label htmlFor='currentPassword'>Current Password</Label>
                  <div className='relative'>
                    <Input
                      id='currentPassword'
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder='Enter current password'
                      {...registerPassword("currentPassword")}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className='h-4 w-4 text-muted-foreground' />
                      ) : (
                        <Eye className='h-4 w-4 text-muted-foreground' />
                      )}
                      <span className='sr-only'>
                        {showCurrentPassword
                          ? "Hide password"
                          : "Show password"}
                      </span>
                    </Button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className='text-sm text-destructive'>
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='newPassword'>New Password</Label>
                  <div className='relative'>
                    <Input
                      id='newPassword'
                      type={showNewPassword ? "text" : "password"}
                      placeholder='Enter new password'
                      {...registerPassword("newPassword")}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className='h-4 w-4 text-muted-foreground' />
                      ) : (
                        <Eye className='h-4 w-4 text-muted-foreground' />
                      )}
                      <span className='sr-only'>
                        {showNewPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className='text-sm text-destructive'>
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='confirmNewPassword'>
                    Confirm New Password
                  </Label>
                  <div className='relative'>
                    <Input
                      id='confirmNewPassword'
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder='Confirm new password'
                      {...registerPassword("confirmPassword")}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className='h-4 w-4 text-muted-foreground' />
                      ) : (
                        <Eye className='h-4 w-4 text-muted-foreground' />
                      )}
                      <span className='sr-only'>
                        {showConfirmPassword
                          ? "Hide password"
                          : "Show password"}
                      </span>
                    </Button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className='text-sm text-destructive'>
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className='flex justify-end'>
                  <Button type='submit' disabled={isPasswordSaving}>
                    {isPasswordSaving ? (
                      "Updating..."
                    ) : (
                      <>
                        <Save className='mr-2 h-4 w-4' />
                        Update Password
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
