"use client";

import { COMPARE_THEME } from "@/lib/study-protocol-labels";
import { cn } from "@/lib/utils";

export function CompareTableColGroup({
  withAction = false,
  showSimple = true,
  showCriteria = true,
}: {
  withAction?: boolean;
  showSimple?: boolean;
  showCriteria?: boolean;
}) {
  const showDelta = showSimple && showCriteria;

  if (!showSimple || !showCriteria) {
    return (
      <colgroup>
        <col style={{ width: showDelta ? "50%" : "62%" }} />
        <col style={{ width: showDelta ? "30%" : "38%" }} />
        {showDelta ? <col style={{ width: "20%" }} /> : null}
        {withAction ? <col style={{ width: "4%" }} /> : null}
      </colgroup>
    );
  }

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
  showSimple?: boolean;
  showCriteria?: boolean;
}

export function CompareTableHeader({
  label = "Metric",
  withAction = false,
  className,
  showSimple = true,
  showCriteria = true,
}: CompareTableHeaderProps) {
  const showDelta = showSimple && showCriteria;

  return (
    <thead className={cn("bg-muted/40", className)}>
      <tr className='border-b border-border/80'>
        <th
          scope='col'
          className='text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap'
        >
          {label}
        </th>
        {showSimple ? (
          <th
            scope='col'
            className={cn(
              "text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap",
              COMPARE_THEME.simple.accentClass,
            )}
          >
            Simple Task
          </th>
        ) : null}
        {showCriteria ? (
          <th
            scope='col'
            className={cn(
              "text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap",
              COMPARE_THEME.criteria.accentClass,
            )}
          >
            Criteria Task
          </th>
        ) : null}
        {showDelta ? (
          <th
            scope='col'
            className='text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap'
          >
            Difference
          </th>
        ) : null}
        {withAction ? (
          <th scope='col' className='w-10 px-2'>
            <span className='sr-only'>Expand</span>
          </th>
        ) : null}
      </tr>
    </thead>
  );
}
