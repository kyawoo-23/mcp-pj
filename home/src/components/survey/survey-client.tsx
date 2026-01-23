"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  InterviewQuestionRow,
  ProfileRow,
  SurveyQuestionRow,
  SurveyResponseRow,
  SurveyRow,
  TaskDefinitionRow,
  TaskProgressRow,
  TaskSessionRow,
  UserInterviewResponseRow,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { TaskList } from "@/components/survey/task-list";
import { ChatAgentSurvey } from "@/components/survey/chat-agent-survey";
import { TraditionalSurvey } from "@/components/survey/traditional-survey";
import { InterviewForm } from "@/components/survey/interview-form";

interface SurveyPageClientProps {
  profile: Pick<ProfileRow, "id" | "age_range" | "gender"> | null;
  sessions: TaskSessionRow[];
  taskDefinitions: TaskDefinitionRow[];
  taskProgress: TaskProgressRow[];
  surveys: SurveyRow[];
  surveyQuestions: SurveyQuestionRow[];
  surveyResponses: SurveyResponseRow[];
  interviewQuestions: InterviewQuestionRow[];
  interviewResponses: UserInterviewResponseRow[];
}

const ageOptions: Array<{ value: ProfileRow["age_range"]; label: string }> = [
  { value: "under_18", label: "Under 18" },
  { value: "18_24", label: "18-24" },
  { value: "25_34", label: "25-34" },
  { value: "35_44", label: "35-44" },
  { value: "45_54", label: "45-54" },
  { value: "55_plus", label: "55+" },
  { value: "prefer_not_say", label: "Prefer not to say" },
];

const genderOptions: Array<{ value: ProfileRow["gender"]; label: string }> = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "prefer_not_say", label: "Prefer not to say" },
];

const taskOrder: Record<string, number> = {
  register_course: 1,
  drop_course: 2,
  book_room: 3,
  cancel_booking: 4,
};

function getTaskUrl(
  systemType: TaskDefinitionRow["system_type"],
  taskCode: string,
) {
  if (systemType === "chat_agent") {
    return `http://localhost:4000/c?task_code=${taskCode}`;
  }
  if (taskCode === "register_course" || taskCode === "drop_course") {
    return `http://localhost:4002?task_code=${taskCode}`;
  }
  return `http://localhost:4001?task_code=${taskCode}`;
}

