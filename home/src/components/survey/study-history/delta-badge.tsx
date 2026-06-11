"use client";

import { cn } from "@/lib/utils";
import type { DeltaIndicator } from "@/lib/study-history";

interface DeltaBadgeProps {
  delta: DeltaIndicator;
  className?: string;
}

export function DeltaBadge({ delta, className }: DeltaBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
        delta.direction === "better" &&
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        delta.direction === "worse" &&
          "bg-red-500/10 text-red-700 dark:text-red-400",
        delta.direction === "same" &&
          "border border-border/80 bg-background text-foreground shadow-xs",
        delta.direction === "unavailable" &&
          "bg-muted/60 text-muted-foreground",
        className,
      )}
      aria-label={delta.ariaLabel}
    >
      {delta.label}
    </span>
  );
}
