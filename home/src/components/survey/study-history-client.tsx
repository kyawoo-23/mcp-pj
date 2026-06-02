"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  Clock3,
  ClipboardList,
  Info,
  MessageSquareQuote,
  Monitor,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type {
  StudyHistoryInterview,
  StudyHistorySurveyResponse,
  StudyHistoryTask,
} from "@/lib/study-history";
import {
  countCompletedTasks,
  sortSurveyNames,
  surveyDisplayTitle,
} from "@/lib/study-history";
import { TASK_ORDER } from "@/utils/constants";
import { SurveyNavbar } from "@/components/survey/survey-navbar";
import { cn } from "@/lib/utils";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "text-primary",
    badgeVariant: "success" as const,
  },
  in_progress: {
    label: "In progress",
    icon: Clock3,
    className: "text-amber-600 dark:text-amber-400",
    badgeVariant: "warning" as const,
  },
  not_started: {
    label: "Not started",
    icon: CircleDashed,
    className: "text-muted-foreground",
    badgeVariant: "secondary" as const,
  },
};

// ─── Survey display config ────────────────────────────────────────────────────

const SURVEY_DESCRIPTIONS: Record<string, string> = {
  SUS: "Measures how easy and usable the system feels overall.",
  RAW_TLX: "Assesses mental, physical, and temporal demand of the tasks.",
  SDT: "Captures your sense of autonomy, competence, and relatedness.",
};

// ─── Scale rendering ──────────────────────────────────────────────────────────

function ScaleBar({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className='flex items-center gap-3 mt-1'>
      <div className='flex-1 h-2 rounded-full bg-muted overflow-hidden'>
        <div
          className='h-full rounded-full bg-primary/70 transition-all'
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className='text-sm font-semibold tabular-nums shrink-0'>
        {label}
      </span>
    </div>
  );
}

function ResponseDisplay({
  responseValue,
  responseText,
  scaleType,
}: {
  responseValue: number | null;
  responseText: string | null;
  scaleType: string;
}) {
  const text = responseText?.trim();

  if (text) {
    return (
      <p className='mt-1.5 pl-4 border-l-2 border-primary/30 text-sm text-foreground leading-relaxed'>
        {text}
      </p>
    );
  }

  if (responseValue === null) {
    return (
      <p className='mt-1 text-sm text-muted-foreground italic'>
        No answer recorded
      </p>
    );
  }

  if (scaleType === "likert_5") {
    return (
      <div className='mt-1'>
        <ScaleBar
          value={responseValue}
          max={5}
          label={`${responseValue} / 5`}
        />
        <div className='flex justify-between mt-0.5 px-0.5'>
          <span className='text-[10px] text-muted-foreground'>
            Strongly disagree
          </span>
          <span className='text-[10px] text-muted-foreground'>
            Strongly agree
          </span>
        </div>
      </div>
    );
  }

  if (scaleType === "likert_7") {
    return (
      <div className='mt-1'>
        <ScaleBar
          value={responseValue}
          max={7}
          label={`${responseValue} / 7`}
        />
        <div className='flex justify-between mt-0.5 px-0.5'>
          <span className='text-[10px] text-muted-foreground'>
            Strongly disagree
          </span>
          <span className='text-[10px] text-muted-foreground'>
            Strongly agree
          </span>
        </div>
      </div>
    );
  }

  if (scaleType === "numeric_0_100") {
    return (
      <div className='mt-1'>
        <ScaleBar
          value={responseValue}
          max={100}
          label={`${responseValue} / 100`}
        />
        <div className='flex justify-between mt-0.5 px-0.5'>
          <span className='text-[10px] text-muted-foreground'>Low</span>
          <span className='text-[10px] text-muted-foreground'>High</span>
        </div>
      </div>
    );
  }

  return (
    <p className='mt-1 text-sm font-semibold text-foreground'>
      {responseValue}
    </p>
  );
}

interface UnifiedTaskRow {
  task_code: string;
  title: string;
  description: string;
  chatTask?: StudyHistoryTask;
  traditionalTask?: StudyHistoryTask;
}

interface UnifiedQuestionRow {
  question_id: string;
  question_text: string;
  scale_type: string;
  order_index: number;
  chatResponse?: StudyHistorySurveyResponse;
  traditionalResponse?: StudyHistorySurveyResponse;
}

interface UnifiedSurveyGroup {
  surveyName: string;
  title: string;
  description: string;
  questions: UnifiedQuestionRow[];
}

