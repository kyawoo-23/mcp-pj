import type { StudyProtocolVersion } from "@/lib/analysis-calculations";

export const PROTOCOL_VERSIONS: StudyProtocolVersion[] = [
  "v1_simple",
  "v2_criteria",
];

export const DEFAULT_PROTOCOL_VERSION: StudyProtocolVersion = "v2_criteria";

export type ProtocolRouteSlug = "v1" | "v2";

const ROUTE_SLUG_TO_VERSION: Record<ProtocolRouteSlug, StudyProtocolVersion> = {
  v1: "v1_simple",
  v2: "v2_criteria",
};

const VERSION_TO_ROUTE_SLUG: Record<StudyProtocolVersion, ProtocolRouteSlug> = {
  v1_simple: "v1",
  v2_criteria: "v2",
};

type ProtocolColorSet = {
  accentClass: string;
  strongClass: string;
  borderClass: string;
  badgeClass: string;
  bannerClass: string;
  barClass: string;
  dotClass: string;
};

/** Per-protocol palette: indigo (Simple) and amber (Criteria). */
export const PROTOCOL_COLORS: Record<StudyProtocolVersion, ProtocolColorSet> = {
  v1_simple: {
    accentClass: "text-indigo-700 dark:text-indigo-400",
    strongClass: "text-indigo-700 dark:text-indigo-300",
    borderClass: "border-indigo-500/40 hover:border-indigo-500/70",
    badgeClass: "bg-indigo-500/10 text-indigo-800 dark:text-indigo-300",
    bannerClass: "border-l-indigo-500 bg-indigo-500/5",
    barClass: "bg-indigo-500/75",
    dotClass: "bg-indigo-500",
  },
  v2_criteria: {
    accentClass: "text-amber-700 dark:text-amber-400",
    strongClass: "text-amber-700 dark:text-amber-300",
    borderClass: "border-amber-500/40 hover:border-amber-500/70",
    badgeClass: "bg-amber-500/10 text-amber-800 dark:text-amber-300",
    bannerClass: "border-l-amber-500 bg-amber-500/5",
    barClass: "bg-amber-500/75",
    dotClass: "bg-amber-500",
  },
};

/** Singular labels used in side-by-side compare copy. */
export const COMPARE_PROTOCOL_LABELS = {
  simple: "Simple Task",
  criteria: "Criteria Task",
} as const;

/** Compare UI: Simple (v1) vs Criteria (v2). */
export const COMPARE_THEME = {
  simple: {
    accentClass: PROTOCOL_COLORS.v1_simple.accentClass,
    strongClass: PROTOCOL_COLORS.v1_simple.strongClass,
    barClass: PROTOCOL_COLORS.v1_simple.barClass,
    dotClass: PROTOCOL_COLORS.v1_simple.dotClass,
  },
  criteria: {
    accentClass: PROTOCOL_COLORS.v2_criteria.accentClass,
    strongClass: PROTOCOL_COLORS.v2_criteria.strongClass,
    barClass: PROTOCOL_COLORS.v2_criteria.barClass,
    dotClass: PROTOCOL_COLORS.v2_criteria.dotClass,
  },
} as const;

export const PROTOCOL_META: Record<
  StudyProtocolVersion,
  {
    title: string;
    shortLabel: string;
    description: string;
    analysisPath: string;
    accentClass: string;
    borderClass: string;
    badgeClass: string;
    bannerClass: string;
  }
> = {
  v1_simple: {
    title: "Simple Tasks",
    shortLabel: "v1",
    description:
      "Open-ended task instructions without criteria-based verification.",
    analysisPath: "/analysis/v1",
    ...PROTOCOL_COLORS.v1_simple,
  },
  v2_criteria: {
    title: "Criteria Tasks",
    shortLabel: "v2",
    description:
      "Tasks verified against seeded criteria sets (course, section, facility, time).",
    analysisPath: "/analysis/v2",
    ...PROTOCOL_COLORS.v2_criteria,
  },
};

export function protocolVersionFromRouteSlug(
  slug: string,
): StudyProtocolVersion | null {
  if (slug === "v1" || slug === "v2") {
    return ROUTE_SLUG_TO_VERSION[slug];
  }
  return null;
}

export function routeSlugFromProtocolVersion(
  version: StudyProtocolVersion,
): ProtocolRouteSlug {
  return VERSION_TO_ROUTE_SLUG[version];
}

export function parseProtocolFromSearchParam(
  raw: string | null | undefined,
): StudyProtocolVersion | null {
  if (!raw) return null;
  if (raw === "v1" || raw === "v1_simple") return "v1_simple";
  if (raw === "v2" || raw === "v2_criteria") return "v2_criteria";
  return null;
}
