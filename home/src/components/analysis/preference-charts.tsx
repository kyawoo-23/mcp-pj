"use client";

import { Pie, PieChart, Cell } from "recharts";
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
  ChartLegend,
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

// Generate colors for options
const optionColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function PreferenceCharts({ preferences }: PreferenceChartsProps) {
  return (
    <div className='grid gap-6 md:grid-cols-2'>
      {preferences
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((preference) => {
          const chartData = preference.responses.map((item) => ({
            option: item.label,
            count: item.count,
            percentage: item.percentage,
          }));

          // Create chart config with dynamic colors
          // Note: We use direct color values for Cell components, not CSS variables
          const chartConfig: ChartConfig = {};
          const colorMap: Record<string, string> = {};
          preference.responses.forEach((item, idx) => {
            const color = optionColors[idx % optionColors.length];
            chartConfig[item.label] = {
              label: item.label,
              color: color,
            };
            colorMap[item.label] = color;
          });

          return (
            <Card key={preference.questionId}>
              <CardHeader>
                <CardTitle className='text-lg'>
                  Question {preference.orderIndex}
                </CardTitle>
                <CardDescription>{preference.questionText}</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={chartConfig}
                  className='mx-auto aspect-square max-h-[300px]'
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          hideLabel
                          formatter={(_value, name, item) => {
                            const nameStr = String(name);
                            return (
                              <div className='flex items-center gap-2 text-xs'>
                                <span className='font-medium'>
                                  {nameStr.length > 20
                                    ? nameStr.slice(0, 20) + "…"
                                    : nameStr}
                                  :
                                </span>
                                <span>
                                  {item.payload.percentage.toFixed(1)}% (
                                  {item.payload.count} responses)
                                </span>
                              </div>
                            );
                          }}
                        />
                      }
                    />
                    <Pie
                      data={chartData}
                      dataKey='percentage'
                      nameKey='option'
                      innerRadius={60}
                    >
                      {chartData.map((entry, idx) => (
                        <Cell
                          key={entry.option}
                          fill={
                            colorMap[entry.option] ||
                            optionColors[idx % optionColors.length]
                          }
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>

                {/* Show percentage breakdown as text */}
                <div className='mt-4 space-y-2'>
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
                              colorMap[response.label] || "var(--chart-1)",
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
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
