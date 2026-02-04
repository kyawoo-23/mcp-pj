"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getSurveyUrl } from "@/lib/constants";
import Link from "next/link";

const taskLabels: Record<string, string> = {
  register_course: "Register for a course",
  drop_course: "Drop a course",
  book_room: "Book a room",
  cancel_booking: "Cancel a booking",
};

export function TaskIndicator() {
  const supabase = createClient();
  const [activeTask, setActiveTask] = useState<{
    taskCode: string;
    title: string;
    sessionId: string;
    progressId: string;
    status: "in_progress" | "completed";
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  const refreshActiveTask = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setActiveTask(null);
      setLoading(false);
      return;
    }

    const { data: sessions } = await supabase
      .from("task_sessions")
      .select("id, system_type")
      .eq("user_id", user.id)
      .eq("system_type", "traditional");

    const sessionIds = (sessions || []).map((session) => session.id);
    if (!sessionIds.length) {
      setActiveTask(null);
      setLoading(false);
      return;
    }

    const { data: progress } = await supabase
      .from("task_progress")
      .select("id, task_definition_id, session_id, status, updated_at")
      .in("session_id", sessionIds)
      .in("status", ["in_progress", "completed"])
      .order("updated_at", { ascending: false })
      .limit(1);

    const current = progress?.[0];
    if (!current) {
      setActiveTask(null);
      setLoading(false);
      return;
    }

    // If task is completed and older than 1 minute, don't show it
    if (current.status === "completed") {
      const updatedAt = new Date(current.updated_at).getTime();
      const now = Date.now();
      if (now - updatedAt > 60 * 1000) {
        setActiveTask(null);
        setLoading(false);
        return;
      }
    }

    const { data: definition } = await supabase
      .from("task_definitions")
      .select("task_code, title")
      .eq("id", current.task_definition_id)
      .maybeSingle();

    setActiveTask({
      taskCode: definition?.task_code ?? "unknown",
      title:
        definition?.title ?? taskLabels[definition?.task_code ?? ""] ?? "Task",
      sessionId: current.session_id,
      progressId: current.id,
      status: current.status as "in_progress" | "completed",
    });
    setLoading(false);
    setIsVisible(true);
  }, [supabase]);

  useEffect(() => {
    (async () => {
      await refreshActiveTask();
    })();

    // Listen for auth state changes to refresh task
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refreshActiveTask();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshActiveTask, supabase]);

  // Realtime subscription for immediate updates
  useEffect(() => {
    if (!activeTask?.progressId) return;

    const channel = supabase
      .channel(`task_progress:${activeTask.progressId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "task_progress",
          filter: `id=eq.${activeTask.progressId}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          if (newStatus === "completed" && activeTask.status !== "completed") {
            setActiveTask({
              ...activeTask,
              status: "completed",
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTask?.progressId, activeTask?.status, supabase, activeTask]);

  const surveyLink = useMemo(() => getSurveyUrl(), []);

  if (loading || !activeTask || !isVisible) return null;

  const isCompleted = activeTask.status === "completed";

  return (
    <div className='fixed top-20 right-4 z-50 w-72'>
      <Card
        className={`shadow-md transition-all duration-500 ${isCompleted ? "border-green-500 ring-1 ring-green-500" : ""}`}
      >
        <CardContent className='space-y-3 p-4'>
          <div className='flex items-center justify-between'>
            <div className='text-sm font-semibold'>
              {isCompleted ? "Task Completed" : "Task in progress"}
            </div>
            <Badge variant={isCompleted ? "success" : "warning"}>
              {isCompleted ? "Completed" : "Active"}
            </Badge>
          </div>
          <div className='text-sm'>{activeTask.title}</div>
          <div className='flex flex-col gap-2'>
            <Button variant='outline' size='sm' asChild>
              <Link href={surveyLink}>Return to survey</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
