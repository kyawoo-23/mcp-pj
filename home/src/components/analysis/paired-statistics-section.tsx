"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import type { AnalysisPayload } from "@/lib/types";
import {
  buildPairedSurveyData,
  buildPairedTaskTimeData,
  calculatePreferenceResponses,
} from "@/lib/analysis-calculations";
import {
  computeAllConstructStats,
  computeTaskTimeStats,
  downloadPairedCSV,
  PAIRED_HYPOTHESES,
  type ConstructStats,
} from "@/lib/paired-statistics";
import { chiSquareGoodnessOfFit } from "@/lib/preference-statistics";

interface PairedStatisticsSectionProps {
  payload: AnalysisPayload;
}

function formatPValue(p: number): string {
  if (p < 0.001) return "< .001";
  if (p < 0.01) return p.toFixed(3);
  return p.toFixed(2);
}

function formatNumber(x: number, decimals = 2): string {
  return x.toFixed(decimals);
}

function formatStatValue(
  row: ConstructStats,
  value: number,
  decimals = 2,
): string {
  if (row.n === 0) return "—";
  const suffix = row.construct === "Task Time" ? "s" : "";
  return `${value.toFixed(decimals)}${suffix}`;
}

function EffectSizeLabel(d: number): string {
  const abs = Math.abs(d);
  if (abs >= 0.8) return "large";
  if (abs >= 0.5) return "medium";
  if (abs >= 0.2) return "small";
  return "negligible";
}

