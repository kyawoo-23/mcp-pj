"use client";

import { Bot, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HistoryModalityFilter } from "@/lib/study-history";
import { HISTORY_SYSTEM_LABELS } from "@/lib/study-history";

interface ModalityFilterProps {
  value: HistoryModalityFilter;
  onChange: (value: HistoryModalityFilter) => void;
}

const OPTIONS: {
  value: HistoryModalityFilter;
  label: string;
  icon?: typeof Monitor;
}[] = [
  { value: "all", label: "All modalities" },
  { value: "traditional", label: HISTORY_SYSTEM_LABELS.traditional, icon: Monitor },
  { value: "chat_agent", label: HISTORY_SYSTEM_LABELS.chat_agent, icon: Bot },
];

export function ModalityFilter({ value, onChange }: ModalityFilterProps) {
  return (
    <div
      className='flex flex-wrap gap-2'
      role='group'
      aria-label='Filter by interaction modality'
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type='button'
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              isActive
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border/80 bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            {Icon ? <Icon className='h-3.5 w-3.5' aria-hidden /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
