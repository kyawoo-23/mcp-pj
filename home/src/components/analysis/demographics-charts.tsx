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
import {
  getAgeRangeLabel,
  getGenderLabel,
  getProgrammingExperienceLabel,
  getAiToolFrequencyLabel,
} from "@/utils/constants";

// Color palette for pie charts
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface DemographicsData {
  ageRange: Array<{ label: string; count: number; percentage: number }>;
  gender: Array<{ label: string; count: number; percentage: number }>;
  programmingExperience: Array<{
    label: string;
    count: number;
    percentage: number;
  }>;
  aiFrequency: Array<{ label: string; count: number; percentage: number }>;
}

interface DemographicsChartsProps {
  demographics: DemographicsData;
}

// Exclude Unknown / empty demographics from chart data
function excludeUnknown<T extends { label: string }>(items: T[]): T[] {
  return items.filter((item) => item.label.toLowerCase() !== "unknown");
}

export function DemographicsCharts({ demographics }: DemographicsChartsProps) {
  // Prepare chart data (excluding Unknown so only filled-in demographics are shown)
  const ageData = excludeUnknown(demographics.ageRange).map((item) => ({
    label: getAgeRangeLabel(item.label),
    count: item.count,
    percentage: item.percentage,
  }));

  const genderData = excludeUnknown(demographics.gender).map((item) => ({
    label: getGenderLabel(item.label),
    count: item.count,
    percentage: item.percentage,
  }));

  const techData = excludeUnknown(demographics.programmingExperience).map(
    (item) => ({
      label: getProgrammingExperienceLabel(item.label),
      count: item.count,
      percentage: item.percentage,
    }),
  );

  const aiData = excludeUnknown(demographics.aiFrequency).map((item) => ({
    label: getAiToolFrequencyLabel(item.label),
    count: item.count,
    percentage: item.percentage,
  }));

  const chartConfig: ChartConfig = {
    count: {
      label: "Count",
      color: "var(--chart-1)",
    },
    percentage: {
      label: "Percentage",
      color: "var(--chart-2)",
    },
  };

  return (
    <div className='grid gap-6 md:grid-cols-2'>
      {/* Age Range */}
      <Card>
        <CardHeader>
          <CardTitle>Age Range</CardTitle>
          <CardDescription>Distribution of users by age</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className='mx-auto aspect-square max-h-[300px]'
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                formatter={(value, name, item) =>
                  `${name}: ${value} (${item.payload.percentage.toFixed(0)}%)`
                }
                content={<ChartTooltipContent hideLabel className='min-w-40' />}
              />
              <Pie
                data={ageData}
                dataKey='count'
                nameKey='label'
                innerRadius={60}
                strokeWidth={5}
              >
                {ageData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <ChartLegend className='-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center' />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gender */}
      <Card>
        <CardHeader>
          <CardTitle>Gender</CardTitle>
          <CardDescription>Distribution of users by gender</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className='mx-auto aspect-square max-h-[300px]'
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                formatter={(value, name, item) =>
                  `${name}: ${value} (${item.payload.percentage.toFixed(0)}%)`
                }
                content={<ChartTooltipContent hideLabel className='min-w-40' />}
              />
              <Pie
                data={genderData}
                dataKey='count'
                nameKey='label'
                innerRadius={60}
                strokeWidth={5}
              >
                {genderData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <ChartLegend className='-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center' />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Programming Experience */}
      <Card>
        <CardHeader>
          <CardTitle>Programming Experience</CardTitle>
          <CardDescription>
            Distribution of users by years of programming experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className='mx-auto aspect-square max-h-[300px]'
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                formatter={(value, name, item) =>
                  `${name}: ${value} (${item.payload.percentage.toFixed(0)}%)`
                }
                content={<ChartTooltipContent hideLabel className='min-w-40' />}
              />
              <Pie
                data={techData}
                dataKey='count'
                nameKey='label'
                innerRadius={60}
                strokeWidth={5}
              >
                {techData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <ChartLegend className='-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center' />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* AI Usage Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>AI Usage Frequency</CardTitle>
          <CardDescription>How often users use AI tools</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className='mx-auto aspect-square max-h-[300px]'
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                formatter={(value, name, item) =>
                  `${name}: ${value} (${item.payload.percentage.toFixed(0)}%)`
                }
                content={<ChartTooltipContent hideLabel className='min-w-40' />}
              />
              <Pie
                data={aiData}
                dataKey='count'
                nameKey='label'
                innerRadius={60}
                strokeWidth={5}
              >
                {aiData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <ChartLegend className='-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center' />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
