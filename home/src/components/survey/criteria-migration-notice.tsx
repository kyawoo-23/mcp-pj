"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClipboardClock, ListChecks, Megaphone } from "lucide-react";
import { toast } from "sonner";

import { dismissCriteriaMigrationNoticeAction } from "@/app/actions/survey";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STUDY_HISTORY_PATH = "/survey/history";

interface CriteriaMigrationNoticeProps {
  open: boolean;
  userId: string;
}

export function CriteriaMigrationNotice({
  open,
  userId,
}: CriteriaMigrationNoticeProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(open);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setIsOpen(true);
    }
  };

  const handleDismiss = async () => {
    setDismissing(true);
    try {
      const result = await dismissCriteriaMigrationNoticeAction(userId);
      if (!result.ok) {
        toast.error("Could not save", { description: result.error });
        return;
      }
      setIsOpen(false);
      router.refresh();
    } finally {
      setDismissing(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="flex max-h-[min(90dvh,calc(100svh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div
            className="absolute inset-x-0 top-0 z-10 h-1 bg-linear-to-r from-primary via-primary/70 to-primary/40"
            aria-hidden
          />

          <div className="border-b bg-primary/5 px-6 pt-8 pb-6 text-center sm:px-8 sm:pt-10 sm:pb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary shadow-sm sm:mb-5 sm:h-16 sm:w-16">
              <Megaphone className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden />
            </div>
            <Badge
              variant="secondary"
              className="mb-3 border-primary/20 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary"
            >
              Important announcement
            </Badge>
            <AlertDialogHeader className="space-y-3 text-center sm:text-center">
              <AlertDialogTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
                Study tasks updated
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <p className="mx-auto max-w-lg text-base leading-relaxed text-muted-foreground">
                  We&apos;ve updated how study tasks work. Please read the summary
                  below before you continue with your session.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>

          <div className="grid gap-4 px-6 py-5 sm:grid-cols-2 sm:gap-5 sm:px-8 sm:py-7">
            <section
              aria-labelledby="migration-targets-heading"
              className="space-y-3 rounded-xl border border-primary/15 bg-primary/5 p-4 sm:p-5"
            >
              <h3
                id="migration-targets-heading"
                className="flex items-center gap-2.5 text-base font-semibold"
              >
                <ListChecks
                  className="h-5 w-5 shrink-0 text-primary"
                  aria-hidden
                />
                Specific task targets
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                Tasks now include specific targets—for example, a named course
                and section, or a room with date and time. Your actions must match
                those targets for a task to count as completed.
              </p>
            </section>

            <section
              aria-labelledby="migration-history-heading"
              className="space-y-3 rounded-xl border bg-card p-4 sm:p-5"
            >
              <h3
                id="migration-history-heading"
                className="flex items-center gap-2.5 text-base font-semibold"
              >
                <ClipboardClock
                  className="h-5 w-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                Task list reset and history
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                Your current task list was reset for this format. Progress from
                the earlier format is saved on the{" "}
                <Link
                  href={STUDY_HISTORY_PATH}
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Previous study record
                </Link>{" "}
                page.
              </p>
            </section>
          </div>
        </div>

        <AlertDialogFooter className="shrink-0 flex-col gap-3 border-t bg-muted/20 px-6 py-4 sm:flex-row sm:justify-between sm:px-8 sm:py-6">
          <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
            <Link href={STUDY_HISTORY_PATH}>Previous study record</Link>
          </Button>
          <Button
            size="lg"
            className="w-full sm:w-auto"
            disabled={dismissing}
            onClick={handleDismiss}
          >
            {dismissing ? "Saving…" : "Got it, continue"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
