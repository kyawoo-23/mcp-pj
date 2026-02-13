import {
  mean,
  median,
  sampleStandardDeviation,
  cumulativeStdNormalProbability,
} from "simple-statistics";
import type {
  PairedSurveyRow,
  PairedTaskTimeRow,
} from "./analysis-calculations";

// ============================================================================
// Paired t-test
// ============================================================================

export type PairedTTestResult = {
  meanTrad: number;
  meanChat: number;
  meanDiff: number;
  t: number;
  pValue: number;
  cohensD: number;
  n: number;
};

/**
 * Paired t-test: tests whether mean(trad - chat) differs from 0.
 *
 * ## Calculation steps
 *
 * 1. **Difference vector**: d_i = trad_i - chat_i for each paired observation
 *
 * 2. **Mean of differences**: meanDiff = (1/n) Σ d_i
 *
 * 3. **Sample SD of differences**: SD_d = sqrt( Σ(d_i - meanDiff)² / (n-1) )
 *
 * 4. **t-statistic**: t = meanDiff / (SD_d / sqrt(n)) = meanDiff / SE_d
 *    - SE_d = standard error of the mean difference
 *
 * 5. **P-value**: Two-tailed p-value from standard normal CDF approximation
 *    - For df = n-1 ≥ 30, normal approximation to t-distribution is acceptable
 *    - pValue = 2 × (1 - Φ(|t|))
 *
 * 6. **Cohen's d (within-subject)**: d = meanDiff / SD_d
 */
export function pairedTTest(
  trad: number[],
  chat: number[],
): PairedTTestResult | null {
  if (trad.length !== chat.length || trad.length < 2) return null;

  const diffs = trad.map((t, i) => t - chat[i]);
  const n = diffs.length;
  const diffMean = mean(diffs);
  const diffSd = sampleStandardDeviation(diffs);

  if (diffSd === 0) return null;

  const tStat = diffMean / (diffSd / Math.sqrt(n));

  // Two-tailed p-value. For df >= 30 (n > 30), normal approximation is acceptable.
  const absT = Math.abs(tStat);
  const oneTail = 1 - cumulativeStdNormalProbability(absT);
  const pValue = 2 * oneTail;

  // Cohen's d (within-subject): mean(diff) / SD(diff)
  const cohensD = diffMean / diffSd;

  return {
    meanTrad: mean(trad),
    meanChat: mean(chat),
    meanDiff: diffMean,
    t: tStat,
    pValue: Math.min(1, Math.max(0, pValue)),
    cohensD,
    n,
  };
}

// ============================================================================
// Cohen's d (within-subject)
// ============================================================================

/**
 * Cohen's d for paired/within-subject design.
 *
 * ## Calculation
 *
 * 1. **Difference vector**: d_i = trad_i - chat_i
 *
 * 2. **d = mean(diff) / SD(diff)**
 *    - mean(diff) = (1/n) Σ d_i
 *    - SD(diff) = sample standard deviation of d_i = sqrt( Σ(d_i - mean)² / (n-1) )
 *
 * Interpretation: |d| ≈ 0.2 small, ≈ 0.5 medium, ≥ 0.8 large effect.
 */
export function cohensDPaired(trad: number[], chat: number[]): number | null {
  if (trad.length !== chat.length || trad.length < 2) return null;
  const diffs = trad.map((t, i) => t - chat[i]);
  const diffSd = sampleStandardDeviation(diffs);
  if (diffSd === 0) return 0;
  return mean(diffs) / diffSd;
}

// ============================================================================
// Compute stats for all constructs from paired rows
// ============================================================================
// ============================================================================
// Hypotheses Definitions
// ============================================================================

export interface PairedHypothesis {
  id: string; // e.g. "H1"
  construct: string; // e.g. "SUS"
  label: string; // e.g. "System Usability Scale"
  statement: string;
  tradKey?: keyof PairedSurveyRow;
  chatKey?: keyof PairedSurveyRow;
  isTaskTime?: boolean;
  isChiSquare?: boolean;
}

