"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { readStoredTaskSession } from "@/lib/task-mode-client";

export function TaskModeButton() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Don't show button if NEXT_PUBLIC_ENABLE_TASK is not "true"
  if (process.env.NEXT_PUBLIC_ENABLE_TASK !== "true") {
    return null;
  }

  // Don't show button if not logged in, still loading, or on /tasks page
  if (loading || !user || pathname?.startsWith("/tasks")) {
    return null;
  }

  // Check if there's an active session to link directly to session page
  const storedSession = readStoredTaskSession();
  const href = storedSession?.systemType === "uni-booking" ? "/tasks/session" : "/tasks";

  return (
    <div className='fixed right-3 top-18 z-50 sm:right-4 sm:top-20'>
      <Link
        href={href}
        aria-label='Enter task-based completion event'
        className='group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border bg-background shadow-xs px-4 py-2 text-xs sm:text-sm font-medium transition-all motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 overflow-hidden before:absolute before:left-0 before:top-0 before:z-0 before:h-full before:w-0 before:bg-primary before:transition-[width] before:duration-500 before:ease-out hover:before:w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30 dark:border-input'
      >
        <span className='relative z-10 flex items-center gap-2 text-foreground transition-colors duration-300 group-hover:text-primary-foreground'>
          <ClipboardCheck className='size-3.5 sm:size-4' />
          Task Mode
        </span>
      </Link>
    </div>
  );
}
