"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  Json,
  SystemType,
  TaskEventType,
  TaskProgressStatus,
} from "@/lib/types";

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

  const now = new Date().toISOString();
  const nextStatus: TaskProgressStatus = "completed";

  await supabase.from("task_progress").upsert(
    {
      session_id: session.id,
      task_definition_id: taskDefinition.id,
      status: nextStatus,
      started_at: session.started_at ?? now,
      completed_at: now,
      success_payload: successPayload,
      updated_at: now,
    },
    { onConflict: "session_id,task_definition_id" }
  );

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
