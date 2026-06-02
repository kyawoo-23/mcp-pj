"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { getSurveyUrl } from "../../lib/constants";
import { CURRENT_STUDY_PROTOCOL_VERSION } from "@/lib/study-protocol";

const taskLabels: Record<string, string> = {
  register_course: "Register for a course",
  drop_course: "Drop a course",
  book_room: "Book a room",
  cancel_booking: "Cancel a booking",
};

export function TaskIndicator() {
  const supabase = useMemo(() => createClient(), []);
  const [activeTask, setActiveTask] = useState<{
    taskCode: string;
    title: string;
    sessionId: string;
    progressId: string;
    status: "in_progress" | "completed";
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  const refreshActiveTask = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setActiveTask(null);
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
        return;
      }

      const { data: progress } = await supabase
        .from("task_progress")
        .select("id, task_definition_id, session_id, status, updated_at")
        .in("session_id", sessionIds)
        .eq("protocol_version", CURRENT_STUDY_PROTOCOL_VERSION)
        .in("status", ["in_progress", "completed"])
        .order("updated_at", { ascending: false })
        .limit(1);

      const current = progress?.[0];
      if (!current) {
        setActiveTask(null);
        return;
      }

      if (current.status === "completed") {
        const updatedAt = new Date(current.updated_at).getTime();
        const now = Date.now();
        if (now - updatedAt > 60 * 1000) {
          setActiveTask(null);
          return;
        }
      }

      const { data: definition } = await supabase
        .from("task_definitions")
        .select("task_code, title")
        .eq("id", current.task_definition_id)
        .maybeSingle();

      const { data: assignment } = await supabase
        .from("task_user_assignments")
        .select("task_assignment_sets(targets)")
        .eq("user_id", user.id)
        .maybeSingle();

      let specificTitle;
      const taskAssignmentSets = assignment?.task_assignment_sets as {
        targets?: Record<
          string,
          { title: string; description: string; criteria: Record<string, string> }
        >;
      } | null;
      if (taskAssignmentSets?.targets) {
        const targets = taskAssignmentSets.targets;
        specificTitle = targets[definition?.task_code ?? ""]?.title;
      }

      setActiveTask({
        taskCode: definition?.task_code ?? "unknown",
        title:
          specificTitle ??
          definition?.title ??
          taskLabels[definition?.task_code ?? ""] ??
          "Task",
        sessionId: current.session_id,
        progressId: current.id,
        status: current.status as "in_progress" | "completed",
      });
      setIsVisible(true);
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, [supabase]);

  useEffect(() => {
    (async () => {
      await refreshActiveTask();
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refreshActiveTask();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshActiveTask, supabase]);

  useEffect(() => {
    const progressId = activeTask?.progressId;
    const taskInProgress = activeTask?.status === "in_progress";
    if (!progressId) return;

    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let pollId: ReturnType<typeof setInterval> | undefined;

    const handleProgressPayload = (payload: {
      new: Record<string, unknown>;
    }) => {
      const row = payload.new as { status?: string };
      if (row.status === "completed" || row.status === "in_progress") {
        setActiveTask((prev) =>
          prev?.progressId === progressId
            ? { ...prev, status: row.status as "in_progress" | "completed" }
            : prev
        );
      }
      void refreshActiveTask({ silent: true });
    };

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled || !session) return;

      channel = supabase
        .channel(`task_progress:${progressId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "task_progress",
            filter: `id=eq.${progressId}`,
          },
          handleProgressPayload
        )
        .subscribe((status, err) => {
          if (status === "CHANNEL_ERROR") {
            console.error("[task_progress realtime]", err);
          }
        });

      if (cancelled && channel) {
        void supabase.removeChannel(channel);
        channel = null;
      }
    })();

    if (taskInProgress) {
      pollId = setInterval(() => {
        void refreshActiveTask({ silent: true });
      }, 3000);
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshActiveTask({ silent: true });
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      if (pollId) clearInterval(pollId);
      document.removeEventListener("visibilitychange", onVisible);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [activeTask?.progressId, activeTask?.status, supabase, refreshActiveTask]);

  const surveyLink = useMemo(() => getSurveyUrl(), []);

  if (loading || !activeTask || !isVisible) return null;

  const isCompleted = activeTask.status === "completed";

  return (
    <div className="fixed top-20 right-2 z-50 w-60 md:right-4 md:w-72">
      <Card
        className={`shadow-md transition-all duration-500 bg-background/60 backdrop-blur-xl backdrop-saturate-150 border-white/20 py-2 md:py-4 ${
          isCompleted ? "border-green-500 ring-1 ring-green-500" : ""
        }`}
      >
        <CardContent className="space-y-2 p-2 md:space-y-3 md:p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold md:text-sm">
              {isCompleted ? "Task Completed" : "Task in progress"}
            </div>
            <div className="flex items-center gap-1">
              <Badge
                variant={isCompleted ? "success" : "warning"}
                className="px-1.5 py-0.5 text-[10px] md:px-2 md:py-0.5 md:text-xs"
              >
                {isCompleted ? "Completed" : "Active"}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 md:h-6 md:w-6"
                onClick={() => setIsExpanded((prev) => !prev)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          {isExpanded && (
            <>
              <div className="text-sm">{activeTask.title}</div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={surveyLink}>Return to survey</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
