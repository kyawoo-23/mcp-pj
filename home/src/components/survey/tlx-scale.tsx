"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface TlxScaleProps {
  value?: number | string;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  lowLabel?: string;
  highLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function TlxScale({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 5,
  lowLabel = "Low",
  highLabel = "High",
  disabled = false,
  className,
}: TlxScaleProps) {
  // Generate ticks
  const ticks = [];
  for (let i = min; i <= max; i += step) {
    ticks.push(i);
  }

  // Handle value parsing
  const numericValue =
    value === "" || value === undefined ? undefined : Number(value);

  // Hover state
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const rawValue = min + percent * (max - min);
    const rounded = Math.round(rawValue / step) * step;
    setHoverValue(rounded);
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  return (
    <div className={cn("w-full space-y-3 py-2", className)}>
      {/* Labels */}
      <div className='flex justify-between text-sm font-medium text-muted-foreground uppercase tracking-wider select-none'>
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>

      {/* Scale Container */}
      <div className='relative h-14 w-full select-none touch-none'>
        {/* Frame / Ticks */}
        <div className='pointer-events-none absolute bottom-0 left-0 right-0 top-0 flex items-end border-y-2 border-muted-foreground/30'>
          {ticks.map((tickValue) => {
            const percent = ((tickValue - min) / (max - min)) * 100;
            // Major ticks at 0, 10, 20... (every 2nd tick if step is 5)
            // Or if step is different, we might need logic. Assuming step 5 here for TLX.
            const isMajor = tickValue % 10 === 0;

            return (
              <div
                key={tickValue}
                className={cn(
                  "absolute bottom-0 w-px bg-muted-foreground/30",
                  isMajor ? "h-full bg-muted-foreground/50" : "h-1/2",
                )}
                style={{ left: `${percent}%` }}
              />
            );
          })}
        </div>

        {/* Clickable Interaction Layer */}
        <div
          className={cn(
            "absolute inset-0 z-10 cursor-pointer",
            disabled && "cursor-not-allowed opacity-50",
          )}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => {
            if (disabled) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = Math.max(0, Math.min(1, x / rect.width));
            const rawValue = min + percent * (max - min);
            // Snap to step
            const rounded = Math.round(rawValue / step) * step;
            onChange(rounded);
          }}
        />

        {/* Hover Indicator */}
        {hoverValue !== null && hoverValue !== numericValue && (
          <div
            className='absolute top-0 bottom-0 w-1 -ml-[2px] bg-primary/40 z-15 pointer-events-none transition-all duration-150'
            style={{
              left: `${((hoverValue - min) / (max - min)) * 100}%`,
            }}
          >
            {/* Hover Tooltip */}
            <div className='absolute -top-9 left-1/2 -translate-x-1/2 bg-primary/80 text-primary-foreground text-xs font-semibold px-2 py-1 rounded shadow-sm min-w-8 text-center transition-all duration-150'>
              {hoverValue}
            </div>
          </div>
        )}

        {/* Selected Value Indicator */}
        {numericValue !== undefined && !isNaN(numericValue) && (
          <div
            className='absolute top-0 bottom-0 w-1.5 -ml-[3px] bg-primary z-20 pointer-events-none transition-all duration-200'
            style={{
              left: `${((numericValue - min) / (max - min)) * 100}%`,
            }}
          >
            {/* Value Tooltip */}
            <div className='absolute -top-9 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded shadow-sm min-w-8 text-center'>
              {numericValue}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