export const PAIRED_HYPOTHESES: PairedHypothesis[] = [
  {
    id: "H1",
    construct: "SUS",
    label: "System Usability Scale",
    statement:
      "There is a significant difference in perceived usability between Chat-based MCP and Traditional UI.",
    tradKey: "SUS_trad",
    chatKey: "SUS_chat",
  },
  {
    id: "H2",
    construct: "Raw TLX",
    label: "Raw NASA-TLX",
    statement:
      "There is a significant difference in perceived cognitive workload between the two systems.",
    tradKey: "TLX_trad",
    chatKey: "TLX_chat",
  },
  {
    id: "H3a",
    construct: "Autonomy",
    label: "Perceived Autonomy",
    statement: "There is a significant difference in perceived autonomy.",
    tradKey: "autonomy_trad",
    chatKey: "autonomy_chat",
  },
  {
    id: "H3b",
    construct: "Competence",
    label: "Perceived Competence",
    statement: "There is a significant difference in perceived competence.",
    tradKey: "competence_trad",
    chatKey: "competence_chat",
  },
  {
    id: "H3c",
    construct: "Performance Satisfaction",
    label: "Performance Satisfaction",
    statement: "There is a significant difference in performance satisfaction.",
    tradKey: "performanceSatisfaction_trad",
    chatKey: "performanceSatisfaction_chat",
  },
  {
    id: "H3d",
    construct: "System Satisfaction",
    label: "System Satisfaction",
    statement: "There is a significant difference in system satisfaction.",
    tradKey: "systemSatisfaction_trad",
    chatKey: "systemSatisfaction_chat",
  },
  {
    id: "H4",
    construct: "Task Time",
    label: "Task Completion Time",
    statement: "Task completion time differs significantly between systems.",
    isTaskTime: true,
  },
  {
    id: "H5",
    construct: "Preference",
    label: "System Preference",
    statement:
      "There is a significant preference for one system over the other (χ² goodness-of-fit vs. uniform).",
    isChiSquare: true,
  },
];

// ============================================================================
// Compute stats for all constructs from paired rows
// ============================================================================

export type ConstructStats = {
  construct: string;
  hypothesisId: string; // Added ID
  label: string; // Added Label
  meanTrad: number;
  meanChat: number;
  meanDiff: number;
  sdTrad: number;
  sdChat: number;
  medianTrad: number;
  medianChat: number;
  t: number;
  pValue: number;
  cohensD: number;
  n: number;
};

/**
 * Compute paired t-test statistics for each construct (SUS, TLX, autonomy, etc.).
 *
 * ## Calculation
 * For each construct, extracts trad and chat columns from rows, then runs
 * {@link pairedTTest} on those paired vectors. Returns meanTrad, meanChat,
 * meanDiff, t, pValue, cohensD, and n for each construct.
 */
function computeDescriptives(values: number[]): {
  mean: number;
  sd: number;
  median: number;
} {
  if (values.length === 0) {
    return { mean: 0, sd: 0, median: 0 };
  }
  const m = mean(values);
  const s = values.length >= 2 ? sampleStandardDeviation(values) : 0;
  const med = median(values);
  return { mean: m, sd: s, median: med };
}

export function computeAllConstructStats(
  rows: PairedSurveyRow[],
): ConstructStats[] {
  // Filter out task time and chi-square hypotheses as they're handled separately
  const surveyHypotheses = PAIRED_HYPOTHESES.filter(
    (h) => !h.isTaskTime && !h.isChiSquare,
  );

  return surveyHypotheses.map((h) => {
    const trad = rows.map((r) => r[h.tradKey!] as number);
    const chat = rows.map((r) => r[h.chatKey!] as number);
    const result = pairedTTest(trad, chat);

    const descTrad = computeDescriptives(trad);
    const descChat = computeDescriptives(chat);

    if (!result) {
      return {
        construct: h.construct,
        hypothesisId: h.id,
        label: h.label,
        meanTrad: 0,
        meanChat: 0,
        meanDiff: 0,
        sdTrad: 0,
        sdChat: 0,
        medianTrad: 0,
        medianChat: 0,
        t: 0,
        pValue: 1,
        cohensD: 0,
        n: 0,
      };
    }

    return {
      construct: h.construct,
      hypothesisId: h.id,
      label: h.label,
      meanTrad: result.meanTrad,
      meanChat: result.meanChat,
      meanDiff: result.meanDiff,
      sdTrad: descTrad.sd,
      sdChat: descChat.sd,
      medianTrad: descTrad.median,
      medianChat: descChat.median,
      t: result.t,
      pValue: result.pValue,
      cohensD: result.cohensD,
      n: result.n,
    };
  });
}

