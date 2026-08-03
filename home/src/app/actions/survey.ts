"use server";

import { createClient } from "@/lib/supabase/server";
import type { ProfileRow, TaskSessionRow } from "@/lib/types";
import { CURRENT_STUDY_PROTOCOL_VERSION } from "@/utils/study-protocol";
import { revalidatePath } from "next/cache";

type SuccessResult<T> = { ok: true; data: T };
type ErrorResult = { ok: false; error: string };
export type ActionResult<T = void> = SuccessResult<T> | ErrorResult;

export async function saveDemographicsAction(
  userId: string,
  ageRange: ProfileRow["age_range"],
  gender: ProfileRow["gender"],
  technicalExperience: ProfileRow["technical_experience"],
  aiToolFrequency: ProfileRow["ai_tool_frequency"]
): Promise<ActionResult<TaskSessionRow>> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // 1. Update profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      age_range: ageRange,
      gender,
      technical_experience: technicalExperience,
      ai_tool_frequency: aiToolFrequency,
      updated_at: now,
    })
    .eq("id", userId);

  if (profileError) {
    console.error("Failed to update profile:", profileError);
    return {
      ok: false,
      error: "Failed to update your profile. Please try again.",
    };
  }

  // 2. Ensure traditional session exists (do not reset status on profile updates)
  const { data: existingSession, error: fetchSessionError } = await supabase
    .from("task_sessions")
    .select(
      "id, status, system_type, started_at, completed_at, user_id, created_at, updated_at",
    )
    .eq("user_id", userId)
    .eq("system_type", "traditional")
    .maybeSingle();

  if (fetchSessionError) {
    console.error("Failed to load session:", fetchSessionError);
    return {
      ok: false,
      error: "Failed to load your session. Please try again.",
    };
  }

  let session: TaskSessionRow;

  if (existingSession) {
    session = existingSession;
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from("task_sessions")
      .insert({
        user_id: userId,
        system_type: "traditional",
        status: "not_started",
        updated_at: now,
      })
      .select(
        "id, status, system_type, started_at, completed_at, user_id, created_at, updated_at",
      )
      .single();

    if (insertError || !inserted) {
      console.error("Failed to create session:", insertError);
      return {
        ok: false,
        error: "Failed to create your session. Please try again.",
      };
    }

    session = inserted;
  }

  revalidatePath("/survey");
  return { ok: true, data: session };
}

export async function startSurveyAction(userId: string): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Start only traditional session first
  const { error } = await supabase
    .from("task_sessions")
    .upsert(
      [
        {
          user_id: userId,
          system_type: "traditional",
          status: "in_progress",
          started_at: now,
          updated_at: now,
        },
      ],
      { onConflict: "user_id,system_type" }
    )
    .select()
    .single();

  if (error) {
    console.error("Failed to start survey:", error);
    return {
      ok: false,
      error: "Failed to start survey. Please try again.",
    };
  }

  // Assign task set if not assigned
  const { data: existingAssignment } = await supabase
    .from("task_user_assignments")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!existingAssignment) {
    const { data: sets } = await supabase.from("task_assignment_sets").select("id");
    if (sets && sets.length > 0) {
      // Get assignment counts for balancing
      const { data: counts } = await supabase
        .from("task_user_assignments")
        .select("assignment_set_id");
        
      // Count frequency of each set
      const freq = new Map<string, number>();
      sets.forEach(s => freq.set(s.id, 0));
      (counts || []).forEach(c => {
        if (freq.has(c.assignment_set_id)) {
          freq.set(c.assignment_set_id, freq.get(c.assignment_set_id)! + 1);
        }
      });
      
      // Find the sets with minimum count
      const minCount = Math.min(...Array.from(freq.values()));
      const candidates = sets.filter(s => freq.get(s.id) === minCount);
      
      // Pick a random set among those with min count
      const pickedSet = candidates[Math.floor(Math.random() * candidates.length)];
      
      await supabase.from("task_user_assignments").insert({
        user_id: userId,
        assignment_set_id: pickedSet.id,
      });
    }
  }

  revalidatePath("/survey");
  return { ok: true, data: undefined };
}

