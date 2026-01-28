"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  SystemType,
  TaskDefinitionRow,
  TaskProgressRow,
  TaskSessionRow,
} from "@/lib/types";

interface TaskListProps {
  systemType: SystemType;
  session?: TaskSessionRow;
  tasks: TaskDefinitionRow[];
  progressByTaskId: Map<string, TaskProgressRow>;
  activeTaskId?: string;
  onOpenTask: (
    task: TaskDefinitionRow,
    session: TaskSessionRow,
  ) => void | Promise<void>;
  onResetTask: (task: TaskDefinitionRow, session: TaskSessionRow) => void;
}

const statusVariantMap: Record<
  TaskProgressRow["status"],
  "default" | "secondary" | "success" | "warning"
> = {
  not_started: "secondary",
  in_progress: "warning",
  completed: "success",
};

export function TaskList({
  session,
  tasks,
  progressByTaskId,
  activeTaskId,
  onOpenTask,
  onResetTask,
}: TaskListProps) {
  const [openingTaskId, setOpeningTaskId] = useState<string | null>(null);
  const [taskToReset, setTaskToReset] = useState<{
    task: TaskDefinitionRow;
    session: TaskSessionRow;
  } | null>(null);

  return (
    <div className='space-y-4'>
      {tasks.map((task) => {
        const progress = progressByTaskId.get(task.id);
        const status = progress?.status ?? "not_started";
        const isActive = activeTaskId === task.id;
        const canOpen = !!session && session.status !== "not_started";
        return (
          <div
            key={task.id}
            className='flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between bg-card'
          >
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-semibold'>{task.title}</span>
                <Badge variant={statusVariantMap[status]}>
                  {status.replace("_", " ")}
                </Badge>
                {isActive && <Badge variant='info'>Active</Badge>}
              </div>
              {task.description && (
                <p className='text-sm text-muted-foreground'>
                  {task.description}
                </p>
              )}
            </div>
            <div className='flex flex-col gap-2 sm:flex-row'>
              <Button
                variant='outline'
                size='sm'
                disabled={
                  !canOpen ||
                  status === "completed" ||
                  openingTaskId === task.id
                }
                onClick={async () => {
                  if (!session) return;
                  setOpeningTaskId(task.id);
                  try {
                    await onOpenTask(task, session);
                  } finally {
                    setOpeningTaskId(null);
                  }
                }}
              >
                {openingTaskId === task.id ? "Opening..." : "Open task"}
              </Button>
              <Button
                variant='ghost'
                size='sm'
                disabled={
                  !session || status === "not_started" || status === "completed"
                }
                onClick={() => session && setTaskToReset({ task, session })}
              >
                Reset task
              </Button>
            </div>
          </div>
        );
      })}

      <Dialog
        open={!!taskToReset}
        onOpenChange={(open) => !open && setTaskToReset(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Task?</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset this task? This will clear all
              progress and responses for this task. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setTaskToReset(null)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={() => {
                if (taskToReset) {
                  onResetTask(taskToReset.task, taskToReset.session);
                  setTaskToReset(null);
                }
              }}
            >
              Reset Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
