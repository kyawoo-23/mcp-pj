import { createClient } from "@/lib/supabase/client";
import type { Json, SystemType, TaskEventType } from "@/lib/types";

export const TASK_MODE_STORAGE_KEY = "task_mode_session";

export type StoredTaskSession = {
  id: string;
  systemType: SystemType;
};

export const readStoredTaskSession = (): StoredTaskSession | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TASK_MODE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredTaskSession;
  } catch {
    return null;
  }
};

export const writeStoredTaskSession = (session: StoredTaskSession) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TASK_MODE_STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredTaskSession = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TASK_MODE_STORAGE_KEY);
};

export async function logTaskEvent(
  sessionId: string,
  eventType: TaskEventType,
  eventName: string,
  metadata: Json = {}
) {
  const supabase = createClient();
  await supabase.from("task_events").insert({
    session_id: sessionId,
    event_type: eventType,
    event_name: eventName,
    metadata,
  });
}

export async function markTaskInProgress(
  sessionId: string,
  taskDefinitionId: string
) {
  const supabase = createClient();
  const now = new Date().toISOString();
  await supabase
    .from("task_progress")
    .update({ status: "in_progress", started_at: now, updated_at: now })
    .eq("session_id", sessionId)
    .eq("task_definition_id", taskDefinitionId);
}
