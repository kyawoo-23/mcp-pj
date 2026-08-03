"use client";

import { COMPARE_THEME } from "@/lib/study-protocol-labels";
import { cn } from "@/lib/utils";

export function CompareLegend() {
  return (
    <div
      className='flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border/60 bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground'
      aria-label='Comparison legend'
    >
      <span className='inline-flex items-center gap-1.5'>
        <span
          className={cn("h-2.5 w-2.5 rounded-full shrink-0", COMPARE_THEME.simple.dotClass)}
          aria-hidden
        />
        Simple Task
      </span>
      <span className='inline-flex items-center gap-1.5'>
        <span
          className={cn("h-2.5 w-2.5 rounded-full shrink-0", COMPARE_THEME.criteria.dotClass)}
          aria-hidden
        />
        Criteria Task
      </span>
      <span className='inline-flex items-center gap-1.5'>
        <span
          className='inline-flex items-center justify-center rounded border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-semibold text-foreground shadow-xs'
          aria-hidden
        >
          Same
        </span>
        <span className='sr-only'>No change between protocols</span>
      </span>
      <span className='inline-flex items-center gap-1.5'>
        <span
          className={cn("font-semibold", COMPARE_THEME.criteria.accentClass)}
          aria-hidden
        >
          ↑
        </span>
        Better for Criteria Task
      </span>
      <span className='inline-flex items-center gap-1.5'>
        <span className='text-red-600 dark:text-red-400 font-semibold' aria-hidden>
          ↓
        </span>
        Worse for Criteria Task
      </span>
    </div>
  );
}
