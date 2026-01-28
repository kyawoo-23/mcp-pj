"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type {
  SurveyQuestionRow,
  SurveyResponseRow,
  SurveyRow,
  TaskSessionRow,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LikertScale } from "@/components/survey/likert-scale";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TlxScale } from "@/components/survey/tlx-scale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useWarnIfUnsavedChanges } from "@/hooks/use-warn-if-unsaved-changes";

const SURVEY_CONFIG: Record<string, { title: string; description: string }> = {
  SUS: {
    title: "System Usability",
    description: "Please share your thoughts on the system's usability.",
  },
  RAW_TLX: {
    title: "Workload Assessment",
    description: "Please assess the mental and physical demand of the tasks.",
  },
  SDT: {
    title: "User Experience",
    description:
      "Please evaluate your sense of control and competence while using the system.",
  },
};

interface TraditionalSurveyProps {
  session?: TaskSessionRow;
  surveys: SurveyRow[];
  surveyQuestions: SurveyQuestionRow[];
  surveyResponses: SurveyResponseRow[];
  enabled: boolean;
  onSubmitted: () => Promise<void> | void;
  onDirtyStateChange?: (isDirty: boolean) => void;
}

export function TraditionalSurvey({
  session,
  surveys,
  surveyQuestions,
  surveyResponses,
  enabled,
  onSubmitted,
  onDirtyStateChange,
}: TraditionalSurveyProps) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const sessionResponses = useMemo(() => {
    if (!session) return [];
    return surveyResponses.filter(
      (response) => response.session_id === session.id,
    );
  }, [surveyResponses, session]);

  const initialResponses = useMemo(() => {
    const initial: Record<string, string> = {};
    sessionResponses.forEach((response) => {
      if (response.response_text !== null) {
        initial[response.question_id] = response.response_text;
        return;
      }
      if (response.response_value !== null) {
        initial[response.question_id] = String(response.response_value);
      }
    });
    return initial;
  }, [sessionResponses]);

  const [responses, setResponses] = useState<Record<string, string>>({});
  const hasUnsavedChanges = Object.keys(responses).length > 0 && enabled;
  useWarnIfUnsavedChanges(hasUnsavedChanges);

  useEffect(() => {
    const initial: Record<string, string> = {};
    sessionResponses.forEach((response) => {
      if (response.response_text !== null) {
        initial[response.question_id] = response.response_text;
        return;
      }
      if (response.response_value !== null) {
        initial[response.question_id] = String(response.response_value);
      }
    });
    setResponses(initial);
  }, [sessionResponses]);

  useEffect(() => {
    const isDirty =
      Object.keys(responses).length > 0 &&
      JSON.stringify(responses) !== JSON.stringify(initialResponses);
    onDirtyStateChange?.(isDirty && enabled);
  }, [responses, initialResponses, enabled, onDirtyStateChange]);

  const surveyGroups = useMemo(() => {
    const groups = new Map<string, SurveyQuestionRow[]>();

    // Sort questions by order_index first
    const sortedQuestions = [...surveyQuestions].sort(
      (a, b) => a.order_index - b.order_index,
    );

    sortedQuestions.forEach((q) => {
      if (!groups.has(q.survey_id)) {
        groups.set(q.survey_id, []);
      }
      groups.get(q.survey_id)?.push(q);
    });

    // Return array of entries, sorted by survey name to ensure consistent order (SUS, RAW_TLX, SDT)
    // You might want a specific order. Let's try to order by our known types if possible, or just keep insertion order if the DB returns them consistently.
    // The DB insertion order was SUS, RAW_TLX, SDT.
    return Array.from(groups.entries());
  }, [surveyQuestions]);

  const surveyById = useMemo(() => {
    const map = new Map<string, SurveyRow>();
    surveys.forEach((survey) => map.set(survey.id, survey));
    return map;
  }, [surveys]);

  const handlePreSubmit = () => {
    if (!session || !enabled || saving) return;

    const unanswered = surveyQuestions.filter(
      (question) =>
        !responses[question.id] || responses[question.id].trim() === "",
    );

    if (unanswered.length) {
      toast.error(
        `Please answer all questions. ${unanswered.length} remaining.`,
      );
      return;
    }

    setShowConfirm(true);
  };

  const handleSubmit = async () => {
    setShowConfirm(false);
    if (!session || !enabled || saving) return;

    setSaving(true);
    try {
      const entries = Object.entries(responses).map(([questionId, value]) => ({
        session_id: session.id,
        question_id: questionId,
        response_value: Number.isNaN(Number(value)) ? null : Number(value),
        response_text: Number.isNaN(Number(value)) ? value : null,
      }));

      if (entries.length) {
        const { error } = await supabase
          .from("task_survey_responses")
          .upsert(entries, { onConflict: "session_id,question_id" });
        if (error) {
          toast.error("Failed to save survey responses", {
            description: error.message,
          });
          return;
        }
      }

      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("task_sessions")
        .update({ status: "completed", completed_at: now, updated_at: now })
        .eq("id", session.id);

      if (updateError) {
        toast.error("Failed to update session status", {
          description: updateError.message,
        });
        return;
      }

      // Start the chat_agent session after traditional survey is completed
      await supabase.from("task_sessions").upsert(
        {
          user_id: session.user_id,
          system_type: "chat_agent",
          status: "in_progress",
          started_at: now,
          updated_at: now,
        },
        { onConflict: "user_id,system_type" },
      );

      toast.success("Traditional survey submitted.");
      await onSubmitted();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='space-y-8'>
      {surveyGroups.map(([surveyId, questions]) => {
        const survey = surveyById.get(surveyId);
        const config = survey?.survey_name
          ? SURVEY_CONFIG[survey.survey_name]
          : null;
        const title = config?.title || survey?.survey_name || "Survey Section";
        const description = config?.description;

        return (
          <Card key={surveyId} className='border-primary/10'>
            <CardHeader className='pb-4'>
              <CardTitle className='text-lg font-medium'>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className='space-y-6'>
              {questions.map((question, index) => {
                const value = responses[question.id] ?? "";
                return (
                  <div
                    key={question.id}
                    className={cn(
                      "space-y-3 rounded-lg p-4 transition-colors",
                      index % 2 === 0 ? "bg-muted/50" : "bg-transparent",
                    )}
                  >
                    <Label className='text-sm font-normal leading-relaxed'>
                      <span className='mr-2 font-medium text-muted-foreground'>
                        {question.order_index}.
                      </span>
                      {question.question_text}
                    </Label>
                    <div className='md:pl-6'>
                      {question.scale_type === "likert_5" && (
                        <div className='py-2'>
                          <LikertScale
                            value={value}
                            onChange={(val) =>
                              setResponses((prev) => ({
                                ...prev,
                                [question.id]: val,
                              }))
                            }
                            min={1}
                            max={5}
                            disabled={!enabled}
                          />
                        </div>
                      )}
                      {question.scale_type === "likert_7" && (
                        <div className='py-2'>
                          <LikertScale
                            value={value}
                            onChange={(val) =>
                              setResponses((prev) => ({
                                ...prev,
                                [question.id]: val,
                              }))
                            }
                            min={1}
                            max={7}
                            disabled={!enabled}
                          />
                        </div>
                      )}
                      {question.scale_type === "numeric_0_100" && (
                        <TlxScale
                          value={value}
                          min={question.min_value ?? 0}
                          max={question.max_value ?? 100}
                          onChange={(val) =>
                            setResponses((prev) => ({
                              ...prev,
                              [question.id]: String(val),
                            }))
                          }
                          disabled={!enabled}
                        />
                      )}
                      {question.scale_type === "free_text" && (
                        <Textarea
                          value={value}
                          onChange={(event) =>
                            setResponses((prev) => ({
                              ...prev,
                              [question.id]: event.target.value,
                            }))
                          }
                          disabled={!enabled}
                          className='resize-none'
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      <div className='flex justify-end pt-4'>
        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <Button
            className='w-full sm:w-fit'
            disabled={!enabled || saving}
            onClick={handlePreSubmit}
            size='lg'
          >
            {saving ? "Submitting..." : "Submit Traditional Survey"}
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ready to submit?</AlertDialogTitle>
              <AlertDialogDescription>
                You’ve completed all sections. Are you sure you want to submit
                your responses? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmit} disabled={saving}>
                {saving ? "Submitting..." : "Submit Survey"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
