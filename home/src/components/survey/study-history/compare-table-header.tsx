"use client";

import { COMPARE_THEME } from "@/lib/study-protocol-labels";
import { cn } from "@/lib/utils";

export function CompareTableColGroup({ withAction = false }: { withAction?: boolean }) {
  return (
    <colgroup>
      <col style={{ width: "38%" }} />
      <col style={{ width: "22%" }} />
      <col style={{ width: "22%" }} />
      <col style={{ width: withAction ? "14%" : "18%" }} />
      {withAction ? <col style={{ width: "4%" }} /> : null}
    </colgroup>
  );
}

interface CompareTableHeaderProps {
  label?: string;
  withAction?: boolean;
  className?: string;
}

export function CompareTableHeader({
  label = "Metric",
  withAction = false,
  className,
}: CompareTableHeaderProps) {
  return (
    <thead className={cn("bg-muted/40", className)}>
      <tr className='border-b border-border/80'>
        <th
          scope='col'
          className='text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap'
        >
          {label}
        </th>
        <th
          scope='col'
          className={cn(
            "text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap",
            COMPARE_THEME.simple.accentClass,
          )}
        >
          Simple Task
        </th>
        <th
          scope='col'
          className={cn(
            "text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap",
            COMPARE_THEME.criteria.accentClass,
          )}
        >
          Criteria Task
        </th>
        <th
          scope='col'
          className='text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap'
        >
          Difference
        </th>
        {withAction ? (
          <th scope='col' className='w-10 px-2'>
            <span className='sr-only'>Expand</span>
          </th>
        ) : null}
      </tr>
    </thead>
  );
}
