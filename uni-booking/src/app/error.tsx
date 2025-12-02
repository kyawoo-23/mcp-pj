"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className='container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4'>
      <Card className='w-full max-w-md text-center'>
        <CardHeader>
          <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10'>
            <AlertCircle className='h-10 w-10 text-destructive' />
          </div>
          <CardTitle className='text-2xl font-bold'>
            Something went wrong!
          </CardTitle>
          <CardDescription className='text-lg'>
            An unexpected error occurred
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-sm text-muted-foreground'>
            {error.message ||
              "We encountered an error while processing your request."}
          </p>
          {error.digest && (
            <p className='text-xs text-muted-foreground font-mono'>
              Error ID: {error.digest}
            </p>
          )}
          <div className='flex flex-col gap-2 sm:flex-row'>
            <Button onClick={reset} variant='default' className='flex-1'>
              <RefreshCw className='mr-2 h-4 w-4' />
              Try Again
            </Button>
            <Link href='/' className='flex-1'>
              <Button variant='outline' className='w-full'>
                <Home className='mr-2 h-4 w-4' />
                Go Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
