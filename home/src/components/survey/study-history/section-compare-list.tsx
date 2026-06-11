"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type {
  CompareRow,
  SectionCompareGroup,
  UnifiedCompareQuestion,
} from "@/lib/study-history";
import { COMPARE_THEME } from "@/lib/study-protocol-labels";
import { cn } from "@/lib/utils";
import { DeltaBadge } from "./delta-badge";
import { MetricBar } from "./metric-bar";
import { QuestionCompareDetail } from "./question-compare-row";

interface SectionCompareListProps {
  sections: SectionCompareGroup[];
  compareRows: CompareRow[];
  questions: UnifiedCompareQuestion[];
  simpleHasData: boolean;
  criteriaHasData: boolean;
}

const ROW_GRID =
  "grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(88px,120px)_minmax(88px,120px)_minmax(72px,96px)_40px] gap-x-4 gap-y-3 md:gap-y-0 md:items-center";

function questionsForSection(
  questions: UnifiedCompareQuestion[],
  section: SectionCompareGroup,
): UnifiedCompareQuestion[] {
  if (!section.surveyName) return [];
  return questions.filter((q) => {
    if (q.survey_name !== section.surveyName) return false;
    if (section.construct) return q.construct === section.construct;
    return true;
  });
}

function SectionBlock({
  index,
  section,
  row,
  sectionQuestions,
  simpleHasData,
  criteriaHasData,
  open,
  onToggle,
}: {
  index: number;
  section: SectionCompareGroup;
  row: CompareRow;
  sectionQuestions: UnifiedCompareQuestion[];
  simpleHasData: boolean;
  criteriaHasData: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const hasQuestions = sectionQuestions.length > 0;

  return (
    <div className='border-b border-border/50 last:border-0'>
      <div className={cn(ROW_GRID, "px-4 py-4 hover:bg-muted/15 transition-colors")}>
        <div className='flex items-start gap-3 min-w-0 md:col-span-1'>
          <span
            className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground tabular-nums'
            aria-hidden
          >
            {index + 1}
          </span>
          <div className='min-w-0 space-y-0.5'>
            <p className='text-sm font-semibold tracking-tight text-pretty'>
              {section.label}
            </p>
            <p className='text-xs text-muted-foreground leading-relaxed'>
              {section.description}
            </p>
          </div>
        </div>

        <div className='md:text-right space-y-1 pl-11 md:pl-0'>
          <p
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wider md:sr-only",
              COMPARE_THEME.simple.accentClass,
            )}
          >
            Simple Task
          </p>
          <p className='text-sm font-bold tabular-nums'>
            {simpleHasData ? row.simpleDisplay : "—"}
          </p>
          <MetricBar percent={row.simpleBarPercent} variant='simple' />
        </div>

        <div className='md:text-right space-y-1 pl-11 md:pl-0'>
          <p
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wider md:sr-only",
              COMPARE_THEME.criteria.accentClass,
            )}
          >
            Criteria Task
          </p>
          <p className='text-sm font-bold tabular-nums'>
            {criteriaHasData ? row.criteriaDisplay : "—"}
          </p>
          <MetricBar percent={row.criteriaBarPercent} variant='criteria' />
        </div>

        <div className='flex items-center md:justify-end pl-11 md:pl-0'>
          <DeltaBadge delta={row.delta} />
        </div>

        <div className='flex items-center justify-end pl-11 md:pl-0'>
          {hasQuestions ? (
            <button
              type='button'
              className={cn(
                "p-1.5 rounded-md text-muted-foreground hover:bg-muted/50 cursor-pointer touch-manipulation",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
              aria-expanded={open}
              aria-controls={`section-panel-${section.id}`}
              aria-label={
                open
                  ? `Collapse ${section.label} questions`
                  : `Expand ${section.label} questions`
              }
              onClick={onToggle}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 motion-safe:transition-transform motion-safe:duration-200",
                  open && "rotate-180",
                )}
                aria-hidden
              />
            </button>
          ) : (
            <span className='w-8' aria-hidden />
          )}
        </div>
      </div>

      {open && hasQuestions ? (
        <div
          id={`section-panel-${section.id}`}
          className='border-t border-border/50 bg-muted/5'
        >
          {sectionQuestions.map((q) => (
            <div
              key={`${q.survey_name}:${q.order_index}`}
              className='border-b border-border/40 last:border-0'
            >
              <p className='px-4 pt-3 pb-1 text-xs font-medium text-muted-foreground text-pretty'>
                <span className='tabular-nums mr-1.5'>{q.order_index}.</span>
                {q.question_text}
              </p>
              <QuestionCompareDetail question={q} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SectionCompareList({
  sections,
  compareRows,
  questions,
  simpleHasData,
  criteriaHasData,
}: SectionCompareListProps) {
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  const rowById = new Map(compareRows.map((row) => [row.id, row]));

  return (
    <div className='rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden'>
      <div
        className={cn(
          ROW_GRID,
          "px-4 py-3 border-b border-border/80 bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
          "hidden md:grid",
        )}
        aria-hidden
      >
        <span>Section</span>
        <span className={cn("text-right", COMPARE_THEME.simple.accentClass)}>
          Simple Task
        </span>
        <span className={cn("text-right", COMPARE_THEME.criteria.accentClass)}>
          Criteria Task
        </span>
        <span className='text-right'>Difference</span>
        <span className='sr-only'>Expand</span>
      </div>

      {sections.map((section, index) => {
        const row = rowById.get(section.metricId);
        if (!row) return null;

        return (
          <SectionBlock
            key={section.id}
            index={index}
            section={section}
            row={row}
            sectionQuestions={questionsForSection(questions, section)}
            simpleHasData={simpleHasData}
            criteriaHasData={criteriaHasData}
            open={openSectionId === section.id}
            onToggle={() =>
              setOpenSectionId((current) =>
                current === section.id ? null : section.id,
              )
            }
          />
        );
      })}
    </div>
  );
}
