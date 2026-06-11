import Link from "next/link";
import { PROTOCOL_META, PROTOCOL_VERSIONS } from "@/lib/study-protocol-labels";
import type { StudyProtocolVersion } from "@/lib/analysis-calculations";
import { cn } from "@/lib/utils";

type ResearchProtocolSwitcherProps = {
  activeVersion: StudyProtocolVersion;
  v2Available: boolean;
};

export function ResearchProtocolSwitcher({
  activeVersion,
  v2Available,
}: ResearchProtocolSwitcherProps) {
  return (
    <nav
      className='mb-8 flex flex-wrap gap-2'
      aria-label='Study protocol version'
    >
      {PROTOCOL_VERSIONS.map((version) => {
        const meta = PROTOCOL_META[version];
        const isActive = version === activeVersion;
        const isDisabled = version === "v2_criteria" && !v2Available;

        if (isDisabled) {
          return (
            <span
              key={version}
              className={cn(
                "inline-flex items-center rounded-lg border px-4 py-2 text-sm text-muted-foreground opacity-50 cursor-not-allowed",
                meta.borderClass,
              )}
              title='v2 snapshot not yet exported'
            >
              {meta.title}
              <span className='ml-2 text-xs'>(coming soon)</span>
            </span>
          );
        }

        return (
          <Link
            key={version}
            href={`/research?protocol=${meta.shortLabel}`}
            className={cn(
              "inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? cn(meta.badgeClass, meta.borderClass, "border-2")
                : cn(
                    "text-muted-foreground hover:text-foreground",
                    meta.borderClass,
                  ),
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {meta.title}
          </Link>
        );
      })}
    </nav>
  );
}
