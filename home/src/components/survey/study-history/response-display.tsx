"use client";

import type { HistoryModalityFilter } from "@/lib/study-history";
import { cn } from "@/lib/utils";

const MODALITY_BAR_CLASS: Record<
  Exclude<HistoryModalityFilter, "all">,
  string
> = {
  traditional: "bg-traditional/75",
  chat_agent: "bg-chat/75",
};

const MODALITY_BORDER_CLASS: Record<
  Exclude<HistoryModalityFilter, "all">,
  string
> = {
  traditional: "border-traditional/30",
  chat_agent: "border-chat/30",
};

function ScaleBar({
  value,
  max,
  label,
  modality,
}: {
  value: number;
  max: number;
  label: string;
  modality: Exclude<HistoryModalityFilter, "all">;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className='flex items-center gap-3 mt-1'>
      <div className='flex-1 h-2 rounded-full bg-muted overflow-hidden'>
        <div
          className={cn(
            "h-full rounded-full transition-all",
            MODALITY_BAR_CLASS[modality],
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className='text-sm font-semibold tabular-nums shrink-0'>
        {label}
      </span>
    </div>
  );
}

export function ResponseDisplay({
  responseValue,
  responseText,
  scaleType,
  modality,
}: {
  responseValue: number | null;
  responseText: string | null;
  scaleType: string;
  modality: Exclude<HistoryModalityFilter, "all">;
}) {
  const text = responseText?.trim();

  if (text) {
    return (
      <p
        className={cn(
          "mt-1.5 pl-4 border-l-2 text-sm text-foreground leading-relaxed",
          MODALITY_BORDER_CLASS[modality],
        )}
      >
        {text}
      </p>
    );
  }

  if (responseValue === null) {
    return (
      <p className='mt-1 text-sm text-muted-foreground italic'>
        No answer recorded
      </p>
    );
  }

  if (scaleType === "likert_5") {
    return (
      <div className='mt-1'>
        <ScaleBar
          value={responseValue}
          max={5}
          label={`${responseValue} / 5`}
          modality={modality}
        />
      </div>
    );
  }

  if (scaleType === "likert_7") {
    return (
      <div className='mt-1'>
        <ScaleBar
          value={responseValue}
          max={7}
          label={`${responseValue} / 7`}
          modality={modality}
        />
      </div>
    );
  }

  if (scaleType === "numeric_0_100") {
    return (
      <div className='mt-1'>
        <ScaleBar
          value={responseValue}
          max={100}
          label={`${responseValue} / 100`}
          modality={modality}
        />
      </div>
    );
  }

  return (
    <p className='mt-1 text-sm font-semibold text-foreground'>
      {responseValue}
    </p>
  );
}