export function SurveyPageClient({
  profile,
  sessions,
  taskDefinitions,
  taskProgress,
  surveys,
  surveyQuestions,
  surveyResponses,
  interviewQuestions,
  interviewResponses,
}: SurveyPageClientProps) {
  const supabase = createClient();
  const [profileState, setProfileState] = useState(profile);
  const [sessionsState, setSessionsState] = useState(sessions);
  const [taskProgressState, setTaskProgressState] = useState(taskProgress);
  const [surveyResponsesState, setSurveyResponsesState] =
    useState(surveyResponses);
  const [interviewResponsesState, setInterviewResponsesState] =
    useState(interviewResponses);
  const [savingDemographics, setSavingDemographics] = useState(false);
  const [startingSurvey, setStartingSurvey] = useState(false);
  const [ageRange, setAgeRange] = useState<ProfileRow["age_range"] | null>(
    profile?.age_range ?? null,
  );
  const [gender, setGender] = useState<ProfileRow["gender"] | null>(
    profile?.gender ?? null,
  );

  const requiresDemographics =
    !profileState?.age_range || !profileState?.gender;

  const sessionsBySystem = useMemo(() => {
    return new Map(
      sessionsState.map((session) => [session.system_type, session]),
    );
  }, [sessionsState]);

  const progressByTaskId = useMemo(() => {
    const map = new Map<string, TaskProgressRow>();
    taskProgressState.forEach((row) => {
      map.set(row.task_definition_id, row);
    });
    return map;
  }, [taskProgressState]);

  const tasksBySystem = useMemo(() => {
    const grouped: Record<string, TaskDefinitionRow[]> = {
      chat_agent: [],
      traditional: [],
    };
    taskDefinitions.forEach((definition) => {
      if (!grouped[definition.system_type]) {
        grouped[definition.system_type] = [];
      }
      grouped[definition.system_type].push(definition);
    });
    Object.values(grouped).forEach((list) =>
      list.sort(
        (a, b) =>
          (taskOrder[a.task_code] ?? 999) - (taskOrder[b.task_code] ?? 999),
      ),
    );
    return grouped;
  }, [taskDefinitions]);

  const activeTask = useMemo(() => {
    return taskProgressState.find((row) => row.status === "in_progress");
  }, [taskProgressState]);

  const sessionIds = useMemo(
    () => sessionsState.map((session) => session.id),
    [sessionsState],
  );

  const refreshTaskData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const sessionsPromise = supabase
      .from("task_sessions")
      .select(
        "id, status, system_type, started_at, completed_at, user_id, created_at, updated_at",
      )
      .eq("user_id", user.id)
      .in("system_type", ["chat_agent", "traditional"]);

    const [sessionsResult] = await Promise.all([sessionsPromise]);
    const latestSessions = sessionsResult.data || [];
    setSessionsState(latestSessions);

    const latestSessionIds = latestSessions.map((session) => session.id);
    if (latestSessionIds.length) {
      const [progressResult, surveyResponseResult, interviewResponseResult] =
        await Promise.all([
          supabase
            .from("task_progress")
            .select(
              "id, task_definition_id, status, started_at, completed_at, created_at, session_id, success_payload, updated_at",
            )
            .in("session_id", latestSessionIds),
          supabase
            .from("task_survey_responses")
            .select(
              "id, question_id, response_value, response_text, session_id, created_at",
            )
            .in("session_id", latestSessionIds),
          supabase
            .from("user_interview_responses")
            .select("id, question_id, response_text, user_id, created_at")
            .eq("user_id", user.id),
        ]);

      setTaskProgressState(progressResult.data || []);
      setSurveyResponsesState(surveyResponseResult.data || []);
      setInterviewResponsesState(interviewResponseResult.data || []);
    }
  }, [supabase]);

  useEffect(() => {
    const ensureProgress = async () => {
      if (!sessionsState.length || !taskDefinitions.length) return;
      const existing = new Set(
        taskProgressState.map(
          (row) => `${row.session_id}:${row.task_definition_id}`,
        ),
      );
      const missing: Array<{
        session_id: string;
        task_definition_id: string;
        status: TaskProgressRow["status"];
      }> = [];

      sessionsState.forEach((session) => {
        const definitions = tasksBySystem[session.system_type] || [];
        definitions.forEach((definition) => {
          const key = `${session.id}:${definition.id}`;
          if (!existing.has(key)) {
            missing.push({
              session_id: session.id,
              task_definition_id: definition.id,
              status: "not_started",
            });
          }
        });
      });

      if (!missing.length) return;

      await supabase.from("task_progress").insert(missing);
      await refreshTaskData();
    };

    ensureProgress();
  }, [
    sessionsState,
    taskDefinitions,
    taskProgressState,
    tasksBySystem,
    supabase,
    refreshTaskData,
  ]);

  const handleSaveDemographics = async () => {
    if (!profileState || !ageRange || !gender) return;
    setSavingDemographics(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          age_range: ageRange,
          gender,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileState.id);

      if (error) {
        toast.error("Failed to save demographics", {
          description: error.message,
        });
        return;
      }

      const now = new Date().toISOString();
      const { data: upserted } = await supabase
        .from("task_sessions")
        .upsert(
          [
            {
              user_id: profileState.id,
              system_type: "chat_agent",
              status: "not_started",
              updated_at: now,
            },
            {
              user_id: profileState.id,
              system_type: "traditional",
              status: "not_started",
              updated_at: now,
            },
          ],
          { onConflict: "user_id,system_type" },
        )
        .select();

      setProfileState({ ...profileState, age_range: ageRange, gender });
      setSessionsState(upserted || []);
      toast.success("Demographics saved");
      await refreshTaskData();
    } finally {
      setSavingDemographics(false);
    }
  };

  const handleStartSurvey = async () => {
    if (!profileState) return;
    setStartingSurvey(true);
    try {
      const now = new Date().toISOString();
      await supabase
        .from("task_sessions")
        .upsert(
          [
            {
              user_id: profileState.id,
              system_type: "chat_agent",
              status: "in_progress",
              started_at: now,
              updated_at: now,
            },
            {
              user_id: profileState.id,
              system_type: "traditional",
              status: "in_progress",
              started_at: now,
              updated_at: now,
            },
          ],
          { onConflict: "user_id,system_type" },
        )
        .select();

      await refreshTaskData();
    } finally {
      setStartingSurvey(false);
    }
  };

  const handleOpenTask = async (
    task: TaskDefinitionRow,
    session: TaskSessionRow,
  ) => {
    const now = new Date().toISOString();
    if (sessionIds.length) {
      await supabase
        .from("task_progress")
        .update({ status: "not_started", updated_at: now })
        .in("session_id", sessionIds)
        .eq("status", "in_progress");
    }

    await supabase
      .from("task_progress")
      .update({ status: "in_progress", started_at: now, updated_at: now })
      .eq("session_id", session.id)
      .eq("task_definition_id", task.id);

    await refreshTaskData();
    const url = getTaskUrl(task.system_type, task.task_code);
    window.open(url, "_blank");
  };

  const handleResetTask = async (
    task: TaskDefinitionRow,
    session: TaskSessionRow,
  ) => {
    const now = new Date().toISOString();
    await supabase
      .from("task_progress")
      .delete()
      .eq("session_id", session.id)
      .eq("task_definition_id", task.id);

    await supabase
      .from("task_events")
      .delete()
      .eq("session_id", session.id)
      .eq("metadata->>task_code", task.task_code);

    await supabase
      .from("task_survey_responses")
      .delete()
      .eq("session_id", session.id);

    await supabase
      .from("task_sessions")
      .update({ status: "in_progress", completed_at: null, updated_at: now })
      .eq("id", session.id);

    await supabase
      .from("user_interview_responses")
      .delete()
      .eq("user_id", session.user_id);

    toast.success("Task reset");
    await refreshTaskData();
  };

  const chatSession = sessionsBySystem.get("chat_agent");
  const traditionalSession = sessionsBySystem.get("traditional");
  const chatTasksCompleted = (tasksBySystem.chat_agent || []).every(
    (task) => progressByTaskId.get(task.id)?.status === "completed",
  );
  const traditionalTasksCompleted = (tasksBySystem.traditional || []).every(
    (task) => progressByTaskId.get(task.id)?.status === "completed",
  );

  const chatSurveyAvailable = chatTasksCompleted && !!chatSession;
  const traditionalSurveyAvailable =
    traditionalTasksCompleted && !!traditionalSession;
  const chatSurveyCompleted = chatSession?.status === "completed";
  const traditionalSurveyCompleted = traditionalSession?.status === "completed";
  const interviewAvailable = chatSurveyCompleted && traditionalSurveyCompleted;

  if (requiresDemographics) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background p-6'>
        <Card className='w-full max-w-xl shadow-lg'>
          <CardHeader>
            <CardTitle>Survey Demographics</CardTitle>
            <CardDescription>
              Please complete the demographic questions to start the survey.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label>Age range</Label>
              <Select
                value={ageRange ?? undefined}
                onValueChange={(value) =>
                  setAgeRange(value as ProfileRow["age_range"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select your age range' />
                </SelectTrigger>
                <SelectContent>
                  {ageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value || ""}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>Gender identity</Label>
              <Select
                value={gender ?? undefined}
                onValueChange={(value) =>
                  setGender(value as ProfileRow["gender"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select your gender' />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value || ""}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className='w-full'
              disabled={!ageRange || !gender || savingDemographics}
              onClick={handleSaveDemographics}
            >
              {savingDemographics ? "Saving..." : "Save demographics"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='mx-auto flex w-full max-w-5xl flex-col gap-8'>
        <Card>
          <CardHeader>
            <CardTitle>Survey Instructions</CardTitle>
            <CardDescription>
              Complete each task using the assigned system. After finishing all
              tasks for a system, complete the survey for that system. You can
              complete only one task at a time.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3 text-sm text-muted-foreground'>
            <p>
              This research compares traditional university portals with a chat
              agent interface. Please follow the task prompts and answer the
              surveys honestly.
            </p>
            {sessionsState.every(
              (session) => session.status === "not_started",
            ) && (
              <Alert>
                <AlertDescription>
                  Click the start button to begin your survey session.
                </AlertDescription>
              </Alert>
            )}
            <Button
              disabled={startingSurvey}
              onClick={handleStartSurvey}
              className='w-full sm:w-fit'
            >
              {startingSurvey ? "Starting..." : "Start survey"}
            </Button>
          </CardContent>
        </Card>

        <div className='grid gap-6'>
          <TaskList
            systemType='chat_agent'
            session={chatSession}
            tasks={tasksBySystem.chat_agent || []}
            progressByTaskId={progressByTaskId}
            activeTaskId={activeTask?.task_definition_id}
            onOpenTask={handleOpenTask}
            onResetTask={handleResetTask}
          />
          <TaskList
            systemType='traditional'
            session={traditionalSession}
            tasks={tasksBySystem.traditional || []}
            progressByTaskId={progressByTaskId}
            activeTaskId={activeTask?.task_definition_id}
            onOpenTask={handleOpenTask}
            onResetTask={handleResetTask}
          />
        </div>

        <ChatAgentSurvey
          session={chatSession}
          surveys={surveys}
          surveyQuestions={surveyQuestions}
          surveyResponses={surveyResponsesState}
          enabled={chatSurveyAvailable}
          onSubmitted={refreshTaskData}
        />

        <TraditionalSurvey
          session={traditionalSession}
          surveys={surveys}
          surveyQuestions={surveyQuestions}
          surveyResponses={surveyResponsesState}
          enabled={traditionalSurveyAvailable}
          onSubmitted={refreshTaskData}
        />

        <InterviewForm
          interviewQuestions={interviewQuestions}
          interviewResponses={interviewResponsesState}
          enabled={interviewAvailable}
          onSubmitted={refreshTaskData}
        />
      </div>
    </div>
  );
}
