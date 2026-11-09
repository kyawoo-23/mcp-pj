"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Routes } from "@/lib/constants";
import { getAuthLinkErrorCopy } from "@/lib/auth-link-error";

export function AuthErrorClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!window.location.hash) return;
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const keys = ["error", "error_code", "error_description", "next"] as const;
    const nextParams = new URLSearchParams(searchParams.toString());
    let changed = false;
    for (const key of keys) {
      const value = hash.get(key);
      if (value && !nextParams.get(key)) {
        nextParams.set(key, value);
        changed = true;
      }
    }
    if (changed) {
      router.replace(`/auth/error?${nextParams.toString()}`);
    }
  }, [router, searchParams]);

  const copy = getAuthLinkErrorCopy({
    errorCode: searchParams.get("error_code"),
    errorDescription: searchParams.get("error_description"),
    next: searchParams.get("next"),
    loginHref: Routes.login,
    recoveryHref: Routes.passwordRecovery,
  });

  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <div className='mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive'>
            <CircleAlert className='h-5 w-5' aria-hidden='true' />
          </div>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          <Button asChild className='w-full'>
            <Link href={copy.primaryHref}>{copy.primaryLabel}</Link>
          </Button>
          {copy.primaryHref !== Routes.login ? (
            <Button asChild variant='outline' className='w-full'>
              <Link href={Routes.login}>Back to sign in</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
