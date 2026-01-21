"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { readStoredTaskSession } from "@/lib/task-mode-client";

export function TaskModeBanner() {
  const router = useRouter();
  const [active] = useState(() => {
    const stored = readStoredTaskSession();
    return stored?.systemType === "uni-registration";
  });

  if (!active) return null;

  return (
    <div className='flex flex-col gap-2 rounded-lg border bg-muted/40 p-3 text-sm sm:flex-row sm:items-center sm:justify-between'>
      <span>Task Mode is active. Your actions are being tracked.</span>
      <Button size='sm' variant='outline' onClick={() => router.push("/tasks/session")}>
        View Task Checklist
      </Button>
    </div>
  );
}
