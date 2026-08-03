"use client";

import { Bot, Info, Monitor } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  HISTORY_MODALITY_FILTER_HEADING,
  HISTORY_MODALITY_FILTER_INFO,
  HISTORY_MODALITY_FILTER_LABELS,
  type HistoryModalityFilter,
} from "@/lib/study-history";

interface ModalityFilterProps {
  value: HistoryModalityFilter;
  onChange: (value: HistoryModalityFilter) => void;
}

const OPTIONS: {
  value: HistoryModalityFilter;
  icon?: typeof Monitor;
}[] = [
  { value: "all" },
  { value: "traditional", icon: Monitor },
  { value: "chat_agent", icon: Bot },
];

export function ModalityFilter({ value, onChange }: ModalityFilterProps) {
  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-1'>
        <span className='text-sm font-medium text-foreground'>
          {HISTORY_MODALITY_FILTER_HEADING}
        </span>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type='button'
              className='-mt-px inline-flex shrink-0 align-middle items-center justify-center rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
              aria-label='What do these interaction options mean?'
            >
              <Info className='h-3.5 w-3.5' aria-hidden />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side='bottom'
            align='start'
            className='max-w-sm space-y-3 text-sm'
          >
            <div className='space-y-1'>
              <p className='font-medium leading-snug'>
                {HISTORY_MODALITY_FILTER_INFO.title}
              </p>
              <p className='text-muted-foreground leading-relaxed'>
                {HISTORY_MODALITY_FILTER_INFO.description}
              </p>
            </div>
            <ul className='space-y-2 text-muted-foreground leading-relaxed'>
              {OPTIONS.map((option) => (
                <li key={option.value}>
                  <span className='font-medium text-foreground'>
                    {HISTORY_MODALITY_FILTER_LABELS[option.value]}
                  </span>
                  {": "}
                  {HISTORY_MODALITY_FILTER_INFO.options[option.value]}
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      </div>
      <div
        className='flex flex-wrap gap-2'
        role='group'
        aria-label={HISTORY_MODALITY_FILTER_HEADING}
      >
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = value === option.value;
          const label = HISTORY_MODALITY_FILTER_LABELS[option.value];
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
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
