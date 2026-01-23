"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { InterviewQuestionRow, UserInterviewResponseRow } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface InterviewFormProps {
  interviewQuestions: InterviewQuestionRow[];
  interviewResponses: UserInterviewResponseRow[];
  enabled: boolean;
  onSubmitted: () => Promise<void> | void;
}

export function InterviewForm({
  interviewQuestions,
  interviewResponses,
  enabled,
  onSubmitted,
}: InterviewFormProps) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);

  const [responses, setResponses] = useState<Record<string, string>>({});

  useEffect(() => {
    const initial: Record<string, string> = {};
    interviewResponses.forEach((response) => {
      initial[response.question_id] = response.response_text;
    });
    setResponses(initial);
  }, [interviewResponses]);

  const sortedQuestions = useMemo(() => {
    return [...interviewQuestions].sort((a, b) => a.order_index - b.order_index);
  }, [interviewQuestions]);

  const handleSubmit = async () => {
    if (!enabled || saving) return;
    const unanswered = sortedQuestions.filter(
      (question) => !responses[question.id] || responses[question.id].trim() === ""
    );
    if (unanswered.length) {
      toast.error(
        `Please answer all questions. ${unanswered.length} remaining.`
      );
      return;
    }

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in again to submit the interview.");
        return;
      }

      const entries = Object.entries(responses).map(([questionId, responseText]) => ({
        user_id: user.id,
        question_id: questionId,
        response_text: responseText,
      }));

      const { error } = await supabase
        .from("user_interview_responses")
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
    <Card>
      <CardHeader>
        <CardTitle>Final Interview</CardTitle>
        <CardDescription>
          Answer these questions after completing both surveys.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {!enabled && (
          <Alert>
            <AlertDescription>
              Complete both surveys to unlock the interview form.
            </AlertDescription>
          </Alert>
        )}
        {sortedQuestions.map((question) => (
          <div key={question.id} className='space-y-2'>
            <Label className='text-sm font-medium'>
              {question.order_index}. {question.question_text}
            </Label>
            <Textarea
              value={responses[question.id] ?? ""}
              onChange={(event) =>
                setResponses((prev) => ({
                  ...prev,
                  [question.id]: event.target.value,
                }))
              }
              disabled={!enabled}
            />
          </div>
        ))}
        <Button
          className='w-full sm:w-fit'
          disabled={!enabled || saving}
          onClick={handleSubmit}
        >
          {saving ? "Submitting..." : "Submit interview"}
        </Button>
      </CardContent>
    </Card>
  );
}
