import Link from "next/link";
import { ArrowRight, ListChecks, ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PROTOCOL_META, PROTOCOL_VERSIONS } from "@/lib/study-protocol-labels";
import type { StudyProtocolVersion } from "@/lib/analysis-calculations";
import { cn } from "@/lib/utils";

const PROTOCOL_ICONS: Record<StudyProtocolVersion, typeof ScrollText> = {
  v1_simple: ScrollText,
  v2_criteria: ListChecks,
};

type ProtocolVersionPickerProps = {
  completedCounts?: Partial<Record<StudyProtocolVersion, number>>;
};

export function ProtocolVersionPicker({
  completedCounts,
}: ProtocolVersionPickerProps) {
  return (
    <div className='grid gap-5 sm:grid-cols-2 max-w-3xl mx-auto'>
      {PROTOCOL_VERSIONS.map((version) => {
        const meta = PROTOCOL_META[version];
        const Icon = PROTOCOL_ICONS[version];
        const completed = completedCounts?.[version];

        return (
          <Link
            key={version}
            href={meta.analysisPath}
            className={cn(
              "group relative flex flex-col rounded-xl border-2 bg-card p-6 shadow-sm transition-all duration-200",
              "hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              meta.borderClass,
            )}
          >
            <div className='flex items-start justify-between gap-3 mb-4'>
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-lg border bg-background/80",
                  meta.borderClass,
                )}
              >
                <Icon className={cn("h-5 w-5", meta.accentClass)} />
              </div>
              <Badge variant='outline' className={cn("text-xs", meta.badgeClass)}>
                {meta.shortLabel}
              </Badge>
            </div>

            <h2 className={cn("text-xl font-semibold tracking-tight", meta.accentClass)}>
              {meta.title}
            </h2>
            <p className='mt-2 text-sm text-muted-foreground leading-relaxed flex-1'>
              {meta.description}
            </p>

            <div className='mt-5 flex items-center justify-between gap-2'>
              {completed !== undefined ? (
                <span className='text-xs text-muted-foreground tabular-nums'>
                  {completed} completed participant{completed === 1 ? "" : "s"}
                </span>
              ) : (
                <span className='text-xs text-muted-foreground'>View dashboard</span>
              )}
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-sm font-medium transition-transform group-hover:translate-x-0.5",
                  meta.accentClass,
                )}
              >
                Open
                <ArrowRight className='h-4 w-4' />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
