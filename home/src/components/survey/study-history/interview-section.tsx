"use client";

import { Clock3, MessageSquareQuote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { StudyHistoryInterview } from "@/lib/study-history";

interface InterviewSectionProps {
  interviews: StudyHistoryInterview[];
}

export function InterviewSection({ interviews }: InterviewSectionProps) {
  if (interviews.length === 0) return null;

  const sorted = [...interviews].sort(
    (a, b) =>
      a.task_interview_questions.order_index -
      b.task_interview_questions.order_index,
  );

  return (
    <section aria-labelledby='interview-heading' className='space-y-3'>
      <div className='flex items-center gap-2'>
        <MessageSquareQuote
          className='h-4 w-4 text-muted-foreground'
          aria-hidden
        />
        <h2
          id='interview-heading'
          className='text-sm font-semibold tracking-tight'
        >
          Final interview
        </h2>
        <span className='text-xs text-muted-foreground'>
          — Open-ended responses
        </span>
      </div>
      <div className='space-y-3'>
        {sorted.map((row, i) => (
          <Card key={row.id} className='gap-0 py-0 shadow-none overflow-hidden'>
            <div className='px-4 pt-3 pb-1 flex gap-3 items-start'>
              <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary mt-0.5'>
                {i + 1}
              </span>
              <p className='text-sm leading-relaxed text-foreground/80'>
                {row.task_interview_questions.question_text}
              </p>
            </div>
            <CardContent className='px-4 pt-1.5 pb-3'>
              <div className='pl-8'>
                {row.response_text?.trim() ? (
                  <blockquote className='border-l-2 border-primary/40 pl-3 text-sm text-foreground leading-relaxed whitespace-pre-wrap'>
                    {row.response_text.trim()}
                  </blockquote>
                ) : (
                  <p className='text-sm text-muted-foreground italic'>
                    No answer recorded
                  </p>
                )}
                {row.created_at ? (
                  <p className='mt-2 flex items-center gap-1 text-xs text-muted-foreground'>
                    <Clock3 className='h-3 w-3' aria-hidden />
                    {new Intl.DateTimeFormat(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(row.created_at))}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
