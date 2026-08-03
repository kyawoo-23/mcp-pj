"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { APIRoutes, Routes } from "@/lib/constants";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FormSchema = z.object({
  email: z.string().email(),
});

type FormData = z.infer<typeof FormSchema>;

export default function PasswordRecovery() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await fetch(APIRoutes.passwordRecovery, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      toast.success("Check your email for the reset link!");
    } catch (error: unknown) {
      console.error(error);
      toast.error((error as Error).message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='you@example.com'
                disabled={loading}
                {...register("email")}
              />
              {errors.email && (
                <p className='text-sm text-destructive'>
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button type='submit' className='w-full' disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
            <div className='flex items-center justify-center text-sm'>
              <Link
                href={Routes.login}
                className='flex items-center text-muted-foreground hover:text-primary'
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
