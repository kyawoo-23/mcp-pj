import { z } from "zod";

export const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  student_id: z.string().min(1, "Student ID is required"),
  email: z.string(),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ProfileFormData = z.infer<typeof profileSchema>;
export type PasswordFormData = z.infer<typeof passwordSchema>;