export async function openTaskAction(
  sessionId: string,
  taskDefinitionId: string,
  allSessionIds: string[]
): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // 0. Check if task is already completed
  const { data: existingProgress } = await supabase
    .from("task_progress")
    .select("status")
    .eq("session_id", sessionId)
    .eq("task_definition_id", taskDefinitionId)
    .eq("protocol_version", CURRENT_STUDY_PROTOCOL_VERSION)
    .maybeSingle();

  if (existingProgress?.status === "in_progress") {
    // Task is already open and in progress; no need to update status again.
    // Let the client handle redirecting the user to the task.
    return { ok: true, data: undefined };
  }

  if (
    existingProgress?.status === "completed"
  ) {
    return {
      ok: false,
      error: "Task is already completed.",
    };
  }

  // 1. Reset other in_progress tasks to not_started
  if (allSessionIds.length > 0) {
    const { error: resetError } = await supabase
      .from("task_progress")
      .update({ status: "not_started", updated_at: now })
      .in("session_id", allSessionIds)
      .eq("protocol_version", CURRENT_STUDY_PROTOCOL_VERSION)
      .eq("status", "in_progress");

    if (resetError) {
      console.error("Failed to reset other tasks:", resetError);
      // We continue anyway as this is cleanup
    }
  }

  // 2. Set current task to in_progress
  const { error: updateError } = await supabase
    .from("task_progress")
    .update({ status: "in_progress", started_at: now, updated_at: now })
    .eq("session_id", sessionId)
    .eq("task_definition_id", taskDefinitionId)
    .eq("protocol_version", CURRENT_STUDY_PROTOCOL_VERSION);

  if (updateError) {
    console.error("Failed to open task:", updateError);
    return {
      ok: false,
      error: "Failed to open task. Please try again.",
    };
  }

  revalidatePath("/survey");
  return { ok: true, data: undefined };
}

export async function resetTaskAction(
  sessionId: string,
  taskDefinitionId: string,
  taskCode: string,
  userId: string
): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // 0. Check if task is completed
  const { data: progress, error: fetchError } = await supabase
    .from("task_progress")
    .select("status")
    .eq("session_id", sessionId)
    .eq("task_definition_id", taskDefinitionId)
    .eq("protocol_version", CURRENT_STUDY_PROTOCOL_VERSION)
    .maybeSingle();

  if (fetchError) {
    console.error("Failed to fetch task progress:", fetchError);
  }

  if (progress?.status === "completed") {
    return {
      ok: false,
      error: "Cannot reset a completed task.",
    };
  }

  // 1. Delete progress
  const { error: progressError } = await supabase
    .from("task_progress")
    .delete()
    .eq("session_id", sessionId)
    .eq("task_definition_id", taskDefinitionId)
    .eq("protocol_version", CURRENT_STUDY_PROTOCOL_VERSION);

  if (progressError) {
    console.error("Failed to delete progress:", progressError);
    return {
      ok: false,
      error: "Failed to reset task progress. Please try again.",
    };
  }

  // 2. Delete events
  const { error: eventsError } = await supabase
    .from("task_events")
    .delete()
    .eq("session_id", sessionId)
    .eq("metadata->>task_code", taskCode);

  if (eventsError) {
    console.error("Failed to delete events:", eventsError);
    return {
      ok: false,
      error: "Failed to clear task events. Please try again.",
    };
  }

  // 3. Delete survey responses
  const { error: surveyError } = await supabase
    .from("task_survey_responses")
    .delete()
    .eq("session_id", sessionId)
    .eq("protocol_version", CURRENT_STUDY_PROTOCOL_VERSION);

  if (surveyError) {
    console.error("Failed to delete survey responses:", surveyError);
    return {
      ok: false,
      error: "Failed to clear survey responses. Please try again.",
    };
  }

  // 4. Update session status
  const { error: sessionError } = await supabase
    .from("task_sessions")
    .update({ status: "in_progress", completed_at: null, updated_at: now })
    .eq("id", sessionId);

  if (sessionError) {
    console.error("Failed to update session:", sessionError);
    return {
      ok: false,
      error: "Failed to update session status. Please try again.",
    };
  }

  // 5. Delete interview responses
  const { error: interviewError } = await supabase
    .from("task_interview_responses")
    .delete()
    .eq("user_id", userId)
    .eq("protocol_version", CURRENT_STUDY_PROTOCOL_VERSION);

  if (interviewError) {
    console.error("Failed to delete interview responses:", interviewError);
    return {
      ok: false,
      error: "Failed to clear interview responses. Please try again.",
    };
  }

  revalidatePath("/survey");
  return { ok: true, data: undefined };
}

export async function dismissCriteriaMigrationNoticeAction(
  userId: string
): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("profiles")
    .update({
      criteria_migration_notice_dismissed_at: now,
      updated_at: now,
    })
    .eq("id", userId);

  if (error) {
    console.error("Failed to dismiss migration notice:", error);
    return {
      ok: false,
      error: "Failed to save your preference. Please try again.",
    };
  }

  revalidatePath("/survey");
  return { ok: true, data: undefined };
}

export async function ensureProgressAction(
  items: {
    session_id: string;
    task_definition_id: string;
    status: "not_started" | "in_progress" | "completed";
  }[]
): Promise<ActionResult<void>> {
  if (items.length === 0) {
    return { ok: true, data: undefined };
  }

  const supabase = await createClient();
  const rows = items.map((item) => ({
    ...item,
    protocol_version: CURRENT_STUDY_PROTOCOL_VERSION,
  }));
  const { error } = await supabase
    .from("task_progress")
    .upsert(rows, {
      onConflict: "session_id,task_definition_id,protocol_version",
      ignoreDuplicates: true,
    });

  if (error) {
    console.error("Failed to ensure progress:", error);
    return {
      ok: false,
      error: "Failed to ensure task progress. Please try again.",
    };
  }

  revalidatePath("/survey");
  return { ok: true, data: undefined };
}
