"use client";

import { cn } from "@/lib/utils";

interface RadioSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function RadioSelect({
  options,
  value,
  onChange,
  disabled = false,
}: RadioSelectProps) {
  return (
    <div className='space-y-2'>
      {options.map((option) => (
        <div
          key={option}
          className={cn(
            "flex cursor-pointer items-center space-x-2 rounded-md border border-input p-3 transition-colors hover:bg-accent hover:text-accent-foreground",
            value === option &&
              "border-primary bg-accent text-accent-foreground",
            disabled && "pointer-events-none opacity-50",
          )}
          onClick={() => {
            if (!disabled) {
              onChange(option);
            }
          }}
        >
          <div
            className={cn(
              "flex aspect-square h-4 w-4 items-center justify-center rounded-full border border-primary text-primary ring-offset-background",
              value === option
                ? "bg-primary text-primary-foreground"
                : "bg-transparent",
            )}
          >
            {value === option && (
              <div className='h-2 w-2 rounded-full bg-background' />
            )}
          </div>
          <span className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
            {option}
          </span>
        </div>
      ))}
    </div>
  );
}
