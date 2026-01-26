"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { TlxScale } from "@/components/survey/tlx-scale";

interface TraditionalSurveyProps {
  session?: TaskSessionRow;
  surveys: SurveyRow[];
  surveyQuestions: SurveyQuestionRow[];
  surveyResponses: SurveyResponseRow[];
  enabled: boolean;
  onSubmitted: () => Promise<void> | void;
}

export function TraditionalSurvey({
  session,
  surveys,
  surveyQuestions,
  surveyResponses,
  enabled,
  onSubmitted,
}: TraditionalSurveyProps) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);

  const sessionResponses = useMemo(() => {
    if (!session) return [];
    return surveyResponses.filter(
      (response) => response.session_id === session.id,
    );
  }, [surveyResponses, session]);

  const [responses, setResponses] = useState<Record<string, string>>({});

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

  const surveyQuestionsSorted = useMemo(() => {
    return [...surveyQuestions].sort((a, b) => {
      // Group by scale_type first
      if (a.scale_type < b.scale_type) return -1;
      if (a.scale_type > b.scale_type) return 1;
      // Then sort by order_index
      return a.order_index - b.order_index;
    });
  }, [surveyQuestions]);

  const surveyById = useMemo(() => {
    const map = new Map<string, SurveyRow>();
    surveys.forEach((survey) => map.set(survey.id, survey));
    return map;
  }, [surveys]);

  const handleSubmit = async () => {
    if (!session || !enabled || saving) return;
    const unanswered = surveyQuestionsSorted.filter(
      (question) =>
        !responses[question.id] || responses[question.id].trim() === "",
    );

    if (unanswered.length) {
      toast.error(
        `Please answer all questions. ${unanswered.length} remaining.`,
      );
      return;
    }

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
    <div className='space-y-6'>
      {surveyQuestionsSorted.map((question) => {
        const survey = surveyById.get(question.survey_id);
        const value = responses[question.id] ?? "";
        return (
          <div key={question.id} className='space-y-2'>
            <Label className='text-sm font-medium'>
              {survey?.survey_name ? `${survey.survey_name}: ` : ""}
              {question.order_index}. {question.question_text}
            </Label>
            {question.scale_type === "likert_5" && (
              <Select
                value={value}
                onValueChange={(val) =>
                  setResponses((prev) => ({ ...prev, [question.id]: val }))
                }
                disabled={!enabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select 1-5' />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {question.scale_type === "likert_7" && (
              <Select
                value={value}
                onValueChange={(val) =>
                  setResponses((prev) => ({ ...prev, [question.id]: val }))
                }
                disabled={!enabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select 1-7' />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              />
            )}
          </div>
        );
      })}

      <Button
        className='w-full sm:w-fit'
        disabled={!enabled || saving}
        onClick={handleSubmit}
      >
        {saving ? "Submitting..." : "Submit traditional survey"}
      </Button>
    </div>
  );
}
