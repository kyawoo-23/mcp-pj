"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type {
  ConstructGroupConfig,
  ProtocolMetrics,
  UnifiedCompareQuestion,
} from "@/lib/study-history";
import {
  getConstructCompareRows,
  questionsForConstructGroup,
} from "@/lib/study-history";
import { cn } from "@/lib/utils";
import { ComparisonMatrix } from "./comparison-matrix";
import { QuestionCompareRow } from "./question-compare-row";
import type { HistoryModalityFilter } from "@/lib/study-history";

interface ConstructCompareSectionProps {
  group: ConstructGroupConfig;
  simpleMetrics: ProtocolMetrics;
  criteriaMetrics: ProtocolMetrics;
  questions: UnifiedCompareQuestion[];
  modality: HistoryModalityFilter;
  defaultOpen?: boolean;
  showSimple?: boolean;
  showCriteria?: boolean;
}

export function ConstructCompareSection({
  group,
  simpleMetrics,
  criteriaMetrics,
  questions,
  modality,
  defaultOpen = false,
  showSimple = true,
  showCriteria = true,
}: ConstructCompareSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const metricRows = getConstructCompareRows(
    simpleMetrics,
    criteriaMetrics,
    group,
  );
  const groupQuestions = questionsForConstructGroup(questions, group.id);
  const hasQuestions = groupQuestions.length > 0;
  const hasMetrics = metricRows.length > 0;

  if (!hasMetrics && !hasQuestions) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className='gap-0 py-0 shadow-xs border-border/80 overflow-hidden'>
        <CollapsibleTrigger asChild>
          <button
            type='button'
            className={cn(
              "w-full flex items-center justify-between gap-3 px-5 py-4 text-left",
              "hover:bg-muted/30 transition-colors cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
            )}
            aria-expanded={open}
          >
            <div className='space-y-0.5 min-w-0'>
              <h3 className='text-sm font-semibold tracking-tight'>
                {group.label}
              </h3>
              <p className='text-xs text-muted-foreground'>{group.description}</p>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 shrink-0 text-muted-foreground motion-safe:transition-transform motion-safe:duration-200",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className='data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden'>
          <div className='border-t border-border/60 space-y-4 p-4'>
            {hasMetrics ? (
              <ComparisonMatrix
                rows={metricRows}
                modality={modality}
                simpleHasData={simpleMetrics.hasData}
                criteriaHasData={criteriaMetrics.hasData}
                showSimple={showSimple}
                showCriteria={showCriteria}
              />
            ) : null}
            {hasQuestions ? (
              <div className='rounded-lg border border-border/60 divide-y divide-border/50 overflow-hidden'>
                {groupQuestions.map((q) => (
                  <QuestionCompareRow
                    key={`${q.survey_name}:${q.order_index}`}
                    question={q}
                    showSimple={showSimple}
                    showCriteria={showCriteria}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
