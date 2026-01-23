"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  onOpenTask: (task: TaskDefinitionRow, session: TaskSessionRow) => void;
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
  systemType,
  session,
  tasks,
  progressByTaskId,
  activeTaskId,
  onOpenTask,
  onResetTask,
}: TaskListProps) {
  const completedCount = tasks.filter(
    (task) => progressByTaskId.get(task.id)?.status === "completed"
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>
            {systemType === "chat_agent" ? "Chat Agent Tasks" : "Traditional Tasks"}
          </span>
          <Badge variant='outline'>
            {completedCount}/{tasks.length} completed
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {tasks.map((task) => {
          const progress = progressByTaskId.get(task.id);
          const status = progress?.status ?? "not_started";
          const isActive = activeTaskId === task.id;
          const canOpen = !!session && session.status !== "not_started";
          return (
            <div
              key={task.id}
              className='flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between'
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
                  disabled={!canOpen}
                  onClick={() => session && onOpenTask(task, session)}
                >
                  Open task
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  disabled={!session || status === "not_started"}
                  onClick={() => session && onResetTask(task, session)}
                >
                  Reset task
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