export function PairedStatisticsSection({
  payload,
}: PairedStatisticsSectionProps) {
  const pairedRows = useMemo(() => buildPairedSurveyData(payload), [payload]);
  const pairedTaskTimeRows = useMemo(
    () => buildPairedTaskTimeData(payload),
    [payload],
  );

  const stats = useMemo(() => {
    const surveyStats = computeAllConstructStats(pairedRows);
    const taskTimeStat = computeTaskTimeStats(pairedTaskTimeRows);
    return [...surveyStats, taskTimeStat];
  }, [pairedRows, pairedTaskTimeRows]);

  // Chi-square for preference questions (H5)
  const chiSquareResults = useMemo(() => {
    const preferences = calculatePreferenceResponses(payload);
    return preferences
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((pref) => {
        const counts = pref.responses.map((r) => r.count);
        const result = chiSquareGoodnessOfFit(counts);
        return {
          questionId: pref.questionId,
          questionText: pref.questionText,
          orderIndex: pref.orderIndex,
          totalResponses: counts.reduce((s, c) => s + c, 0),
          result,
        };
      })
      .filter((r) => r.result !== null);
  }, [payload]);

  // Aggregate H5: use the first preference question (main system preference)
  const h5Result = chiSquareResults.length > 0 ? chiSquareResults[0] : null;

  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [methodsExpanded, setMethodsExpanded] = useState(false);

  const handleExport = () => {
    downloadPairedCSV(pairedRows, pairedTaskTimeRows);
  };

  const methodsCollapsible = (
    <Collapsible open={methodsExpanded} onOpenChange={setMethodsExpanded}>
      <CollapsibleTrigger asChild>
        <Button
          variant='ghost'
          className='w-full justify-between text-muted-foreground'
        >
          <span>How paired t-test, Cohen&apos;s d, and χ² are calculated</span>
          {methodsExpanded ? (
            <ChevronUp className='h-4 w-4' />
          ) : (
            <ChevronDown className='h-4 w-4' />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className='mt-2'>
        <div className='text-muted-foreground rounded-lg border bg-muted/50 p-4 text-sm'>
          <div className='space-y-4'>
            <div>
              <p className='mb-2 font-medium'>Context</p>
              <p>
                Each participant used both systems (within-subjects design). We
                test whether the mean difference between Traditional and Chat
                differs from zero. Constructs: SUS (H1), Raw TLX (H2), SDT
                subscales (H3a–d), Task Time (H4). Mean diff = Traditional −
                Chat (positive = Traditional higher or slower).
              </p>
            </div>
            <div>
              <p className='mb-2 font-medium'>Paired t-test</p>
              <ul className='list-disc space-y-1 pl-5'>
                <li>
                  <strong>1. Difference vector</strong>: For each user,{" "}
                  <code>d_i = X_trad − X_chat</code>. One difference per user.
                </li>
                <li>
                  <strong>2. Mean difference</strong>:{" "}
                  <code>meanDiff = (1/n) Σ d_i</code>
                </li>
                <li>
                  <strong>3. Sample SD of differences</strong>:{" "}
                  <code>SD_d = √(Σ(d_i − meanDiff)² / (n−1))</code>
                </li>
                <li>
                  <strong>4. t-statistic</strong>:{" "}
                  <code>t = meanDiff / (SD_d / √n)</code>. Denominator is the
                  standard error of the mean difference.
                </li>
                <li>
                  <strong>5. P-value</strong>: Two-tailed, from normal
                  approximation to t (valid when n &gt; 30). p &lt; 0.05
                  indicates a significant difference.
                </li>
              </ul>
            </div>
            <div>
              <p className='mb-2 font-medium'>
                Cohen&apos;s d (within-subject)
              </p>
              <p className='mb-1'>
                Effect size: <code>d = meanDiff / SD_d</code>. Standardizes the
                mean difference by the variability of differences across users.
              </p>
              <p>|d| ≈ 0.2 small, ≈ 0.5 medium, ≥ 0.8 large.</p>
            </div>
            <div>
              <p className='mb-2 font-medium'>
                χ² Goodness-of-Fit (H5 — Preference)
              </p>
              <ul className='list-disc space-y-1 pl-5'>
                <li>
                  <strong>1. Observed counts</strong>: Count how many
                  participants chose each option (e.g. System A, System B,
                  Neither).
                </li>
                <li>
                  <strong>2. Expected counts</strong>: Under the null hypothesis
                  of no preference, each option is equally likely:{" "}
                  <code>E_i = N / k</code> where N = total responses and k =
                  number of options.
                </li>
                <li>
                  <strong>3. χ² statistic</strong>:{" "}
                  <code>χ² = Σ (O_i − E_i)² / E_i</code>. Measures how far the
                  observed distribution deviates from uniform.
                </li>
                <li>
                  <strong>4. Degrees of freedom</strong>:{" "}
                  <code>df = k − 1</code>.
                </li>
                <li>
                  <strong>5. P-value</strong>: From the χ² distribution with df
                  degrees of freedom. p &lt; 0.05 indicates a significant
                  departure from equal preference.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );

  if (pairedRows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Paired t-test & Cohen&apos;s d</CardTitle>
          <CardDescription>
            No paired data available. Users must have completed both traditional
            and chat-agent sessions with valid survey responses.
          </CardDescription>
        </CardHeader>
        <CardContent>{methodsCollapsible}</CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h3 className='text-lg font-medium'>Hypothesis Testing Results</h3>
          <p className='text-sm text-muted-foreground mt-1'>
            Within-subject statistics (n={pairedRows.length}) testing the
            difference between traditional and chat interfaces.
          </p>
        </div>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='shrink-0 gap-1.5'
          onClick={handleExport}
          aria-label='Export paired data as CSV'
        >
          <Download className='h-4 w-4' />
          Export Data
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {PAIRED_HYPOTHESES.map((h) => {
          // Chi-square hypothesis (H5)
          if (h.isChiSquare) {
            const chi2Sig = h5Result?.result
              ? h5Result.result.pValue < 0.05
              : false;
            return (
              <Card
                key={h.id}
                className={`flex flex-col ${chi2Sig ? "border-primary/50" : ""}`}
              >
                <CardHeader className='pb-3'>
                  <div className='flex justify-between items-start gap-2'>
                    <div className='space-y-1.5'>
                      <Badge variant='outline' className='font-mono text-xs'>
                        {h.id}
                      </Badge>
                      <CardTitle className='text-base font-semibold leading-tight'>
                        {h.label} ({h.construct})
                      </CardTitle>
                    </div>
                    {chi2Sig ? (
                      <Badge className='bg-green-600 hover:bg-green-700 ml-2 shrink-0'>
                        Significant
                      </Badge>
                    ) : (
                      <Badge variant='secondary' className='ml-2 shrink-0'>
                        Not Significant
                      </Badge>
                    )}
                  </div>
                  <CardDescription className='text-xs pt-1'>
                    {h.statement}
                  </CardDescription>
                </CardHeader>
                <CardContent className='mt-auto pt-0 pb-4'>
                  {h5Result?.result ? (
                    <div className='bg-background/80 rounded-md p-3 text-sm grid grid-cols-2 gap-y-3 border shadow-sm'>
                      <div className='col-span-2 flex items-center justify-between border-b pb-2 mb-1'>
                        <span className='font-medium text-muted-foreground text-xs uppercase tracking-wide'>
                          Result
                        </span>
                        <span
                          className={`font-semibold ${chi2Sig ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {chi2Sig
                            ? "Non-uniform Distribution"
                            : "Inconclusive"}
                        </span>
                      </div>

                      <div className='flex flex-col'>
                        <span className='text-[10px] uppercase text-muted-foreground font-semibold'>
                          P-Value
                        </span>
                        <span
                          className={`font-mono ${chi2Sig ? "font-bold text-primary" : ""}`}
                        >
                          {formatPValue(h5Result.result.pValue)}
                        </span>
                      </div>

                      <div className='flex flex-col text-right'>
                        <span className='text-[10px] uppercase text-muted-foreground font-semibold'>
                          χ² (df={h5Result.result.df})
                        </span>
                        <span className='font-mono'>
                          {formatNumber(h5Result.result.chi2)}
                        </span>
                      </div>

                      {chiSquareResults.length > 1 && (
                        <div className='col-span-2 border-t pt-2 mt-1'>
                          <p className='text-[10px] uppercase text-muted-foreground font-semibold mb-1'>
                            All preference questions
                          </p>
                          <div className='space-y-1'>
                            {chiSquareResults.map((cr) => (
                              <div
                                key={cr.questionId}
                                className='flex justify-between text-xs text-muted-foreground'
                              >
                                <span className='truncate mr-2'>
                                  Q{cr.orderIndex}
                                </span>
                                <span className='font-mono shrink-0'>
                                  χ²={formatNumber(cr.result!.chi2)}, p=
                                  {formatPValue(cr.result!.pValue)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className='text-sm text-muted-foreground'>
                      No preference data available
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          }

          // Paired t-test hypotheses (H1-H4)
          const stat = stats.find((s) => s.hypothesisId === h.id);
          const isSignificant = stat && stat.pValue < 0.05;
          const direction = stat
            ? stat.meanDiff > 0
              ? "Traditional Higher"
              : stat.meanDiff < 0
                ? "Chat Higher"
                : "No Difference"
            : "N/A";

          return (
            <Card
              key={h.id}
              className={`flex flex-col ${isSignificant ? "border-primary/50" : ""}`}
            >
              <CardHeader className='pb-3'>
                <div className='flex justify-between items-start gap-2'>
                  <div className='space-y-1.5'>
                    <Badge variant='outline' className='font-mono text-xs'>
                      {h.id}
                    </Badge>
                    <CardTitle className='text-base font-semibold leading-tight'>
                      {h.label} ({h.construct})
                    </CardTitle>
                  </div>
                  {isSignificant ? (
                    <Badge className='bg-green-600 hover:bg-green-700 ml-2 shrink-0'>
                      Significant
                    </Badge>
                  ) : (
                    <Badge variant='secondary' className='ml-2 shrink-0'>
                      Not Significant
                    </Badge>
                  )}
                </div>
                <CardDescription className='text-xs pt-1'>
                  {h.statement}
                </CardDescription>
              </CardHeader>
              <CardContent className='pt-0 pb-4'>
                {stat ? (
                  <div className='bg-background/80 rounded-md p-3 text-sm grid grid-cols-2 gap-y-3 border shadow-sm'>
                    <div className='col-span-2 flex items-center justify-between border-b pb-2 mb-1'>
                      <span className='font-medium text-muted-foreground text-xs uppercase tracking-wide'>
                        Result
                      </span>
                      <span
                        className={`font-semibold ${isSignificant ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {isSignificant ? direction : "Inconclusive"}
                      </span>
                    </div>

                    <div className='flex flex-col'>
                      <span className='text-[10px] uppercase text-muted-foreground font-semibold'>
                        P-Value
                      </span>
                      <span
                        className={`font-mono ${isSignificant ? "font-bold text-primary" : ""}`}
                      >
                        {formatPValue(stat.pValue)}
                      </span>
                    </div>

                    <div className='flex flex-col text-right'>
                      <span className='text-[10px] uppercase text-muted-foreground font-semibold'>
                        Effect Size (d)
                      </span>
                      <span className='font-mono'>
                        {formatNumber(stat.cohensD)}{" "}
                        <span className='text-muted-foreground text-xs font-sans'>
                          ({EffectSizeLabel(stat.cohensD)})
                        </span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className='text-sm text-muted-foreground'>
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Collapsible
        open={detailsExpanded}
        onOpenChange={setDetailsExpanded}
        className='border rounded-lg bg-card'
      >
        <CollapsibleTrigger asChild>
          <div className='flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors'>
            <div className='flex items-center gap-2 font-medium'>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${detailsExpanded ? "rotate-180" : ""}`}
              />
              Detailed Statistics Table
            </div>
            <span className='text-xs text-muted-foreground hidden sm:inline-block'>
              Means, SDs, raw t-values, and Cohen's d
            </span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className='p-4 pt-0 overflow-x-auto'>
            <table className='w-full text-sm border-t'>
              <thead>
                <tr className='border-b bg-muted/20'>
                  <th className='text-left py-3 pl-2 pr-4 font-medium text-muted-foreground'>
                    Construct
                  </th>
                  <th className='text-right py-3 px-2 font-medium text-muted-foreground'>
                    Mean (Trad)
                  </th>
                  <th className='text-right py-3 px-2 font-medium text-muted-foreground'>
                    Mean (Chat)
                  </th>
                  <th className='text-right py-3 px-2 font-medium text-muted-foreground'>
                    Mean diff
                  </th>
                  <th className='text-right py-3 px-2 font-medium text-muted-foreground'>
                    SD (Trad)
                  </th>
                  <th className='text-right py-3 px-2 font-medium text-muted-foreground'>
                    SD (Chat)
                  </th>
                  <th className='text-right py-3 px-2 font-medium text-muted-foreground'>
                    t
                  </th>
                  <th className='text-right py-3 px-2 font-medium text-muted-foreground'>
                    p-value
                  </th>
                  <th className='text-right py-3 px-2 font-medium text-muted-foreground'>
                    Cohen&apos;s d
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.map((row: ConstructStats) => (
                  <tr
                    key={row.construct}
                    className='border-b last:border-0 hover:bg-muted/30 transition-colors'
                  >
                    <td className='py-3 pl-2 pr-4 font-medium'>
                      <span className='mr-2 text-[10px] text-muted-foreground border rounded px-1 font-mono'>
                        {row.hypothesisId}
                      </span>
                      {row.construct}
                    </td>
                    <td className='text-right py-2 px-2'>
                      {formatStatValue(row, row.meanTrad)}
                    </td>
                    <td className='text-right py-2 px-2'>
                      {formatStatValue(row, row.meanChat)}
                    </td>
                    <td className='text-right py-2 px-2'>
                      {formatStatValue(row, row.meanDiff)}
                    </td>
                    <td className='text-right py-2 px-2'>
                      {row.n > 0 ? formatStatValue(row, row.sdTrad) : "—"}
                    </td>
                    <td className='text-right py-2 px-2'>
                      {row.n > 0 ? formatStatValue(row, row.sdChat) : "—"}
                    </td>
                    <td className='text-right py-2 px-2 font-mono text-xs'>
                      {row.n > 0 ? formatNumber(row.t) : "—"}
                    </td>
                    <td className='text-right py-2 px-2 font-mono text-xs'>
                      {row.n > 0 ? formatPValue(row.pValue) : "—"}
                    </td>
                    <td className='text-right py-2 px-2 font-mono text-xs'>
                      {row.n > 0 ? (
                        <span>
                          {formatNumber(row.cohensD)}{" "}
                          <span className='text-muted-foreground font-sans text-[10px]'>
                            ({EffectSizeLabel(row.cohensD)})
                          </span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {methodsCollapsible}
    </div>
  );
}
