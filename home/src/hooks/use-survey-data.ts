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
import {
  ensureProgressAction,
  openTaskAction,
  resetTaskAction,
  saveDemographicsAction,
  startSurveyAction,
} from "@/app/actions/survey";

interface UseSurveyDataProps {
  profile: Pick<ProfileRow, "id" | "age_range" | "gender" | "technical_proficiency" | "ai_tool_frequency"> | null;
  sessions: TaskSessionRow[];
  taskDefinitions: TaskDefinitionRow[];
  taskProgress: TaskProgressRow[];
  surveyResponses: SurveyResponseRow[];
  interviewQuestions: InterviewQuestionRow[];
  interviewResponses: UserInterviewResponseRow[];
  assignment?: any;
}

export function useSurveyData({
  profile,
  sessions,
  taskDefinitions,
  taskProgress,
  surveyResponses,
  interviewQuestions,
  interviewResponses,
  assignment,
}: UseSurveyDataProps) {
  const supabase = useMemo(() => createClient(), []);

  // State
  const [profileState, setProfileState] = useState(profile);
  const [sessionsState, setSessionsState] = useState(sessions);
  const [taskProgressState, setTaskProgressState] = useState(taskProgress);
  const [surveyResponsesState, setSurveyResponsesState] = useState(surveyResponses);
  const [interviewResponsesState, setInterviewResponsesState] = useState(interviewResponses);
  const [assignmentState, setAssignmentState] = useState(assignment);
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

  const requiresDemographics = !profileState?.age_range || !profileState?.gender || !profileState?.technical_proficiency || !profileState?.ai_tool_frequency;

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
      const [progressResult, surveyResponseResult, interviewResponseResult, assignmentResult] = await Promise.all([
        supabase
          .from("task_progress")
          .select("id, task_definition_id, status, started_at, completed_at, created_at, session_id, success_payload, updated_at")
          .in("session_id", latestSessionIds),
        supabase
          .from("task_survey_responses")
          .select("id, question_id, response_value, response_text, session_id, created_at")
          .in("session_id", latestSessionIds),
        supabase
          .from("task_interview_responses")
          .select("id, question_id, response_text, user_id, created_at")
          .eq("user_id", user.id),
        supabase
          .from("task_user_assignments")
          .select(`
            id,
            task_assignment_sets (
              id,
              set_label,
              targets
            )
          `)
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      setTaskProgressState(progressResult.data || []);
      setSurveyResponsesState(surveyResponseResult.data || []);
      setInterviewResponsesState(interviewResponseResult.data || []);
      if (assignmentResult.data) {
        setAssignmentState(assignmentResult.data);
      }
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

      try {
        const result = await ensureProgressAction(missing);
        if (!result.ok) {
          console.error("Failed to ensure progress:", result.error);
          return;
        }
        await refreshTaskData();
      } catch (error) {
        console.error("Failed to ensure progress:", error);
      }
    };

    ensureProgress();
  }, [sessionsState, taskDefinitions, taskProgressState, tasksBySystem, refreshTaskData]);

  // Actions
  const saveDemographics = async (
    ageRange: ProfileRow["age_range"],
    gender: ProfileRow["gender"],
    technicalProficiency: ProfileRow["technical_proficiency"],
    aiToolFrequency: ProfileRow["ai_tool_frequency"]
  ) => {
    if (!profileState || !ageRange || !gender || !technicalProficiency || !aiToolFrequency) return;
    setSavingDemographics(true);
    try {
      const result = await saveDemographicsAction(
        profileState.id,
        ageRange,
        gender,
        technicalProficiency,
        aiToolFrequency,
      );

      if (!result.ok) {
        toast.error("Failed to save demographics", { description: result.error });
        return;
      }

      const upserted = result.data;

      setProfileState({
        ...profileState,
        age_range: ageRange,
        gender,
        technical_proficiency: technicalProficiency,
        ai_tool_frequency: aiToolFrequency,
      });
      setSessionsState([upserted]); // Since we return single upserted
      toast.success("Demographics saved");
      await refreshTaskData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to save demographics", { description: message });
    } finally {
      setSavingDemographics(false);
    }
  };

  const startSurvey = async () => {
    if (!profileState) return;
    setStartingSurvey(true);
    try {
      const result = await startSurveyAction(profileState.id);

      if (!result.ok) {
        toast.error("Failed to start survey", { description: result.error });
        return false;
      }

      await refreshTaskData();
      return true;
    } catch (error) {
      console.error("Unexpected error while starting survey:", error);
      toast.error("Failed to start survey", {
        description: "An unexpected error occurred. Please try again.",
      });
      return false;
    } finally {
      setStartingSurvey(false);
    }
  };

  const openTask = async (task: TaskDefinitionRow, session: TaskSessionRow) => {
    try {
      const result = await openTaskAction(session.id, task.id, sessionIds);

      if (!result.ok) {
        toast.error("Failed to open task", { description: result.error });
        return;
      }

      await refreshTaskData();
      const url = getTaskUrl(task.system_type, task.task_code);

      if (typeof window !== "undefined") {
        const isLargerThanMedium = window.innerWidth > 768;

        if (isLargerThanMedium) {
          window.open(url, "_blank");
        } else {
          window.location.href = url;
        }
      }
    } catch (error) {
      console.error("Unexpected error while opening task:", error);
      toast.error("Failed to open task", {
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  const resetTask = async (task: TaskDefinitionRow, session: TaskSessionRow) => {
    try {
      const result = await resetTaskAction(
        session.id,
        task.id,
        task.task_code,
        session.user_id,
      );

      if (!result.ok) {
        toast.error("Failed to reset task", { description: result.error });
        return;
      }

      toast.success("Task reset");
      await refreshTaskData();
    } catch (error) {
      console.error("Unexpected error while resetting task:", error);
      toast.error("Failed to reset task", {
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  return {
    // State
    profileState,
    surveyResponsesState,
    interviewResponsesState,
    assignmentState,
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
