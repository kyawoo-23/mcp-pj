"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { StudyConsentStatement } from "@/components/consent/study-consent-statement";
import { Button } from "@/components/ui/button";

const SCROLL_END_PX = 8;

interface StudyConsentDialogProps {
  open: boolean;
  onAgree: () => Promise<void> | void;
  onDismiss?: () => void;
  showSignOut?: boolean;
}

function reachedBottom(element: HTMLElement) {
  return (
    element.scrollHeight - element.scrollTop - element.clientHeight <=
    SCROLL_END_PX
  );
}

export function StudyConsentDialog({
  open,
  onAgree,
  onDismiss,
  showSignOut = false,
}: StudyConsentDialogProps) {
  const router = useRouter();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canAgree, setCanAgree] = useState(false);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const updateScroll = useCallback(() => {
    const element = scrollerRef.current;
    if (!element) return;
    setCanAgree(reachedBottom(element));
  }, []);

  useEffect(() => {
    if (!open) {
      setCanAgree(false);
      return;
    }

    const frame = requestAnimationFrame(updateScroll);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, updateScroll]);

  if (!open) return null;

  const handleAgree = async () => {
    if (!canAgree || saving) return;
    setSaving(true);
    try {
      await onAgree();
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSigningOut(false);
      toast.error("Failed to sign out");
      return;
    }
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
      <div
        role='alertdialog'
        aria-modal='true'
        aria-labelledby='study-consent-title'
        className='bg-background w-full max-w-lg space-y-4 rounded-lg border p-6 shadow-lg'
      >
        <div className='space-y-1'>
          <h2 id='study-consent-title' className='text-lg font-semibold'>
            Before you continue
          </h2>
          <p className='text-sm text-muted-foreground'>
            Please read this study information.
          </p>
        </div>
        <div
          ref={scrollerRef}
          onScroll={updateScroll}
          className='max-h-[32rem] overflow-y-auto'
        >
          <StudyConsentStatement />
        </div>
        {canAgree ? null : (
          <p className='text-sm text-muted-foreground'>
            Scroll to the bottom to agree.
          </p>
        )}
        <div className='flex flex-col gap-2'>
          <Button
            type='button'
            className='w-full'
            disabled={!canAgree || saving || signingOut}
            onClick={handleAgree}
          >
            {saving ? "Saving..." : "Agree and continue"}
          </Button>
          {showSignOut ? (
            <Button
              type='button'
              variant='outline'
              className='w-full'
              disabled={saving || signingOut}
              onClick={handleSignOut}
            >
              {signingOut ? "Signing out..." : "Sign out"}
            </Button>
          ) : null}
          {onDismiss ? (
            <Button
              type='button'
              variant='ghost'
              className='w-full'
              disabled={saving}
              onClick={onDismiss}
            >
              Close
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
