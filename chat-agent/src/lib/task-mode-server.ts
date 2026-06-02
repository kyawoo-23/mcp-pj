import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Json } from "../../../supabase/types/database.types";
import { CURRENT_STUDY_PROTOCOL_VERSION } from "@/lib/study-protocol";

type SystemType = Database["public"]["Enums"]["system_type"];
type TaskEventType = Database["public"]["Enums"]["task_event_type"];
type TaskProgressStatus = Database["public"]["Enums"]["task_progress_status"];

export async function getTaskSessionByUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  systemType: SystemType
) {
  const { data } = await supabase
    .from("task_sessions")
    .select("id, status, started_at, completed_at")
    .eq("user_id", userId)
    .eq("system_type", systemType)
    .maybeSingle();

  return data ?? null;
}

export async function recordTaskEvent(
  supabase: SupabaseClient<Database>,
  sessionId: string,
  eventType: TaskEventType,
  eventName: string,
  metadata: Json = {}
) {
  await supabase.from("task_events").insert({
    session_id: sessionId,
    event_type: eventType,
    event_name: eventName,
    metadata,
  });
}

export async function recordTaskCompletion(
  supabase: SupabaseClient<Database>,
  {
    userId,
    systemType,
    taskCode,
    successPayload = {},
  }: {
    userId: string;
    systemType: SystemType;
    taskCode: string;
    successPayload?: Json;
  }
) {
  const session = await getTaskSessionByUser(supabase, userId, systemType);
  if (!session) {
    return { skipped: true, reason: "no_session" };
  }

  const { data: taskDefinition } = await supabase
    .from("task_definitions")
    .select("id")
    .eq("system_type", systemType)
    .eq("task_code", taskCode)
    .single();

  if (!taskDefinition) {
    return { skipped: true, reason: "no_task_definition" };
  }

  // Query existing task_progress to check current status
  const { data: existingProgress } = await supabase
    .from("task_progress")
    .select("status, started_at")
    .eq("session_id", session.id)
    .eq("task_definition_id", taskDefinition.id)
    .eq("protocol_version", CURRENT_STUDY_PROTOCOL_VERSION)
    .maybeSingle();

  // Only mark as completed if task is currently in progress
  if (existingProgress?.status !== "in_progress") {
    return {
      skipped: true,
      reason:
        existingProgress?.status === "completed"
          ? "already_completed"
          : "not_in_progress",
    };
  }

  const now = new Date().toISOString();
  const nextStatus: TaskProgressStatus = "completed";

  // Use UPDATE (not upsert) so Supabase Realtime emits a clear UPDATE event.
  await supabase
    .from("task_progress")
    .update({
      status: nextStatus,
      started_at: existingProgress?.started_at ?? session.started_at ?? now,
      completed_at: now,
      success_payload: successPayload,
      updated_at: now,
    })
    .eq("session_id", session.id)
    .eq("task_definition_id", taskDefinition.id)
    .eq("protocol_version", CURRENT_STUDY_PROTOCOL_VERSION);

  await recordTaskEvent(supabase, session.id, "system", "task_completed", {
    task_code: taskCode,
    ...((successPayload || {}) as Record<string, Json>),
  });

  if (session.status === "not_started") {
    await supabase
      .from("task_sessions")
      .update({ status: "in_progress", started_at: now, updated_at: now })
      .eq("id", session.id);
  }

  return { skipped: false };
}
