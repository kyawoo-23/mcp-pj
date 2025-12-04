"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";

export function HeroButtons() {
  const { user, loading } = useAuth();

  return (
    <div className='mt-10 flex items-center justify-center gap-4'>
      <Link href='/courses'>
        <Button size='lg'>Browse Courses</Button>
      </Link>
      {!loading && !user && (
        <Link href='/auth/login'>
          <Button size='lg' variant='outline'>
            Sign In
          </Button>
        </Link>
      )}
    </div>
  );
}
