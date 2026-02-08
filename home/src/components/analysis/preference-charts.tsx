"use client";

import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface PreferenceResponse {
  questionId: string;
  questionText: string;
  orderIndex: number;
  options: string[] | null;
  responses: Array<{ label: string; count: number; percentage: number }>;
}

interface PreferenceChartsProps {
  preferences: PreferenceResponse[];
}

const optionColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/** Canonical order for option labels so the same group has the same position/color across questions. */
const OPTION_ORDER = [
  "Traditional UI",
  "Traditional UI for most tasks",
  "Chat-based system",
  "Chat-based system for most tasks",
  "Chat for simple tasks, UI for complex tasks",
  "Both equally",
  "No clear preference",
  "Neither",
];

function sortResponsesByGroup(
  responses: Array<{ label: string; count: number; percentage: number }>,
) {
  return [...responses].sort((a, b) => {
    const ia = OPTION_ORDER.indexOf(a.label);
    const ib = OPTION_ORDER.indexOf(b.label);
    if (ia === -1 && ib === -1) return a.label.localeCompare(b.label);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

/** One row per question, 100% stacked by option. Expects preferences already sorted by orderIndex with responses sorted by group. */
function buildStackedBarData(preferences: PreferenceResponse[]) {
  const maxOptions = Math.max(
    ...preferences.map((p) => p.responses.length),
    1,
  ) as number;

  return preferences.map((pref) => {
    const row: Record<string, unknown> = {
      name: `Q${pref.orderIndex}`,
      questionText: pref.questionText,
      responseLabels: pref.responses.map((r) => r.label),
      responsePcts: pref.responses.map((r) => r.percentage),
      responseCounts: pref.responses.map((r) => r.count),
    };
    for (let i = 0; i < maxOptions; i++) {
      row[`opt${i}`] = pref.responses[i]?.percentage ?? 0;
    }
    return row;
  });
}

export function PreferenceCharts({ preferences }: PreferenceChartsProps) {
  const sorted = useMemo(
    () =>
      [...preferences]
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((p) => ({ ...p, responses: sortResponsesByGroup(p.responses) })),
    [preferences],
  );

  const barData = useMemo(() => buildStackedBarData(sorted), [sorted]);
  const maxOptions = useMemo(
    () => Math.max(...sorted.map((p) => p.responses.length), 1),
    [sorted],
  );

  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {
      name: { label: "Question" },
      questionText: { label: "Question text" },
    };
    for (let i = 0; i < maxOptions; i++) {
      config[`opt${i}`] = {
        label: `Option ${i + 1}`,
        color: optionColors[i % optionColors.length],
      };
    }
    return config;
  }, [maxOptions]);

  if (preferences.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preference responses</CardTitle>
        <CardDescription>
          100% stacked by question — compare distributions at a glance. Hover
          for option labels and counts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className='mx-auto h-[280px] w-full max-w-2xl'
        >
          <BarChart
            layout='vertical'
            data={barData}
            margin={{ left: 8, right: 8 }}
          >
            <XAxis type='number' domain={[0, 100]} unit='%' hide />
            <YAxis
              type='category'
              dataKey='name'
              width={32}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_value, payload) => {
                    const p = payload[0]?.payload;
                    const text =
                      (p?.questionText as string) ||
                      `Question ${(p?.name as string) ?? ""}`;
                    return (
                      <p className='max-w-[240px] truncate text-xs text-muted-foreground'>
                        {text}
                      </p>
                    );
                  }}
                  formatter={(value, name, item) => {
                    const payload = item.payload as Record<string, unknown>;
                    const labels = (payload.responseLabels as string[]) ?? [];
                    const pcts = (payload.responsePcts as number[]) ?? [];
                    const counts = (payload.responseCounts as number[]) ?? [];
                    const idx = Number(String(name).replace("opt", ""));
                    const label = labels[idx] ?? `Option ${idx + 1}`;
                    const pct = pcts[idx] ?? Number(value);
                    const count = counts[idx] ?? 0;
                    return (
                      <div className='flex items-center gap-2 text-xs'>
                        <span className='font-medium'>
                          {label.length > 24 ? label.slice(0, 24) + "…" : label}
                          :
                        </span>
                        <span>
                          {Number(pct).toFixed(1)}% ({count} responses)
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            {Array.from({ length: maxOptions }, (_, i) => (
              <Bar
                key={`opt${i}`}
                dataKey={`opt${i}`}
                stackId='pref'
                radius={0}
                fill={optionColors[i % optionColors.length]}
              >
                {barData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}-${i}`}
                    fill={optionColors[i % optionColors.length]}
                  />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ChartContainer>

        {/* Per-question breakdown list */}
        <div className='mt-6 space-y-6'>
          {sorted.map((preference) => {
            const colorMap: Record<string, string> = {};
            preference.responses.forEach((item, idx) => {
              colorMap[item.label] = optionColors[idx % optionColors.length];
            });
            return (
              <div key={preference.questionId} className='space-y-2'>
                <p className='text-sm font-medium'>
                  Q{preference.orderIndex}: {preference.questionText}
                </p>
                <div className='space-y-1.5 pl-2'>
                  {preference.responses.map((response) => (
                    <div
                      key={response.label}
                      className='flex items-center justify-between text-sm'
                    >
                      <div className='flex items-center gap-2'>
                        <div
                          className='h-3 w-3 shrink-0 rounded-sm'
                          style={{
                            backgroundColor:
                              colorMap[response.label] ?? "var(--chart-1)",
                          }}
                        />
                        <span className='text-muted-foreground'>
                          {response.label}
                        </span>
                      </div>
                      <span className='font-medium'>
                        {response.percentage.toFixed(1)}% ({response.count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
