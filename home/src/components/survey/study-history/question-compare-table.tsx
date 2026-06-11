"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  averageResponseValue,
  formatDelta,
  normalizedScoreChip,
  type UnifiedCompareQuestion,
} from "@/lib/study-history";
import { COMPARE_THEME } from "@/lib/study-protocol-labels";
import { cn } from "@/lib/utils";
import { DeltaBadge } from "./delta-badge";
import { MetricBar } from "./metric-bar";
import { QuestionCompareDetail } from "./question-compare-row";

const ROW_GRID =
  "grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(88px,120px)_minmax(88px,120px)_minmax(72px,96px)_40px] gap-x-4 gap-y-3 md:gap-y-0 md:items-start";

function barPercentForQuestion(
  numeric: number | null,
  scaleType: string,
): number | null {
  if (numeric === null) return null;
  switch (scaleType) {
    case "likert_5":
      return Math.min(100, Math.max(0, (numeric / 5) * 100));
    case "likert_7":
      return Math.min(100, Math.max(0, (numeric / 7) * 100));
    case "numeric_0_100":
      return Math.min(100, Math.max(0, numeric));
    default:
      return null;
  }
}

function scoreForSide(
  responses: UnifiedCompareQuestion["simpleResponses"],
  scaleType: string,
) {
  const withText = responses.find((r) => r.response_text?.trim());
  if (withText) {
    return {
      chip: normalizedScoreChip(
        withText.response_value,
        withText.response_text,
        withText.task_survey_questions.scale_type,
      ),
      numeric: null as number | null,
    };
  }
  const avg = averageResponseValue(responses);
  if (avg === null || responses.length === 0) {
    return { chip: "—", numeric: null };
  }
  return {
    chip: normalizedScoreChip(avg, null, scaleType),
    numeric: avg,
  };
}

function QuestionBlock({
  question,
  isOpen,
  onToggle,
}: {
  question: UnifiedCompareQuestion;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const key = `${question.survey_name}:${question.order_index}`;
  const simpleScore = scoreForSide(
    question.simpleResponses,
    question.scale_type,
  );
  const criteriaScore = scoreForSide(
    question.criteriaResponses,
    question.scale_type,
  );
  const delta =
    simpleScore.numeric !== null && criteriaScore.numeric !== null
      ? formatDelta(criteriaScore.numeric, simpleScore.numeric, {
          higherIsBetter: question.scale_type !== "numeric_0_100",
          mode: "absolute",
          decimals: 1,
        })
      : formatDelta(null, null, { higherIsBetter: true });

  return (
    <div className='border-b border-border/50 last:border-0'>
      <div
        className={cn(
          ROW_GRID,
          "px-4 py-3 hover:bg-muted/15 transition-colors",
        )}
      >
        <p className='text-sm font-medium leading-snug text-pretty min-w-0'>
          <span className='text-muted-foreground/70 mr-1.5 tabular-nums'>
            {question.order_index}.
          </span>
          {question.question_text}
        </p>

        <div className='md:text-right tabular-nums pl-6 md:pl-0'>
          <p className='font-semibold'>{simpleScore.chip}</p>
          <MetricBar
            percent={barPercentForQuestion(
              simpleScore.numeric,
              question.scale_type,
            )}
            variant='simple'
            className='mt-1'
          />
        </div>

        <div className='md:text-right tabular-nums pl-6 md:pl-0'>
          <p className='font-semibold'>{criteriaScore.chip}</p>
          <MetricBar
            percent={barPercentForQuestion(
              criteriaScore.numeric,
              question.scale_type,
            )}
            variant='criteria'
            className='mt-1'
          />
        </div>

        <div className='flex items-center md:justify-end pl-6 md:pl-0'>
          <DeltaBadge delta={delta} />
        </div>

        <div className='flex items-center justify-end'>
          <button
            type='button'
            className={cn(
              "p-1.5 rounded-md text-muted-foreground hover:bg-muted/50 cursor-pointer touch-manipulation",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            aria-expanded={isOpen}
            aria-controls={`question-panel-${key}`}
            aria-label={
              isOpen ? "Collapse question details" : "Expand question details"
            }
            onClick={onToggle}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 motion-safe:transition-transform motion-safe:duration-200",
                isOpen && "rotate-180",
              )}
              aria-hidden
            />
          </button>
        </div>
      </div>

      {isOpen ? (
        <div id={`question-panel-${key}`}>
          <QuestionCompareDetail question={question} />
        </div>
      ) : null}
    </div>
  );
}

interface QuestionCompareTableProps {
  questions: UnifiedCompareQuestion[];
}

export function QuestionCompareTable({ questions }: QuestionCompareTableProps) {
  const [expandAll, setExpandAll] = useState(false);
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => {
    const map = new Map<string, UnifiedCompareQuestion[]>();
    for (const q of questions) {
      const list = map.get(q.survey_name) ?? [];
      list.push(q);
      map.set(q.survey_name, list);
    }
    return map;
  }, [questions]);

  if (questions.length === 0) {
    return (
      <p className='text-sm text-muted-foreground italic px-1'>
        No survey responses recorded yet.
      </p>
    );
  }

  const toggleExpandAll = () => {
    if (expandAll) {
      setOpenKeys(new Set());
      setExpandAll(false);
    } else {
      setOpenKeys(
        new Set(questions.map((q) => `${q.survey_name}:${q.order_index}`)),
      );
      setExpandAll(true);
    }
  };

  const isRowOpen = (key: string) => expandAll || openKeys.has(key);

  const toggleRow = (key: string) => {
    if (expandAll) {
      setExpandAll(false);
      setOpenKeys(new Set([key]));
      return;
    }
    const next = new Set(openKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setOpenKeys(next);
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-3'>
        <p className='text-xs text-muted-foreground'>
          {questions.length} survey questions across all instruments
        </p>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='text-xs h-8 gap-1.5 touch-manipulation'
          onClick={toggleExpandAll}
        >
          {expandAll ? (
            <>
              <ChevronUp className='h-3.5 w-3.5' aria-hidden />
              Collapse all
            </>
          ) : (
            <>
              <ChevronDown className='h-3.5 w-3.5' aria-hidden />
              Expand all
            </>
          )}
        </Button>
      </div>

      {Array.from(grouped.entries()).map(([surveyName, surveyQuestions]) => (
        <div key={surveyName} className='space-y-2'>
          <h3 className='text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1'>
            {surveyName}
          </h3>
          <div className='rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden'>
            <div
              className={cn(
                ROW_GRID,
                "px-4 py-2.5 border-b border-border/80 bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                "hidden md:grid",
              )}
              aria-hidden
            >
              <span>Question</span>
              <span className={cn("text-right", COMPARE_THEME.simple.accentClass)}>
                Simple Task
              </span>
              <span className={cn("text-right", COMPARE_THEME.criteria.accentClass)}>
                Criteria Task
              </span>
              <span className='text-right'>Difference</span>
              <span className='sr-only'>Expand</span>
            </div>

            {surveyQuestions.map((question) => {
              const key = `${question.survey_name}:${question.order_index}`;
              return (
                <QuestionBlock
                  key={key}
                  question={question}
                  isOpen={isRowOpen(key)}
                  onToggle={() => toggleRow(key)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
