import { createClient } from "@/lib/supabase/server";
import type { SystemType, TaskProgressRow, TaskSessionRow } from "@/lib/types";

export async function getTaskSessionsByUser(userId: string) {
  const supabase = await createClient();
  return supabase
    .from("task_sessions")
    .select("id, status, system_type, started_at, completed_at, user_id")
    .eq("user_id", userId)
    .in("system_type", ["chat_agent", "traditional"]);
}

export async function upsertTaskSessions(userId: string) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  return supabase
    .from("task_sessions")
    .upsert(
      [
        {
          user_id: userId,
          system_type: "chat_agent",
          status: "not_started",
          updated_at: now,
        },
        {
          user_id: userId,
          system_type: "traditional",
          status: "not_started",
          updated_at: now,
        },
      ],
      { onConflict: "user_id,system_type" }
    )
    .select();
}

export async function markSessionsInProgress(userId: string) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  return supabase
    .from("task_sessions")
    .upsert(
      [
        {
          user_id: userId,
          system_type: "chat_agent",
          status: "in_progress",
          started_at: now,
          updated_at: now,
        },
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
    .select();
}

export async function getTaskProgressBySessions(sessionIds: string[]) {
  const supabase = await createClient();
  return supabase
    .from("task_progress")
    .select(
      "id, task_definition_id, status, started_at, completed_at, created_at, session_id, success_payload, updated_at"
    )
    .in("session_id", sessionIds);
}

export async function getTaskDefinitionsBySystem(systemType: SystemType) {
  const supabase = await createClient();
  return supabase
    .from("task_definitions")
    .select("id, task_code, title, description, success_criteria, created_at, system_type")
    .eq("system_type", systemType)
    .order("task_code", { ascending: true });
}

export function areAllTasksCompleted(
  definitions: Array<{ id: string }>,
  progress: TaskProgressRow[]
) {
  const progressMap = new Map(progress.map((row) => [row.task_definition_id, row]));
  return definitions.every((definition) => {
    return progressMap.get(definition.id)?.status === "completed";
  });
}

export function canSubmitSurvey(
  session: TaskSessionRow | null,
  definitions: Array<{ id: string }>,
  progress: TaskProgressRow[]
) {
  if (!session) return false;
  return areAllTasksCompleted(definitions, progress);
}

export function canSubmitInterview(
  chatSession: TaskSessionRow | null,
  traditionalSession: TaskSessionRow | null
) {
  return chatSession?.status === "completed" && traditionalSession?.status === "completed";
}
