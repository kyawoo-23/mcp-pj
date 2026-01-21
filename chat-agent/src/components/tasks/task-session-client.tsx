"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "@bprogress/next/app";
import { createClient } from "@/lib/supabase/client";
import type {
  TaskDefinitionRow,
  TaskProgressRow,
  TaskSessionRow,
  SurveyRow,
  SurveyQuestionRow,
  SurveyResponseRow,
  InterviewQuestionRow,
  UserInterviewResponseRow,
  SystemType,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  logTaskEvent,
  markTaskInProgress,
  writeStoredTaskSession,
} from "@/lib/task-mode-client";

interface TaskSessionClientProps {
  session: Pick<TaskSessionRow, "id" | "status" | "system_type">;
  taskDefinitions: TaskDefinitionRow[];
  taskProgress: TaskProgressRow[];
  surveys: SurveyRow[];
  surveyQuestions: SurveyQuestionRow[];
  existingSurveyResponses: SurveyResponseRow[];
  interviewQuestions: InterviewQuestionRow[];
  existingInterviewResponses: UserInterviewResponseRow[];
  allSystemsCompleted: boolean;
  systemType: SystemType;
}

const taskPrompts: Record<string, string> = {
  register_course:
    "I want to register for a course. Please help me find a course and register.",
  drop_course: "I want to drop one of my registered courses.",
  book_room: "I want to book a study room. Please help me find and book one.",
  cancel_booking: "I want to cancel an existing booking.",
};

