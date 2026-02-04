"use server";

import { createClient } from "@/lib/supabase/server";
import { ProfileRow } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function saveDemographicsAction(
  userId: string,
  ageRange: ProfileRow["age_range"],
  gender: ProfileRow["gender"],
  technicalProficiency: ProfileRow["technical_proficiency"],
  aiToolFrequency: ProfileRow["ai_tool_frequency"]
) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // 1. Update profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      age_range: ageRange,
      gender,
      technical_proficiency: technicalProficiency,
      ai_tool_frequency: aiToolFrequency,
      updated_at: now,
    })
    .eq("id", userId);

  if (profileError) {
    throw new Error(`Failed to update profile: ${profileError.message}`);
  }

  // 2. Upsert task session (init traditional session)
  const { data: upserted, error: sessionError } = await supabase
    .from("task_sessions")
    .upsert(
      [
        {
          user_id: userId,
          system_type: "traditional",
          status: "not_started",
          updated_at: now,
        },
      ],
      { onConflict: "user_id,system_type" }
    )
    .select()
    .single();

  if (sessionError) {
    throw new Error(`Failed to create session: ${sessionError.message}`);
  }

  revalidatePath("/survey");
  return upserted;
}

export async function startSurveyAction(userId: string) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Start only traditional session first
  const { data: session, error } = await supabase
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
    throw new Error(`Failed to start survey: ${error.message}`);
  }

  revalidatePath("/survey");
  return session;
}

export async function openTaskAction(
  sessionId: string,
  taskDefinitionId: string,
  allSessionIds: string[]
) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // 0. Check if task is already in_progress or completed
  const { data: existingProgress } = await supabase
    .from("task_progress")
    .select("status")
    .eq("session_id", sessionId)
    .eq("task_definition_id", taskDefinitionId)
    .single();

  if (existingProgress?.status === "in_progress" || existingProgress?.status === "completed") {
    throw new Error("Task is already opened or completed.");
  }

  // 1. Reset other in_progress tasks to not_started
  if (allSessionIds.length > 0) {
    const { error: resetError } = await supabase
      .from("task_progress")
      .update({ status: "not_started", updated_at: now })
      .in("session_id", allSessionIds)
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
    .eq("task_definition_id", taskDefinitionId);

  if (updateError) {
    throw new Error(`Failed to open task: ${updateError.message}`);
  }

  revalidatePath("/survey");
}

export async function resetTaskAction(
  sessionId: string,
  taskDefinitionId: string,
  taskCode: string,
  userId: string
) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // 0. Check if task is completed
  const { data: progress, error: fetchError } = await supabase
    .from("task_progress")
    .select("status")
    .eq("session_id", sessionId)
    .eq("task_definition_id", taskDefinitionId)
    .single();

  if (fetchError) {
    console.error("Failed to fetch task progress:", fetchError);
  }

  if (progress?.status === "completed") {
    throw new Error("Cannot reset a completed task.");
  }

  // 1. Delete progress
  const { error: progressError } = await supabase
    .from("task_progress")
    .delete()
    .eq("session_id", sessionId)
    .eq("task_definition_id", taskDefinitionId);

  if (progressError) throw new Error(`Failed to delete progress: ${progressError.message}`);

  // 2. Delete events
  const { error: eventsError } = await supabase
    .from("task_events")
    .delete()
    .eq("session_id", sessionId)
    .eq("metadata->>task_code", taskCode);
  
  if (eventsError) throw new Error(`Failed to delete events: ${eventsError.message}`);

  // 3. Delete survey responses
  const { error: surveyError } = await supabase
    .from("task_survey_responses")
    .delete()
    .eq("session_id", sessionId);

  if (surveyError) throw new Error(`Failed to delete survey responses: ${surveyError.message}`);

  // 4. Update session status
  const { error: sessionError } = await supabase
    .from("task_sessions")
    .update({ status: "in_progress", completed_at: null, updated_at: now })
    .eq("id", sessionId);

  if (sessionError) throw new Error(`Failed to update session: ${sessionError.message}`);

  // 5. Delete interview responses
  const { error: interviewError } = await supabase
    .from("task_interview_responses")
    .delete()
    .eq("user_id", userId);

  if (interviewError) throw new Error(`Failed to delete interview responses: ${interviewError.message}`);

  revalidatePath("/survey");
}

export async function ensureProgressAction(
  items: { 
    session_id: string; 
    task_definition_id: string; 
    status: "not_started" | "in_progress" | "completed";
  }[]
) {
  if (items.length === 0) return;
  
  const supabase = await createClient();
  const { error } = await supabase.from("task_progress").insert(items);

  if (error) {
    throw new Error(`Failed to ensure progress: ${error.message}`);
  }

  revalidatePath("/survey");
}