// ============================================================================
// Task Time Stats (H4 — Behavioral Efficiency)
// ============================================================================

/**
 * Compute paired t-test for task completion time. Converts ms to seconds for
 * display. Returns ConstructStats with time_trad_s, time_chat_s, meanDiff in seconds.
 */
export function computeTaskTimeStats(
  rows: PairedTaskTimeRow[],
): ConstructStats {
  // Find the H4 hypothesis to get correct ID/Label
  const h4 = PAIRED_HYPOTHESES.find((h) => h.id === "H4");

  const zeroResult: ConstructStats = {
    construct: "Task Time",
    hypothesisId: h4?.id ?? "H4",
    label: h4?.label ?? "Task Completion Time",
    meanTrad: 0,
    meanChat: 0,
    meanDiff: 0,
    sdTrad: 0,
    sdChat: 0,
    medianTrad: 0,
    medianChat: 0,
    t: 0,
    pValue: 1,
    cohensD: 0,
    n: 0,
  };

  if (rows.length < 2) return zeroResult;

  const tradSec = rows.map((r) => r.time_trad_ms / 1000);
  const chatSec = rows.map((r) => r.time_chat_ms / 1000);

  const result = pairedTTest(tradSec, chatSec);
  if (!result) return zeroResult;

  const descTrad = computeDescriptives(tradSec);
  const descChat = computeDescriptives(chatSec);

  return {
    construct: "Task Time",
    hypothesisId: h4?.id ?? "H4",
    label: h4?.label ?? "Task Completion Time",
    meanTrad: result.meanTrad,
    meanChat: result.meanChat,
    meanDiff: result.meanDiff,
    sdTrad: descTrad.sd,
    sdChat: descChat.sd,
    medianTrad: descTrad.median,
    medianChat: descChat.median,
    t: result.t,
    pValue: result.pValue,
    cohensD: result.cohensD,
    n: result.n,
  };
}

// ============================================================================
// CSV Export
// ============================================================================

const PAIRED_CSV_HEADERS_BASE = [
  "user_id",
  "SUS_trad",
  "SUS_chat",
  "TLX_trad",
  "TLX_chat",
  "autonomy_trad",
  "autonomy_chat",
  "competence_trad",
  "competence_chat",
  "performanceSatisfaction_trad",
  "performanceSatisfaction_chat",
  "systemSatisfaction_trad",
  "systemSatisfaction_chat",
] as const;

const PAIRED_CSV_HEADERS_WITH_TIME = [
  ...PAIRED_CSV_HEADERS_BASE,
  "time_trad_ms",
  "time_chat_ms",
] as const;

function escapeCsvCell(val: string | number): string {
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Serialize paired rows to CSV string. When taskTimeRows is provided, merges
 * time_trad_ms and time_chat_ms by user_id.
 */
export function pairedRowsToCsv(
  rows: PairedSurveyRow[],
  taskTimeRows?: PairedTaskTimeRow[],
): string {
  const hasTime = taskTimeRows && taskTimeRows.length > 0;
  const headers = hasTime ? PAIRED_CSV_HEADERS_WITH_TIME : PAIRED_CSV_HEADERS_BASE;
  const timeByUser = hasTime
    ? new Map(taskTimeRows!.map((r) => [r.user_id, r]))
    : null;

  const lines = [headers.join(",")];

  for (const row of rows) {
    const cells = headers.map((h) => {
      if (h === "time_trad_ms" || h === "time_chat_ms") {
        const timeRow = timeByUser?.get(row.user_id);
        const val =
          timeRow?.[h === "time_trad_ms" ? "time_trad_ms" : "time_chat_ms"];
        return escapeCsvCell(val ?? "");
      }
      const val = row[h as keyof PairedSurveyRow];
      return escapeCsvCell(val ?? "");
    });
    lines.push(cells.join(","));
  }

  return lines.join("\n");
}

/**
 * Trigger browser download of paired data as CSV.
 */
export function downloadPairedCSV(
  rows: PairedSurveyRow[],
  taskTimeRows?: PairedTaskTimeRow[],
  filename?: string,
): void {
  const csv = pairedRowsToCsv(rows, taskTimeRows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `paired-survey-data-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