export function TaskSessionClient({
  session,
  taskDefinitions,
  taskProgress,
  surveys,
  surveyQuestions,
  existingSurveyResponses,
  interviewQuestions,
  existingInterviewResponses,
  allSystemsCompleted,
  systemType,
}: TaskSessionClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [savingSurvey, setSavingSurvey] = useState(false);
  const [savingInterview, setSavingInterview] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    existingSurveyResponses.forEach((response) => {
      if (response.response_text !== null) {
        initial[response.question_id] = response.response_text;
        return;
      }
      if (response.response_value !== null) {
        initial[response.question_id] = String(response.response_value);
      }
    });
    return initial;
  });
  const [interviews, setInterviews] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    existingInterviewResponses.forEach((response) => {
      initial[response.question_id] = response.response_text;
    });
    return initial;
  });
  const [sessionCompleted, setSessionCompleted] = useState(
    session.status === "completed",
  );
  const [allSystemsCompletedState, setAllSystemsCompletedState] =
    useState(allSystemsCompleted);
  const [systemCompletionStatus, setSystemCompletionStatus] = useState<
    Map<string, boolean>
  >(new Map());

  // Check if all interview questions have been answered
  const interviewResponsesSubmitted = useMemo(() => {
    if (interviewQuestions.length === 0) return true;
    const answeredQuestionIds = new Set(
      existingInterviewResponses.map((r) => r.question_id),
    );
    return interviewQuestions.every((q) => answeredQuestionIds.has(q.id));
  }, [interviewQuestions, existingInterviewResponses]);

  const [interviewSubmitted, setInterviewSubmitted] = useState(
    interviewResponsesSubmitted,
  );

  const refreshAllSystemsCompletion = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    if (!userId) return;
    const { data: sessions } = await supabase
      .from("task_sessions")
      .select("system_type, status")
      .eq("user_id", userId)
      .in("system_type", ["chat_agent", "uni-registration", "uni-booking"]);
    const sessionsBySystem = new Map(
      (sessions || []).map((item) => [item.system_type, item]),
    );
    const requiredSystems = [
      "chat_agent",
      "uni-registration",
      "uni-booking",
    ] as const;
    const completed = requiredSystems.every(
      (item) => sessionsBySystem.get(item)?.status === "completed",
    );
    setAllSystemsCompletedState(completed);

    // Track completion status for each system
    const completionMap = new Map<string, boolean>();
    requiredSystems.forEach((system) => {
      completionMap.set(
        system,
        sessionsBySystem.get(system)?.status === "completed",
      );
    });
    setSystemCompletionStatus(completionMap);
  }, [supabase]);

  useEffect(() => {
    writeStoredTaskSession({ id: session.id, systemType });
    // Load system completion status on mount
    refreshAllSystemsCompletion();
  }, [session.id, systemType, refreshAllSystemsCompletion]);

  useEffect(() => {
    const ensureSessionStarted = async () => {
      // Only update if status is "not_started", don't change "completed" or "in_progress"
      if (session.status !== "not_started") return;
      const now = new Date().toISOString();
      await supabase
        .from("task_sessions")
        .update({ status: "in_progress", started_at: now, updated_at: now })
        .eq("id", session.id);
    };

    ensureSessionStarted();
  }, [session.id, session.status, supabase]);

  useEffect(() => {
    const ensureProgress = async () => {
      const existing = new Set(
        taskProgress.map((row) => row.task_definition_id),
      );
      const missing = taskDefinitions.filter(
        (definition) => !existing.has(definition.id),
      );

      if (missing.length === 0) return;

      await supabase.from("task_progress").insert(
        missing.map((definition) => ({
          session_id: session.id,
          task_definition_id: definition.id,
          status: "not_started" as const,
        })),
      );
    };

    ensureProgress();
  }, [session.id, supabase, taskDefinitions, taskProgress]);

  const progressMap = useMemo(() => {
    const map = new Map<string, TaskProgressRow>();
    taskProgress.forEach((row) => {
      map.set(row.task_definition_id, row);
    });
    return map;
  }, [taskProgress]);

  const surveysById = useMemo(() => {
    const map: Record<string, SurveyRow> = {};
    surveys.forEach((survey) => {
      map[survey.id] = survey;
    });
    return map;
  }, [surveys]);

  const questionsBySurvey = useMemo(() => {
    const grouped: Record<string, SurveyQuestionRow[]> = {};
    surveyQuestions.forEach((question) => {
      if (!grouped[question.survey_id]) {
        grouped[question.survey_id] = [];
      }
      grouped[question.survey_id].push(question);
    });
    return grouped;
  }, [surveyQuestions]);

  const sortedTaskDefinitions = useMemo(() => {
    const sorted = [...taskDefinitions];
    const order: Record<string, number> = {
      register_course: 1,
      drop_course: 2,
      book_room: 3,
      cancel_booking: 4,
    };
    sorted.sort((a, b) => {
      const aOrder = order[a.task_code] ?? 999;
      const bOrder = order[b.task_code] ?? 999;
      return aOrder - bOrder;
    });
    return sorted;
  }, [taskDefinitions]);

  const completedTaskCount = useMemo(() => {
    return taskDefinitions.reduce((count, definition) => {
      const status = progressMap.get(definition.id)?.status;
      return status === "completed" ? count + 1 : count;
    }, 0);
  }, [progressMap, taskDefinitions]);

  const allTasksCompleted =
    taskDefinitions.length > 0 && completedTaskCount === taskDefinitions.length;
  const hasExistingResponses = existingSurveyResponses.length > 0;
  const questionnaireLocked =
    !allTasksCompleted || sessionCompleted || hasExistingResponses;

  const handleOpenTask = async (taskDefinitionId: string, taskCode: string) => {
    await markTaskInProgress(session.id, taskDefinitionId);
    await logTaskEvent(session.id, "step", "task_opened", {
      task_code: taskCode,
    });
    router.push(`/c/new?task=${taskCode}`);
  };

  const handleSurveySubmit = async () => {
    if (questionnaireLocked) return;

    // Validate that all questions have responses
    const unansweredQuestions = surveyQuestions.filter(
      (question) =>
        !responses[question.id] || responses[question.id].trim() === "",
    );

    if (unansweredQuestions.length > 0) {
      toast.error(
        `Please answer all questions. ${unansweredQuestions.length} question(s) remaining.`,
      );
      return;
    }

    setSavingSurvey(true);
    try {
      const entries = Object.entries(responses).map(([questionId, value]) => ({
        session_id: session.id,
        question_id: questionId,
        response_value: Number.isNaN(Number(value)) ? null : Number(value),
        response_text: Number.isNaN(Number(value)) ? value : null,
      }));

      if (entries.length > 0) {
        const { error: upsertError } = await supabase
          .from("task_survey_responses")
          .upsert(entries, { onConflict: "session_id,question_id" });

        if (upsertError) {
          toast.error("Failed to save questionnaire responses", {
            description: upsertError.message,
          });
          return;
        }
      }

      await logTaskEvent(session.id, "survey", "survey_submitted", {
        question_count: entries.length,
      });

      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("task_sessions")
        .update({ status: "completed", completed_at: now, updated_at: now })
        .eq("id", session.id);

      if (updateError) {
        toast.error("Failed to update task session status", {
          description: updateError.message,
        });
        return;
      }

      setSessionCompleted(true);
      await refreshAllSystemsCompletion();
      toast.success("Questionnaire responses saved successfully!");
    } finally {
      setSavingSurvey(false);
    }
  };

  const getOtherSystemUrls = () => {
    const currentHost =
      typeof window !== "undefined" ? window.location.hostname : "";
    const isVercelDomain = currentHost.includes("vercel.app");

    const systemUrlMap: Record<string, { name: string; url: string }> = {
      chat_agent: {
        name: "Chat Agent",
        url: isVercelDomain
          ? "https://mcp-pj-chat-agent.vercel.app/tasks"
          : "https://chat-agent.mcp-project.app/tasks",
      },
      "uni-registration": {
        name: "Course Registration",
        url: isVercelDomain
          ? "https://mcp-pj-uni-registration.vercel.app/tasks"
          : "https://uni-registration.mcp-project.app/tasks",
      },
      "uni-booking": {
        name: "Room Booking",
        url: isVercelDomain
          ? "https://mcp-pj-uni-booking.vercel.app/tasks"
          : "https://uni-booking.mcp-project.app/tasks",
      },
    };

    const incompleteSystems = Array.from(systemCompletionStatus.entries())
      .filter(([sysType, isCompleted]) => {
        return sysType !== systemType && !isCompleted;
      })
      .map(([sysType]) => systemUrlMap[sysType])
      .filter(Boolean);

    return incompleteSystems;
  };

  const handleInterviewSubmit = async () => {
    // Validate that all interview questions have non-empty responses
    const unansweredQuestions = interviewQuestions.filter(
      (question) =>
        !interviews[question.id] || interviews[question.id].trim() === "",
    );

    if (unansweredQuestions.length > 0) {
      toast.error(
        `Please answer all interview questions. ${unansweredQuestions.length} question(s) remaining.`,
      );
      return;
    }

    setSavingInterview(true);
    try {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) return;
      const entries = interviewQuestions
        .map((question) => ({
          question_id: question.id,
          response_text: interviews[question.id]?.trim() || "",
        }))
        .map((entry) => ({
          user_id: userId,
          ...entry,
        }));

      if (entries.length > 0) {
        await supabase
          .from("user_interview_responses")
          .upsert(entries, { onConflict: "user_id,question_id" });
      }

      await logTaskEvent(session.id, "interview", "interview_submitted", {
        question_count: entries.length,
      });
      setInterviewSubmitted(true);
      toast.success("Interview responses saved successfully!");
    } finally {
      setSavingInterview(false);
    }
  };

  return (
    <div className='mx-auto flex w-full max-w-4xl flex-col gap-6 p-6'>
      <Button
        variant='ghost'
        onClick={() => router.back()}
        className='w-fit -ml-2'
      >
        <ChevronLeft className='mr-2 h-4 w-4' />
        Back
      </Button>
      {sessionCompleted && (
        <Alert className='border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'>
          <CheckCircle2 className='h-4 w-4 text-green-600 dark:text-green-400' />
          <AlertTitle className='text-green-900 dark:text-green-100'>
            Task Mode Completed
          </AlertTitle>
          <AlertDescription className='text-green-800 dark:text-green-200'>
            <div className='space-y-2'>
              <p>
                You have already completed Task Mode for this system. Your
                questionnaire responses have been submitted.
              </p>
              {(() => {
                const incompleteSystems = getOtherSystemUrls();
                if (incompleteSystems.length > 0) {
                  return (
                    <div className='mt-3 space-y-2'>
                      <p className='font-medium'>
                        Continue with other systems:
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {incompleteSystems.map((system) => (
                          <a
                            key={system.url}
                            href={system.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-1 rounded-md bg-green-100 px-3 py-1.5 text-sm font-medium text-green-900 transition-colors hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800'
                          >
                            {system.name}
                            <ExternalLink className='h-3 w-3' />
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                } else {
                  if (!interviewSubmitted) {
                    return (
                      <p className='mt-3 text-sm text-muted-foreground'>
                        All systems have been completed. You can now submit your{" "}
                        <span
                          className='font-medium underline cursor-pointer'
                          onClick={() => {
                            document
                              .getElementById("interview-questions")
                              ?.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          interview responses
                        </span>
                        .
                      </p>
                    );
                  }
                  return null;
                }
              })()}
            </div>
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Task Checklist</CardTitle>
          <CardDescription>
            Complete each task before unlocking the questionnaires.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='text-sm text-muted-foreground'>
            {completedTaskCount}/{taskDefinitions.length} tasks completed.
          </div>
          {sortedTaskDefinitions.map((task) => {
            const progress = progressMap.get(task.id);
            const status = progress?.status || "not_started";
            const getBadgeVariant = (
              status: string,
            ): VariantProps<typeof badgeVariants>["variant"] => {
              if (status === "completed") return "success";
              if (status === "in_progress") return "warning";
              return "outline";
            };
            return (
              <div
                key={task.id}
                className='flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between'
              >
                <div>
                  <div className='flex items-center gap-2'>
                    <h3 className='font-medium'>{task.title}</h3>
                    <Badge variant={getBadgeVariant(status)}>
                      {status.replace("_", " ")}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className='text-sm text-muted-foreground'>
                      {task.description}
                    </p>
                  )}
                  {taskPrompts[task.task_code] && (
                    <p className='mt-2 text-xs text-muted-foreground'>
                      Prompt: {taskPrompts[task.task_code]}
                    </p>
                  )}
                </div>
                <Button
                  variant='outline'
                  onClick={() => handleOpenTask(task.id, task.task_code)}
                  disabled={status === "completed"}
                >
                  {status === "completed" ? "Completed" : "Open Chat Task"}
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questionnaires</CardTitle>
          <CardDescription>
            Complete SUS and NASA-TLX after finishing your tasks.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {!allTasksCompleted && (
            <div className='rounded-md border border-dashed p-3 text-sm text-muted-foreground'>
              Complete all tasks above to unlock the questionnaires.
            </div>
          )}
          {Object.entries(questionsBySurvey).map(([surveyId, questions]) => {
            const survey = surveysById[surveyId];
            return (
              <div key={surveyId} className='space-y-4'>
                <h3 className='text-base font-semibold'>
                  {survey?.survey_name}
                </h3>
                {questions.map((question) => (
                  <div key={question.id} className='space-y-2'>
                    <Label>{question.question_text}</Label>
                    {question.scale_type === "likert_5" ? (
                      <Select
                        value={responses[question.id] || ""}
                        disabled={questionnaireLocked}
                        onValueChange={(value) =>
                          setResponses((prev) => ({
                            ...prev,
                            [question.id]: value,
                          }))
                        }
                      >
                        <SelectTrigger disabled={questionnaireLocked}>
                          <SelectValue placeholder='Select 1-5' />
                        </SelectTrigger>
                        <SelectContent>
                          {["1", "2", "3", "4", "5"].map((value) => (
                            <SelectItem key={value} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type='number'
                        min={question.min_value ?? 0}
                        max={question.max_value ?? 100}
                        value={responses[question.id] || ""}
                        disabled={questionnaireLocked}
                        onChange={(event) =>
                          setResponses((prev) => ({
                            ...prev,
                            [question.id]: event.target.value,
                          }))
                        }
                        placeholder='Enter a value'
                      />
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </CardContent>
        <CardFooter className='flex justify-end'>
          <Button
            onClick={handleSurveySubmit}
            disabled={savingSurvey || questionnaireLocked}
          >
            {savingSurvey
              ? "Saving..."
              : sessionCompleted
                ? "Questionnaires Submitted"
                : "Save Questionnaire Responses"}
          </Button>
        </CardFooter>
      </Card>

      {allSystemsCompletedState && (
        <Card id='interview-questions'>
          <CardHeader>
            <CardTitle>Interview Questions</CardTitle>
            <CardDescription>
              Share short answers after completing all systems.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {interviewQuestions.map((question) => {
              const submittedResponse = existingInterviewResponses.find(
                (r) => r.question_id === question.id,
              );
              const responseText =
                submittedResponse?.response_text ||
                interviews[question.id] ||
                "";

              return (
                <div key={question.id} className='space-y-2'>
                  <Label>{question.question_text}</Label>
                  <Textarea
                    rows={3}
                    value={responseText}
                    disabled={interviewSubmitted}
                    onChange={(event) =>
                      setInterviews((prev) => ({
                        ...prev,
                        [question.id]: event.target.value,
                      }))
                    }
                    placeholder='Your response...'
                  />
                </div>
              );
            })}
          </CardContent>
          <CardFooter className='flex justify-end'>
            <Button
              onClick={handleInterviewSubmit}
              disabled={savingInterview || interviewSubmitted}
            >
              {savingInterview
                ? "Saving..."
                : interviewSubmitted
                  ? "Interview Responses Submitted"
                  : "Save Interview Responses"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
