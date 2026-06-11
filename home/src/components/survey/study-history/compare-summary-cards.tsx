"use client";

import { Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CompareRow } from "@/lib/study-history";
import { COMPARE_THEME } from "@/lib/study-protocol-labels";
import { cn } from "@/lib/utils";
import { DeltaBadge } from "./delta-badge";

interface CompareSummaryCardsProps {
  rows: CompareRow[];
  recommendation: string;
}

function summaryDeltaLabel(row: CompareRow): string {
  if (row.delta.direction === "unavailable" || row.delta.direction === "same") {
    return row.delta.label;
  }
  const word = row.delta.direction === "better" ? "better" : "worse";
  return `${row.delta.label} ${word}`;
}

export function CompareSummaryCards({
  rows,
  recommendation,
}: CompareSummaryCardsProps) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3'>
      {rows.map((row) => (
        <Card key={row.id} className='gap-0 py-0 shadow-xs border-border/80'>
          <CardContent className='p-4 space-y-3'>
            <p className='text-xs font-medium text-muted-foreground leading-tight'>
              {row.label}
            </p>
            <div className='flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm leading-snug'>
              <span className='font-bold tabular-nums text-foreground'>
                {row.simpleDisplay}
              </span>
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider",
                  COMPARE_THEME.simple.accentClass,
                )}
              >
                Simple Task
              </span>
              <span className='text-muted-foreground/60 text-xs font-medium'>
                vs
              </span>
              <span className='font-bold tabular-nums text-foreground'>
                {row.criteriaDisplay}
              </span>
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider",
                  COMPARE_THEME.criteria.accentClass,
                )}
              >
                Criteria Task
              </span>
            </div>
            <DeltaBadge
              delta={{
                ...row.delta,
                label: summaryDeltaLabel(row),
              }}
            />
          </CardContent>
        </Card>
      ))}

      <Card className='gap-0 py-0 shadow-xs border-border/80 bg-muted/15'>
        <CardContent className='p-4 space-y-3'>
          <p className='text-xs font-medium text-muted-foreground leading-tight'>
            Recommendation
          </p>
          <div className='flex items-center gap-2'>
            <Trophy
              className={cn(
                "h-5 w-5 shrink-0",
                recommendation.includes("Criteria")
                  ? COMPARE_THEME.criteria.accentClass
                  : recommendation.includes("Simple")
                    ? COMPARE_THEME.simple.accentClass
                    : "text-muted-foreground",
              )}
              aria-hidden
            />
            <p
              className={cn(
                "text-sm font-semibold leading-snug",
                recommendation.includes("Criteria")
                  ? COMPARE_THEME.criteria.strongClass
                  : recommendation.includes("Simple")
                    ? COMPARE_THEME.simple.strongClass
                    : "text-muted-foreground",
              )}
            >
              {recommendation.includes("Criteria")
                ? "Criteria Task performs better overall"
                : recommendation.includes("Simple")
                  ? "Simple Task performs better overall"
                  : recommendation}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
