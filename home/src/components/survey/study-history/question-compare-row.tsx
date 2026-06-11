"use client";

import { useState } from "react";
import { Bot, ChevronDown, Monitor } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  averageResponseValue,
  formatDelta,
  normalizedScoreChip,
  type StudyHistorySurveyResponse,
  type UnifiedCompareQuestion,
} from "@/lib/study-history";
import { COMPARE_THEME } from "@/lib/study-protocol-labels";
import { cn } from "@/lib/utils";
import { DeltaBadge } from "./delta-badge";
import { MODALITY_LABEL_CLASS } from "./modality-styles";
import { ResponseDisplay } from "./response-display";

function scoreForSide(responses: StudyHistorySurveyResponse[]) {
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
  const scaleType = responses[0].task_survey_questions.scale_type;
  return {
    chip: normalizedScoreChip(avg, null, scaleType),
    numeric: avg,
  };
}

function ProtocolResponsePanel({
  responses,
  protocolLabel,
  accentClass,
}: {
  responses: StudyHistorySurveyResponse[];
  protocolLabel: string;
  accentClass: string;
}) {
  if (responses.length === 0) {
    return (
      <p className='text-xs text-muted-foreground/60 italic py-2'>
        No answer recorded
      </p>
    );
  }

  return (
    <div className='space-y-3'>
      {responses.map((r) => {
        const system = r.task_sessions.system_type;
        const SystemIcon = system === "traditional" ? Monitor : Bot;
        return (
          <div
            key={r.id}
            className='rounded-lg border border-border/60 p-3 bg-muted/20'
          >
            <div className='flex items-center gap-1.5 mb-2'>
              <SystemIcon
                className={cn("h-3.5 w-3.5", MODALITY_LABEL_CLASS[system])}
                aria-hidden
              />
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wide",
                  MODALITY_LABEL_CLASS[system],
                )}
              >
                {system === "traditional" ? "Traditional" : "Chat"}
              </span>
            </div>
            <ResponseDisplay
              responseValue={r.response_value}
              responseText={r.response_text}
              scaleType={r.task_survey_questions.scale_type}
              modality={system}
            />
          </div>
        );
      })}
      <p className={cn("text-[10px] font-semibold uppercase", accentClass)}>
        {protocolLabel}
      </p>
    </div>
  );
}

export function QuestionCompareDetail({
  question,
}: {
  question: UnifiedCompareQuestion;
}) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-4 bg-muted/10 border-t border-border/50'>
      <ProtocolResponsePanel
        responses={question.simpleResponses}
        protocolLabel='Simple Task'
        accentClass={COMPARE_THEME.simple.accentClass}
      />
      <ProtocolResponsePanel
        responses={question.criteriaResponses}
        protocolLabel='Criteria Task'
        accentClass={COMPARE_THEME.criteria.accentClass}
      />
    </div>
  );
}

interface QuestionCompareRowProps {
  question: UnifiedCompareQuestion;
}

export function QuestionCompareRow({ question }: QuestionCompareRowProps) {
  const [open, setOpen] = useState(false);

  const simpleScore = scoreForSide(question.simpleResponses);
  const criteriaScore = scoreForSide(question.criteriaResponses);

  const delta =
    simpleScore.numeric !== null && criteriaScore.numeric !== null
      ? formatDelta(criteriaScore.numeric, simpleScore.numeric, {
          higherIsBetter: question.scale_type !== "numeric_0_100",
        })
      : formatDelta(null, null, { higherIsBetter: true });

  const chipAria = `Simple Tasks: ${simpleScore.chip}, Criteria Tasks: ${criteriaScore.chip}`;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type='button'
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 text-left",
            "hover:bg-muted/30 transition-colors cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          )}
          aria-expanded={open}
        >
          <p className='flex-1 text-sm font-medium leading-snug line-clamp-2 min-w-0'>
            {question.question_text}
          </p>
          <div className='flex items-center gap-2 shrink-0'>
            <Badge
              variant='secondary'
              className='tabular-nums text-[11px] font-semibold'
              aria-label={chipAria}
            >
              <span className={COMPARE_THEME.simple.accentClass}>{simpleScore.chip}</span>
              <span className='mx-1 text-muted-foreground'>·</span>
              <span className={COMPARE_THEME.criteria.accentClass}>
                {criteriaScore.chip}
              </span>
            </Badge>
            <DeltaBadge delta={delta} />
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground motion-safe:transition-transform motion-safe:duration-200",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className='data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden'>
        <QuestionCompareDetail question={question} />
      </CollapsibleContent>
    </Collapsible>
  );
}
