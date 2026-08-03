"use client";

import {
  Bot,
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  Clock3,
  Monitor,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type {
  HistoryModalityFilter,
  StudyHistoryTask,
  UnifiedTaskCompareRow,
} from "@/lib/study-history";
import { formatHistoryStatus } from "@/lib/study-history";
import { COMPARE_THEME } from "@/lib/study-protocol-labels";
import { cn } from "@/lib/utils";
import { MODALITY_LABEL_CLASS } from "./modality-styles";

const STATUS_ICONS = {
  completed: CheckCircle2,
  in_progress: Clock3,
  not_started: CircleDashed,
};

type TaskModality = Exclude<HistoryModalityFilter, "all">;

const MODALITY_LABELS: Record<TaskModality, string> = {
  traditional: "Traditional",
  chat_agent: "Chat",
};

function TaskStatusBadge({
  status,
}: {
  status: StudyHistoryTask["status"];
}) {
  const Icon = STATUS_ICONS[status];
  return (
    <span className='inline-flex items-center gap-1 text-xs font-semibold'>
      <Icon
        className={cn(
          "h-3 w-3",
          status === "completed" && "text-primary",
          status === "in_progress" && "text-amber-600 dark:text-amber-400",
          status === "not_started" && "text-muted-foreground",
        )}
        aria-hidden
      />
      {formatHistoryStatus(status)}
    </span>
  );
}

function TaskStatusCell({
  task,
  modality,
}: {
  task?: StudyHistoryTask;
  modality: TaskModality;
}) {
  const ModalityIcon = modality === "traditional" ? Monitor : Bot;

  return (
    <div className='flex items-center justify-between gap-3 py-1'>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide shrink-0",
          MODALITY_LABEL_CLASS[modality],
        )}
      >
        <ModalityIcon className='h-3 w-3' aria-hidden />
        {MODALITY_LABELS[modality]}
      </span>
      {!task ? (
        <span className='text-xs text-muted-foreground/60 italic'>No session</span>
      ) : (
        <TaskStatusBadge status={task.status} />
      )}
    </div>
  );
}

function ModalityStatusList({
  traditional,
  chat,
  modality,
}: {
  traditional?: StudyHistoryTask;
  chat?: StudyHistoryTask;
  modality: HistoryModalityFilter;
}) {
  const showTraditional = modality === "all" || modality === "traditional";
  const showChat = modality === "all" || modality === "chat_agent";

  return (
    <div className='space-y-2'>
      {showTraditional ? (
        <TaskStatusCell task={traditional} modality='traditional' />
      ) : null}
      {showChat ? (
        <TaskStatusCell task={chat} modality='chat_agent' />
      ) : null}
    </div>
  );
}

interface TaskCompareSectionProps {
  rows: UnifiedTaskCompareRow[];
  simpleCompleted: number;
  simpleTotal: number;
  criteriaCompleted: number;
  criteriaTotal: number;
  modality?: HistoryModalityFilter;
  showSimple?: boolean;
  showCriteria?: boolean;
}

export function TaskCompareSection({
  rows,
  simpleCompleted,
  simpleTotal,
  criteriaCompleted,
  criteriaTotal,
  modality = "all",
  showSimple = true,
  showCriteria = true,
}: TaskCompareSectionProps) {
  if (rows.length === 0) return null;

  const minTableWidth = showSimple && showCriteria ? "min-w-[560px]" : "min-w-[320px]";

  return (
    <Card className='shadow-xs border-border/80 overflow-hidden gap-0 py-0'>
      <div className='px-5 py-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <ClipboardList className='h-5 w-5 text-muted-foreground' aria-hidden />
          <div>
            <h2 className='text-sm font-semibold tracking-tight'>
              Task completion
            </h2>
            <p className='text-xs text-muted-foreground'>
              {showSimple && showCriteria
                ? "Status per protocol across interaction modalities"
                : "Status across interaction modalities"}
            </p>
          </div>
        </div>
        <div className='flex flex-wrap gap-4 text-xs'>
          {showSimple ? (
            <span>
              <span className={cn("font-bold", COMPARE_THEME.simple.accentClass)}>
                Simple Task:
              </span>{" "}
              <span className='tabular-nums font-semibold'>
                {simpleCompleted}/{simpleTotal}
              </span>
            </span>
          ) : null}
          {showCriteria ? (
            <span>
              <span className={cn("font-bold", COMPARE_THEME.criteria.accentClass)}>
                Criteria Task:
              </span>{" "}
              <span className='tabular-nums font-semibold'>
                {criteriaCompleted}/{criteriaTotal}
              </span>
            </span>
          ) : null}
        </div>
      </div>
      <CardContent className='p-0 overflow-x-auto'>
        <table className={cn("w-full border-collapse text-sm", minTableWidth)}>
          <thead>
            <tr className='border-b border-border/60 bg-muted/20'>
              <th scope='col' className='text-left px-4 py-2.5 font-medium'>
                Task
              </th>
              {showSimple ? (
                <th
                  scope='col'
                  className={cn(
                    "text-left px-3 py-2.5 font-medium text-xs",
                    COMPARE_THEME.simple.accentClass,
                  )}
                >
                  Simple Task
                </th>
              ) : null}
              {showCriteria ? (
                <th
                  scope='col'
                  className={cn(
                    "text-left px-3 py-2.5 font-medium text-xs",
                    COMPARE_THEME.criteria.accentClass,
                  )}
                >
                  Criteria Task
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.task_code}
                className='border-b border-border/40 last:border-0 hover:bg-muted/10'
              >
                <th scope='row' className='text-left px-4 py-3 font-medium'>
                  <div className='flex items-start gap-2'>
                    <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground'>
                      {index + 1}
                    </span>
                    <div>
                      <p className='leading-snug'>{row.title}</p>
                      {row.description ? (
                        <p className='text-xs text-muted-foreground line-clamp-1 mt-0.5'>
                          {row.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </th>
                {showSimple ? (
                  <td className='px-3 py-3 align-top'>
                    <ModalityStatusList
                      traditional={row.simpleTraditional}
                      chat={row.simpleChat}
                      modality={modality}
                    />
                  </td>
                ) : null}
                {showCriteria ? (
                  <td className='px-3 py-3 align-top'>
                    <ModalityStatusList
                      traditional={row.criteriaTraditional}
                      chat={row.criteriaChat}
                      modality={modality}
                    />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
