"use client";

import * as React from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasswordField } from "@/components/settings/password-field";
import {
  passwordSchema,
  type PasswordFormData,
} from "@/components/settings/settings-schemas";
import { createClient } from "@/lib/supabase/client";

const PASSWORD_FIELDS = [
  {
    id: "currentPassword" as const,
    label: "Current Password",
    placeholder: "Enter current password",
    visibilityKey: "current" as const,
  },
  {
    id: "newPassword" as const,
    label: "New Password",
    placeholder: "Enter new password",
    visibilityKey: "new" as const,
  },
  {
    id: "confirmPassword" as const,
    label: "Confirm New Password",
    placeholder: "Confirm new password",
    visibilityKey: "confirm" as const,
  },
];

export function SettingsChangePasswordCard() {
  const [isSaving, setIsSaving] = React.useState(false);
  const [passwordVisible, setPasswordVisible] = React.useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    setIsSaving(true);
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
        setError("currentPassword", {
          type: "manual",
          message: "Incorrect current password",
        });
        return;
      }

      if ((rpcData as unknown as string) === "success") {
        reset();
        toast.success("Password updated successfully");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Update your password to keep your account secure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {PASSWORD_FIELDS.map(
            ({ id, label, placeholder, visibilityKey }) => (
              <PasswordField
                key={id}
                id={id}
                label={label}
                placeholder={placeholder}
                visible={passwordVisible[visibilityKey]}
                onToggleVisible={() =>
                  setPasswordVisible((prev) => ({
                    ...prev,
                    [visibilityKey]: !prev[visibilityKey],
                  }))
                }
                errorMessage={errors[id]?.message}
                registration={register}
              />
            ),
          )}

          <div className='flex justify-end'>
            <Button type='submit' disabled={isSaving}>
              {isSaving ? (
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
  );
}
