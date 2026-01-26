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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TlxScale } from "@/components/survey/tlx-scale";

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
    description: "Please evaluate your sense of control and competence while using the system.",
  },
};

interface ChatAgentSurveyProps {
  session?: TaskSessionRow;
  surveys: SurveyRow[];
  surveyQuestions: SurveyQuestionRow[];
  surveyResponses: SurveyResponseRow[];
  enabled: boolean;
  onSubmitted: () => Promise<void> | void;
}

export function ChatAgentSurvey({
  session,
  surveys,
  surveyQuestions,
  surveyResponses,
  enabled,
  onSubmitted,
}: ChatAgentSurveyProps) {
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

  const surveyGroups = useMemo(() => {
    const groups = new Map<string, SurveyQuestionRow[]>();
    
    // Sort questions by order_index first
    const sortedQuestions = [...surveyQuestions].sort(
      (a, b) => a.order_index - b.order_index
    );

    sortedQuestions.forEach((q) => {
      if (!groups.has(q.survey_id)) {
        groups.set(q.survey_id, []);
      }
      groups.get(q.survey_id)?.push(q);
    });

    return Array.from(groups.entries());
  }, [surveyQuestions]);

  const surveyById = useMemo(() => {
    const map = new Map<string, SurveyRow>();
    surveys.forEach((survey) => map.set(survey.id, survey));
    return map;
  }, [surveys]);

  const handleSubmit = async () => {
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

      toast.success("Chat-agent survey submitted.");
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
              {description && (
                <CardDescription>{description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className='space-y-6'>
              {questions.map((question) => {
                const value = responses[question.id] ?? "";
                return (
                  <div key={question.id} className='space-y-3'>
                    <Label className='text-sm font-normal leading-relaxed'>
                      <span className='mr-2 font-medium text-muted-foreground'>
                        {question.order_index}.
                      </span>
                      {question.question_text}
                    </Label>
                    <div className='pl-6'>
                      {question.scale_type === "likert_5" && (
                        <Select
                          value={value}
                          onValueChange={(val) =>
                            setResponses((prev) => ({
                              ...prev,
                              [question.id]: val,
                            }))
                          }
                          disabled={!enabled}
                        >
                          <SelectTrigger className='w-full sm:w-[200px]'>
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
                            setResponses((prev) => ({
                              ...prev,
                              [question.id]: val,
                            }))
                          }
                          disabled={!enabled}
                        >
                          <SelectTrigger className='w-full sm:w-[200px]'>
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
        <Button
          className='w-full sm:w-fit'
          disabled={!enabled || saving}
          onClick={handleSubmit}
          size='lg'
        >
          {saving ? "Submitting..." : "Submit Chat Agent Survey"}
        </Button>
      </div>
    </div>
  );
}
