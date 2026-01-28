"use client";

import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type {
  InterviewQuestionRow,
  UserInterviewResponseRow,
} from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { RadioSelect } from "@/components/survey/radio-select";
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

interface InterviewFormProps {
  interviewQuestions: InterviewQuestionRow[];
  interviewResponses: UserInterviewResponseRow[];
  enabled: boolean;
  onSubmitted: () => Promise<void> | void;
  onDirtyStateChange?: (isDirty: boolean) => void;
}

export function InterviewForm({
  interviewQuestions,
  interviewResponses,
  enabled,
  onSubmitted,
  onDirtyStateChange,
}: InterviewFormProps) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [responses, setResponses] = useState<Record<string, string>>({});
  const hasUnsavedChanges = Object.keys(responses).length > 0 && enabled;
  useWarnIfUnsavedChanges(hasUnsavedChanges);

  const initialResponses = useMemo(() => {
    const initial: Record<string, string> = {};
    interviewResponses.forEach((response) => {
      initial[response.question_id] = response.response_text;
    });
    return initial;
  }, [interviewResponses]);

  useEffect(() => {
    const initial: Record<string, string> = {};
    interviewResponses.forEach((response) => {
      initial[response.question_id] = response.response_text;
    });
    setResponses(initial);
  }, [interviewResponses]);

  useEffect(() => {
    const isDirty =
      Object.keys(responses).length > 0 &&
      JSON.stringify(responses) !== JSON.stringify(initialResponses);
    onDirtyStateChange?.(isDirty && enabled);
  }, [responses, initialResponses, enabled, onDirtyStateChange]);

  const sortedQuestions = useMemo(() => {
    return [...interviewQuestions].sort(
      (a, b) => a.order_index - b.order_index,
    );
  }, [interviewQuestions]);

  const handlePreSubmit = () => {
    if (!enabled || saving) return;
    const unanswered = sortedQuestions.filter(
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
    if (!enabled || saving) return;

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in again to submit the interview.");
        return;
      }

      const entries = Object.entries(responses).map(
        ([questionId, responseText]) => ({
          user_id: user.id,
          question_id: questionId,
          response_text: responseText,
        }),
      );

      const { error } = await supabase
        .from("task_interview_responses")
        .upsert(entries, { onConflict: "user_id,question_id" });

      if (error) {
        toast.error("Failed to save interview responses", {
          description: error.message,
        });
        return;
      }

      toast.success("Interview responses saved. Thank you!");
      await onSubmitted();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='space-y-6'>
      <Card className='border-primary/10'>
        <CardHeader className='pb-4'>
          <CardTitle className='text-lg font-medium'>
            Final Interview Questions
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {sortedQuestions.map((question, index) => {
            const options = Array.isArray(question.options)
              ? (question.options as string[])
              : null;
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
                <div className='pl-6'>
                  {options ? (
                    <RadioSelect
                      options={options}
                      value={value}
                      onChange={(val) =>
                        setResponses((prev) => ({
                          ...prev,
                          [question.id]: val,
                        }))
                      }
                      disabled={!enabled}
                    />
                  ) : (
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

      <div className='flex justify-end pt-4'>
        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <Button
            className='w-full sm:w-fit'
            disabled={!enabled || saving}
            onClick={handlePreSubmit}
            size='lg'
          >
            {saving ? "Submitting..." : "Submit Interview"}
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
                {saving ? "Submitting..." : "Submit Interview"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
