"use client";

import { COMPARE_THEME } from "@/lib/study-protocol-labels";
import { cn } from "@/lib/utils";

interface MetricBarProps {
  percent: number | null;
  variant: "simple" | "criteria";
  className?: string;
}

export function MetricBar({ percent, variant, className }: MetricBarProps) {
  if (percent === null) return null;

  return (
    <div
      className={cn(
        "h-1.5 rounded-full bg-muted overflow-hidden w-full max-w-[120px] ml-auto",
        className,
      )}
      aria-hidden
    >
      <div
        className={cn("h-full rounded-full", COMPARE_THEME[variant].barClass)}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