function UnifiedTaskComparison({
  unifiedTasks,
  chatCompleted,
  chatTotal,
  tradCompleted,
  tradTotal,
}: {
  unifiedTasks: UnifiedTaskRow[];
  chatCompleted: number;
  chatTotal: number;
  tradCompleted: number;
  tradTotal: number;
}) {
  return (
    <Card className='shadow-xs pb-2 gap-1 border border-border/80 overflow-hidden'>
      <div className='px-6 pb-5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='flex items-center gap-2'>
          <ClipboardList
            className='h-5 w-5 text-muted-foreground'
            aria-hidden
          />
          <div>
            <h2 className='text-sm font-semibold tracking-tight text-foreground'>
              Task Completion Status
            </h2>
            <p className='text-xs text-muted-foreground'>
              Compare your completion status across both interaction modalities
            </p>
          </div>
        </div>

        {/* Dynamic header progress stats */}
        <div className='flex flex-wrap gap-4 items-center text-xs'>
          <div className='flex items-center gap-2'>
            <span className='text-muted-foreground font-medium'>
              Traditional:
            </span>
            <span className='font-bold bg-traditional/10 text-traditional px-2 py-0.5 rounded-full'>
              {tradCompleted} / {tradTotal}
            </span>
          </div>
          <div className='hidden sm:block text-muted-foreground/30'>|</div>
          <div className='flex items-center gap-2'>
            <span className='text-muted-foreground font-medium'>
              Chat Agent:
            </span>
            <span className='font-bold bg-chat/10 text-chat px-2 py-0.5 rounded-full'>
              {chatCompleted} / {chatTotal}
            </span>
          </div>
        </div>
      </div>
      <CardContent className='p-0'>
        <div className='divide-y divide-border/60'>
          {unifiedTasks.map((row, index) => {
            return (
              <div
                key={row.task_code}
                className='px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/10 transition-colors'
              >
                {/* Task Info */}
                <div className='flex items-start gap-3 flex-1 min-w-0'>
                  <span className='mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground'>
                    {index + 1}
                  </span>
                  <div className='space-y-1 min-w-0'>
                    <h4 className='text-sm font-semibold leading-snug text-foreground'>
                      {row.title}
                    </h4>
                    {row.description && (
                      <p className='text-xs text-muted-foreground leading-relaxed line-clamp-2'>
                        {row.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Modality Statuses side-by-side */}
                <div className='flex flex-wrap items-center gap-4 sm:gap-6 shrink-0'>
                  {/* Traditional Portal Status */}
                  <div className='flex items-center gap-2.5 min-w-[140px]'>
                    <div className='flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-lg bg-traditional/10 text-traditional'>
                      <Monitor className='h-3.5 w-3.5' aria-hidden />
                    </div>
                    <div className='text-left'>
                      <p className='text-[10px] font-medium text-muted-foreground leading-none mb-1'>
                        Traditional Portal
                      </p>
                      {row.traditionalTask ? (
                        <div className='flex items-center gap-1'>
                          {(() => {
                            const cfg =
                              STATUS_CONFIG[row.traditionalTask.status];
                            const StatusIcon = cfg.icon;
                            return (
                              <>
                                <StatusIcon
                                  className={cn("h-3 w-3", cfg.className)}
                                />
                                <span
                                  className={cn(
                                    "text-xs font-semibold",
                                    cfg.className,
                                  )}
                                >
                                  {cfg.label}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <span className='text-xs text-muted-foreground/60 italic'>
                          No session
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vertical separator inside status */}
                  <div
                    className='hidden sm:block h-6 w-px bg-border/60'
                    aria-hidden
                  />

                  {/* Chat Agent Status */}
                  <div className='flex items-center gap-2.5 min-w-[140px]'>
                    <div className='flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-lg bg-chat/10 text-chat'>
                      <Bot className='h-3.5 w-3.5' aria-hidden />
                    </div>
                    <div className='text-left'>
                      <p className='text-[10px] font-medium text-muted-foreground leading-none mb-1'>
                        Chat Agent
                      </p>
                      {row.chatTask ? (
                        <div className='flex items-center gap-1'>
                          {(() => {
                            const cfg = STATUS_CONFIG[row.chatTask.status];
                            const StatusIcon = cfg.icon;
                            return (
                              <>
                                <StatusIcon
                                  className={cn("h-3 w-3", cfg.className)}
                                />
                                <span
                                  className={cn(
                                    "text-xs font-semibold",
                                    cfg.className,
                                  )}
                                >
                                  {cfg.label}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <span className='text-xs text-muted-foreground/60 italic'>
                          No session
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function UnifiedSurveyGroupCard({
  group,
  defaultOpen,
}: {
  group: UnifiedSurveyGroup;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className='gap-0 py-0 shadow-none overflow-hidden border border-border/80'>
        <CollapsibleTrigger asChild>
          <button
            className='w-full text-left px-5 py-4 hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-t-lg bg-muted/10'
            aria-expanded={open}
          >
            <div className='flex items-start justify-between gap-3'>
              <div className='space-y-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <BarChart3
                    className='h-4.5 w-4.5 shrink-0 text-primary'
                    aria-hidden
                  />
                  <span className='text-sm sm:text-base font-bold text-foreground'>
                    {group.title}
                  </span>
                  <Badge
                    variant='secondary'
                    className='text-[10px] px-1.5 py-0'
                  >
                    {group.questions.length} Question
                    {group.questions.length === 1 ? "" : "s"}
                  </Badge>
                </div>
                {group.description && (
                  <p className='text-xs text-muted-foreground pl-6.5 leading-relaxed'>
                    {group.description}
                  </p>
                )}
              </div>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-muted-foreground mt-0.5 transition-transform duration-200",
                  open && "rotate-180"
                )}
                aria-hidden
              />
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className='data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden'>
          <div className='border-t divide-y divide-border/50'>
            {group.questions.map((q, i) => (
              <div key={q.question_id} className='px-5 py-4.5 space-y-3.5'>
                {/* Question title */}
                <div className='flex gap-3'>
                  <span className='flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10.5px] font-bold text-primary mt-0.5'>
                    {i + 1}
                  </span>
                  <p className='text-sm font-semibold leading-relaxed text-foreground/90 flex-1'>
                    {q.question_text}
                  </p>
                </div>

                {/* Left/Right Side-by-Side comparison */}
                <div className='pl-8.5 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6'>
                  {/* Traditional Portal Response */}
                  <div className='p-3.5 rounded-xl bg-traditional/2 border border-traditional/15 dark:bg-traditional/4 dark:border-traditional/25'>
                    <div className='flex items-center gap-1.5 mb-2'>
                      <Monitor
                        className='h-3.5 w-3.5 text-traditional'
                        aria-hidden
                      />
                      <span className='text-[11px] font-bold text-traditional uppercase tracking-wider'>
                        Traditional Portal
                      </span>
                    </div>
                    {q.traditionalResponse ? (
                      <ResponseDisplay
                        responseValue={q.traditionalResponse.response_value}
                        responseText={q.traditionalResponse.response_text}
                        scaleType={q.scale_type}
                      />
                    ) : (
                      <p className='text-xs text-muted-foreground/60 italic pl-1'>
                        No answer recorded
                      </p>
                    )}
                  </div>

                  {/* Chat Agent Response */}
                  <div className='p-3.5 rounded-xl bg-chat/2 border border-chat/15 dark:bg-chat/4 dark:border-chat/25'>
                    <div className='flex items-center gap-1.5 mb-2'>
                      <Bot className='h-3.5 w-3.5 text-chat' aria-hidden />
                      <span className='text-[11px] font-bold text-chat uppercase tracking-wider'>
                        Chat Agent
                      </span>
                    </div>
                    {q.chatResponse ? (
                      <ResponseDisplay
                        responseValue={q.chatResponse.response_value}
                        responseText={q.chatResponse.response_text}
                        scaleType={q.scale_type}
                      />
                    ) : (
                      <p className='text-xs text-muted-foreground/60 italic pl-1'>
                        No answer recorded
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function UnifiedSurveyHistorySection({
  groups,
}: {
  groups: UnifiedSurveyGroup[];
}) {
  return (
    <div className='space-y-4'>
      {groups.map((group, index) => (
        <UnifiedSurveyGroupCard
          key={group.surveyName}
          group={group}
          defaultOpen={index === 0}
        />
      ))}
    </div>
  );
}

// ─── Summary stat card ────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className='flex flex-col items-center gap-0.5 px-5 py-3 rounded-lg bg-muted/60 border border-border/60 min-w-[80px]'>
      <span className='text-xl font-bold tabular-nums'>{value}</span>
      <span className='text-[11px] text-muted-foreground text-center leading-tight'>
        {label}
      </span>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface StudyHistoryClientProps {
  tasks: StudyHistoryTask[];
  surveyResponses: StudyHistorySurveyResponse[];
  interviewResponses: StudyHistoryInterview[];
  archivedLabel: string;
}

export function StudyHistoryClient({
  tasks,
  surveyResponses,
  interviewResponses,
  archivedLabel,
}: StudyHistoryClientProps) {
  const unifiedTasks = useMemo(() => {
    const map = new Map<string, UnifiedTaskRow>();
    for (const task of tasks) {
      const code = task.task_definitions.task_code;
      const existing = map.get(code) || {
        task_code: code,
        title: task.task_definitions.title,
        description: task.task_definitions.description || "",
      };

      if (task.task_sessions.system_type === "chat_agent") {
        existing.chatTask = task;
      } else if (task.task_sessions.system_type === "traditional") {
        existing.traditionalTask = task;
      }
      map.set(code, existing);
    }

    return Array.from(map.values()).sort(
      (a, b) =>
        (TASK_ORDER[a.task_code] ?? 999) - (TASK_ORDER[b.task_code] ?? 999),
    );
  }, [tasks]);

  const unifiedSurveys = useMemo(() => {
    const surveyMap = new Map<string, Map<string, UnifiedQuestionRow>>();

    for (const row of surveyResponses) {
      const surveyName = row.task_survey_questions.task_surveys.survey_name;
      const questionId = row.question_id;

      if (!surveyMap.has(surveyName)) {
        surveyMap.set(surveyName, new Map<string, UnifiedQuestionRow>());
      }

      const questionMap = surveyMap.get(surveyName)!;
      const existing = questionMap.get(questionId) || {
        question_id: questionId,
        question_text: row.task_survey_questions.question_text,
        scale_type: row.task_survey_questions.scale_type,
        order_index: row.task_survey_questions.order_index,
      };

      if (row.task_sessions.system_type === "chat_agent") {
        existing.chatResponse = row;
      } else if (row.task_sessions.system_type === "traditional") {
        existing.traditionalResponse = row;
      }

      questionMap.set(questionId, existing);
    }

    const result: UnifiedSurveyGroup[] = [];
    const sortedNames = sortSurveyNames(Array.from(surveyMap.keys()));

    for (const surveyName of sortedNames) {
      const questionMap = surveyMap.get(surveyName)!;
      const questions = Array.from(questionMap.values()).sort(
        (a, b) => a.order_index - b.order_index,
      );

      result.push({
        surveyName,
        title: surveyDisplayTitle(surveyName),
        description: SURVEY_DESCRIPTIONS[surveyName] || "",
        questions,
      });
    }

    return result;
  }, [surveyResponses]);

  const chatStats = useMemo(() => {
    const chatTasks = tasks.filter(
      (t) => t.task_sessions.system_type === "chat_agent",
    );
    return countCompletedTasks(chatTasks);
  }, [tasks]);

  const tradStats = useMemo(() => {
    const tradTasks = tasks.filter(
      (t) => t.task_sessions.system_type === "traditional",
    );
    return countCompletedTasks(tradTasks);
  }, [tasks]);

  const hasData =
    tasks.length > 0 ||
    surveyResponses.length > 0 ||
    interviewResponses.length > 0;

  const overallStats = useMemo(() => {
    const taskStats = countCompletedTasks(tasks);
    return {
      tasksCompleted: taskStats.completed,
      tasksTotal: taskStats.total,
      surveyAnswers: surveyResponses.length,
      interviewAnswers: interviewResponses.length,
    };
  }, [tasks, surveyResponses, interviewResponses]);

  const sortedInterviews = useMemo(
    () =>
      [...interviewResponses].sort(
        (a, b) =>
          a.task_interview_questions.order_index -
          b.task_interview_questions.order_index,
      ),
    [interviewResponses],
  );

  return (
    <div className='min-h-screen bg-muted/20'>
      <SurveyNavbar hasStudyHistory />

      <div className='container mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6'>
        {/* ── Header ── */}
        <header className='space-y-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <Button variant='link' size='icon' className='shrink-0' asChild>
              <Link href='/survey' aria-label='Back to survey'>
                <ArrowLeft className='h-5 w-5' />
              </Link>
            </Button>
            <h1 className='text-2xl font-bold tracking-tight'>
              Previous study record
            </h1>
            <Badge variant='secondary' className='text-xs'>
              {archivedLabel}
            </Badge>
          </div>
          <p className='text-sm text-muted-foreground max-w-lg'>
            Read-only snapshot of your participation before the criteria-based
            task update. Use this page to review your past responses.
          </p>
        </header>

        {/* ── Info banner ── */}
        <Alert>
          <Info className='h-4 w-4' aria-hidden />
          <AlertTitle>Your current tasks are separate</AlertTitle>
          <AlertDescription>
            <p>
              The active study now uses specific targets (course code, room,
              time). This page only shows your earlier work. Continue on the{" "}
              <Link
                href='/survey'
                className='font-medium text-primary underline underline-offset-2'
              >
                survey dashboard
              </Link>
              .
            </p>
          </AlertDescription>
        </Alert>

        {/* ── No data state ── */}
        {!hasData ? (
          <Card className='py-10'>
            <CardContent className='flex flex-col items-center gap-4 text-center'>
              <ClipboardList
                className='h-12 w-12 text-muted-foreground/30'
                aria-hidden
              />
              <div className='space-y-1'>
                <p className='font-semibold'>Nothing on file yet</p>
                <p className='text-sm text-muted-foreground'>
                  No previous study record is associated with your account.
                </p>
              </div>
              <div className='pt-4 flex justify-center'>
                <Button
                  asChild
                  variant='default'
                  size='lg'
                  className='px-6 font-semibold shadow-md border-2 border-primary/80'
                >
                  <Link href='/survey'>
                    <ArrowLeft className='h-4 w-4 mr-2' />
                    Back to survey
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* ── At-a-glance stats ── */}
            {(overallStats.tasksTotal > 0 ||
              overallStats.surveyAnswers > 0) && (
              <Card className='py-3 gap-3'>
                <CardHeader className='px-4 pt-0'>
                  <CardTitle className='text-sm font-semibold text-muted-foreground uppercase tracking-widest'>
                    At a glance
                  </CardTitle>
                </CardHeader>
                <CardContent className='px-4 py-0'>
                  <div className='flex flex-wrap gap-3'>
                    {overallStats.tasksTotal > 0 && (
                      <>
                        <StatPill
                          value={overallStats.tasksCompleted}
                          label='Tasks completed'
                        />
                        <StatPill
                          value={overallStats.tasksTotal}
                          label='Tasks total'
                        />
                      </>
                    )}
                    {overallStats.surveyAnswers > 0 && (
                      <StatPill
                        value={overallStats.surveyAnswers}
                        label='Survey answers'
                      />
                    )}
                    {overallStats.interviewAnswers > 0 && (
                      <StatPill
                        value={overallStats.interviewAnswers}
                        label='Interview answers'
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Unified Task Comparison ── */}
            {unifiedTasks.length > 0 && (
              <UnifiedTaskComparison
                unifiedTasks={unifiedTasks}
                chatCompleted={chatStats.completed}
                chatTotal={chatStats.total}
                tradCompleted={tradStats.completed}
                tradTotal={tradStats.total}
              />
            )}

            {/* ── Unified Survey Comparison ── */}
            {unifiedSurveys.length > 0 && (
              <section
                aria-labelledby='surveys-comparison-heading'
                className='space-y-3.5'
              >
                <div className='flex items-center gap-2'>
                  <BarChart3
                    className='h-4.5 w-4.5 text-muted-foreground'
                    aria-hidden
                  />
                  <h2
                    id='surveys-comparison-heading'
                    className='text-sm font-semibold tracking-tight'
                  >
                    Evaluation Surveys
                  </h2>
                  <span className='text-xs text-muted-foreground'>
                    — Direct question-by-question comparison across both
                    interfaces
                  </span>
                </div>
                <UnifiedSurveyHistorySection groups={unifiedSurveys} />
              </section>
            )}

            {/* ── Final interview ── */}
            {sortedInterviews.length > 0 && (
              <section
                aria-labelledby='interview-heading'
                className='space-y-3'
              >
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
                  {sortedInterviews.map((row, i) => (
                    <Card
                      key={row.id}
                      className='gap-0 py-0 shadow-none overflow-hidden'
                    >
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
                          {row.created_at && (
                            <p className='mt-2 flex items-center gap-1 text-xs text-muted-foreground'>
                              <Clock3 className='h-3 w-3' aria-hidden />
                              {new Intl.DateTimeFormat(undefined, {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }).format(new Date(row.created_at))}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* ── Footer nav ── */}
            <div className='pt-4 flex justify-center'>
              <Button
                asChild
                variant='default'
                size='lg'
                className='px-6 font-semibold shadow-md border-2 border-primary/80'
              >
                <Link href='/survey'>
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Back to survey
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
