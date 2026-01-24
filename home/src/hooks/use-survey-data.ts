"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  InterviewQuestionRow,
  ProfileRow,
  SurveyResponseRow,
  TaskDefinitionRow,
  TaskProgressRow,
  TaskSessionRow,
  UserInterviewResponseRow,
} from "@/lib/types";
import { toast } from "sonner";
import { TASK_ORDER, getTaskUrl } from "../utils/constants";

interface UseSurveyDataProps {
  profile: Pick<ProfileRow, "id" | "age_range" | "gender"> | null;
  sessions: TaskSessionRow[];
  taskDefinitions: TaskDefinitionRow[];
  taskProgress: TaskProgressRow[];
  surveyResponses: SurveyResponseRow[];
  interviewQuestions: InterviewQuestionRow[];
  interviewResponses: UserInterviewResponseRow[];
}

export function useSurveyData({
  profile,
  sessions,
  taskDefinitions,
  taskProgress,
  surveyResponses,
  interviewQuestions,
  interviewResponses,
}: UseSurveyDataProps) {
  const supabase = useMemo(() => createClient(), []);

  // State
  const [profileState, setProfileState] = useState(profile);
  const [sessionsState, setSessionsState] = useState(sessions);
  const [taskProgressState, setTaskProgressState] = useState(taskProgress);
  const [surveyResponsesState, setSurveyResponsesState] = useState(surveyResponses);
  const [interviewResponsesState, setInterviewResponsesState] = useState(interviewResponses);
  const [savingDemographics, setSavingDemographics] = useState(false);
  const [startingSurvey, setStartingSurvey] = useState(false);

  // Derived data
  const sessionsBySystem = useMemo(
    () => new Map(sessionsState.map((session) => [session.system_type, session])),
    [sessionsState],
  );

  const progressByTaskId = useMemo(() => {
    const map = new Map<string, TaskProgressRow>();
    taskProgressState.forEach((row) => map.set(row.task_definition_id, row));
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
      list.sort((a, b) => (TASK_ORDER[a.task_code] ?? 999) - (TASK_ORDER[b.task_code] ?? 999)),
    );
    return grouped;
  }, [taskDefinitions]);

  const activeTask = useMemo(
    () => taskProgressState.find((row) => row.status === "in_progress"),
    [taskProgressState],
  );

  const sessionIds = useMemo(
    () => sessionsState.map((session) => session.id),
    [sessionsState],
  );

  // Sessions by system type
  const chatSession = sessionsBySystem.get("chat_agent");
  const traditionalSession = sessionsBySystem.get("traditional");

  // Completion status
  const chatTasksCompleted = (tasksBySystem.chat_agent || []).every(
    (task) => progressByTaskId.get(task.id)?.status === "completed",
  );
  const traditionalTasksCompleted = (tasksBySystem.traditional || []).every(
    (task) => progressByTaskId.get(task.id)?.status === "completed",
  );
  const chatSurveyCompleted = chatSession?.status === "completed";
  const traditionalSurveyCompleted = traditionalSession?.status === "completed";
  const interviewCompleted = interviewResponsesState.length >= interviewQuestions.length;

  // Availability status
  const chatSurveyAvailable = chatTasksCompleted && !!chatSession;
  const traditionalSurveyAvailable = traditionalTasksCompleted && !!traditionalSession;
  const interviewAvailable = chatSurveyCompleted && traditionalSurveyCompleted;

  // Locking status - Traditional first, then Chat
  const isStarted = sessionsState.some((s) => s.status !== "not_started");
  const isTraditionalTasksLocked = !isStarted;
  const isTraditionalSurveyLocked = !traditionalSurveyAvailable;
  const isChatTasksLocked = !traditionalSurveyCompleted; // Chat unlocks after traditional survey
  const isChatSurveyLocked = !chatSurveyAvailable;
  const isInterviewLocked = !interviewAvailable;

  const requiresDemographics = !profileState?.age_range || !profileState?.gender;

  // Refresh data
  const refreshTaskData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const sessionsResult = await supabase
      .from("task_sessions")
      .select("id, status, system_type, started_at, completed_at, user_id, created_at, updated_at")
      .eq("user_id", user.id)
      .in("system_type", ["chat_agent", "traditional"]);

    const latestSessions = sessionsResult.data || [];
    setSessionsState(latestSessions);

    const latestSessionIds = latestSessions.map((session) => session.id);
    if (latestSessionIds.length) {
      const [progressResult, surveyResponseResult, interviewResponseResult] = await Promise.all([
        supabase
          .from("task_progress")
          .select("id, task_definition_id, status, started_at, completed_at, created_at, session_id, success_payload, updated_at")
          .in("session_id", latestSessionIds),
        supabase
          .from("task_survey_responses")
          .select("id, question_id, response_value, response_text, session_id, created_at")
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

  // Ensure progress rows exist
  useEffect(() => {
    const ensureProgress = async () => {
      if (!sessionsState.length || !taskDefinitions.length) return;

      const existing = new Set(
        taskProgressState.map((row) => `${row.session_id}:${row.task_definition_id}`),
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
  }, [sessionsState, taskDefinitions, taskProgressState, tasksBySystem, supabase, refreshTaskData]);

  // Actions
  const saveDemographics = async (ageRange: ProfileRow["age_range"], gender: ProfileRow["gender"]) => {
    if (!profileState || !ageRange || !gender) return;
    setSavingDemographics(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ age_range: ageRange, gender, updated_at: new Date().toISOString() })
        .eq("id", profileState.id);

      if (error) {
        toast.error("Failed to save demographics", { description: error.message });
        return;
      }

      const now = new Date().toISOString();
      const { data: upserted } = await supabase
        .from("task_sessions")
        .upsert(
          [
            { user_id: profileState.id, system_type: "chat_agent", status: "not_started", updated_at: now },
            { user_id: profileState.id, system_type: "traditional", status: "not_started", updated_at: now },
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

  const startSurvey = async () => {
    if (!profileState) return;
    setStartingSurvey(true);
    try {
      const now = new Date().toISOString();
      // Start only traditional session first; chat session stays not_started
      await supabase
        .from("task_sessions")
        .upsert(
          [
            { user_id: profileState.id, system_type: "traditional", status: "in_progress", started_at: now, updated_at: now },
          ],
          { onConflict: "user_id,system_type" },
        )
        .select();

      await refreshTaskData();
      return true;
    } finally {
      setStartingSurvey(false);
    }
  };

  const openTask = async (task: TaskDefinitionRow, session: TaskSessionRow) => {
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

  const resetTask = async (task: TaskDefinitionRow, session: TaskSessionRow) => {
    const now = new Date().toISOString();
    await supabase.from("task_progress").delete().eq("session_id", session.id).eq("task_definition_id", task.id);
    await supabase.from("task_events").delete().eq("session_id", session.id).eq("metadata->>task_code", task.task_code);
    await supabase.from("task_survey_responses").delete().eq("session_id", session.id);
    await supabase.from("task_sessions").update({ status: "in_progress", completed_at: null, updated_at: now }).eq("id", session.id);
    await supabase.from("user_interview_responses").delete().eq("user_id", session.user_id);

    toast.success("Task reset");
    await refreshTaskData();
  };

  return {
    // State
    profileState,
    surveyResponsesState,
    interviewResponsesState,
    savingDemographics,
    startingSurvey,
    requiresDemographics,

    // Derived data
    tasksBySystem,
    progressByTaskId,
    activeTask,
    chatSession,
    traditionalSession,

    // Completion status
    chatTasksCompleted,
    traditionalTasksCompleted,
    chatSurveyCompleted,
    traditionalSurveyCompleted,
    interviewCompleted,

    // Availability status
    chatSurveyAvailable,
    traditionalSurveyAvailable,
    interviewAvailable,

    // Locking status
    isStarted,
    isChatTasksLocked,
    isChatSurveyLocked,
    isTraditionalTasksLocked,
    isTraditionalSurveyLocked,
    isInterviewLocked,

    // Actions
    saveDemographics,
    startSurvey,
    openTask,
    resetTask,
    refreshTaskData,
  };
}
