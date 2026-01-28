"use client";

import { cn } from "@/lib/utils";

interface LikertScaleProps {
  value: string; // The selected value (as a string)
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  leftLabel?: string;
  rightLabel?: string;
  disabled?: boolean;
}

export function LikertScale({
  value,
  onChange,
  min = 1,
  max = 5,
  leftLabel = "Strongly disagree",
  rightLabel = "Strongly agree",
  disabled = false,
}: LikertScaleProps) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4",
        disabled && "opacity-50 pointer-events-none",
      )}
    >
      {/* Mobile Labels: Shown above options on small screens */}
      <div className='flex w-full justify-between px-0.5 text-xs font-medium text-muted-foreground sm:hidden'>
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>

      {/* Desktop Left Label */}
      <span className='hidden text-sm font-medium text-muted-foreground sm:block sm:w-32 sm:text-right'>
        {leftLabel}
      </span>

      {/* Options */}
      <div className='flex w-full flex-1 justify-between gap-1 sm:w-auto sm:justify-center sm:gap-8'>
        {options.map((option) => {
          const isSelected = value === String(option);
          return (
            <div
              key={option}
              className='group flex cursor-pointer flex-col items-center gap-2'
              onClick={() => !disabled && onChange(String(option))}
            >
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  isSelected
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary/70",
                )}
              >
                {option}
              </span>
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border border-primary transition-all sm:h-6 sm:w-6",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/50 group-hover:border-primary",
                )}
              >
                {isSelected && (
                  <div className='h-2.5 w-2.5 rounded-full bg-background sm:h-3 sm:w-3' />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Right Label */}
      <span className='hidden text-sm font-medium text-muted-foreground sm:block sm:w-32 sm:text-left'>
        {rightLabel}
      </span>
    </div>
  );
}
