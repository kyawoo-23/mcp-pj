"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function CollapsibleChevron({
  open,
  className,
  size = "md",
}: {
  open: boolean;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <ChevronRight
      className={cn(
        size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
        "shrink-0 text-muted-foreground transition-transform duration-200",
        open && "rotate-90",
        className,
      )}
      aria-hidden
    />
  );
}

/** Inline collapsibles (e.g. booking quick details). */
export const collapsibleTriggerFocusClasses =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

/** Tool invocation header trigger (matches ring offset on bordered shell). */
export const collapsibleTriggerFocusClassesOffset =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
