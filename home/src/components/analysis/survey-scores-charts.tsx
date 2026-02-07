"use client";

import { useState, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
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
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  SystemTypes,
  getSystemTypeLabel,
  SYSTEM_TYPE_KEYS,
} from "@/lib/constants";

interface SurveyScores {
  sus: Array<{ systemType: string; mean: number; scores: number[] }>;
  rawTlx: Array<{ systemType: string; mean: number; scores: number[] }>;
  sdt: Array<{
    systemType: string;
    autonomy: number;
    competence: number;
    performanceSatisfaction: number;
    systemSatisfaction: number;
  }>;
}

interface SurveyScoresChartsProps {
  surveyScores: SurveyScores;
}

function calculateStdDev(scores: number[]): number {
  if (scores.length === 0) return 0;
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance =
    scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
    scores.length;
  return Math.sqrt(variance);
}

export function SurveyScoresCharts({ surveyScores }: SurveyScoresChartsProps) {
  const [susExpanded, setSusExpanded] = useState(false);
  const [tlxExpanded, setTlxExpanded] = useState(false);
  const [sdtExpanded, setSdtExpanded] = useState(false);

  // Memoize chart data so toggling collapsibles doesn't recalc
  // SUS Chart Data
  const susData = useMemo(
    () =>
      surveyScores.sus.map((item) => ({
        system: getSystemTypeLabel(item.systemType),
        mean: item.mean,
        stdDev: calculateStdDev(item.scores),
        count: item.scores.length,
      })),
    [surveyScores.sus],
  );

  const susChartConfig: ChartConfig = {
    mean: { label: "Mean SUS Score", color: "var(--chart-1)" },
    chat: { label: SystemTypes.chat_agent, color: "var(--chat)" },
    traditional: {
      label: SystemTypes.traditional,
      color: "var(--traditional)",
    },
  };

  // Raw TLX Chart Data
  const tlxData = useMemo(
    () =>
      surveyScores.rawTlx.map((item) => ({
        system: getSystemTypeLabel(item.systemType),
        mean: item.mean,
        stdDev: calculateStdDev(item.scores),
        count: item.scores.length,
      })),
    [surveyScores.rawTlx],
  );

  const tlxChartConfig: ChartConfig = {
    mean: { label: "Mean Raw TLX Score", color: "var(--chart-2)" },
    chat: { label: SystemTypes.chat_agent, color: "var(--chat)" },
    traditional: {
      label: SystemTypes.traditional,
      color: "var(--traditional)",
    },
  };

  // SDT Radar Chart Data (order sets axis positions: System Satisfaction and Autonomy swapped)
  type SdtRadarDataPoint = {
    subject: string;
    fullMark: number;
    chat: number;
    traditional: number;
  };

  const sdtRadarData = useMemo((): SdtRadarDataPoint[] => {
    const dims = [
      { subject: "System Satisfaction", fullMark: 7 },
      { subject: "Competence", fullMark: 7 },
      { subject: "Performance Satisfaction", fullMark: 7 },
      { subject: "Autonomy", fullMark: 7 },
    ];
    const chatSystem = surveyScores.sdt.find(
      (s) => s.systemType === SYSTEM_TYPE_KEYS[0],
    );
    const traditionalSystem = surveyScores.sdt.find(
      (s) => s.systemType === SYSTEM_TYPE_KEYS[1],
    );
    return dims.map((dim): SdtRadarDataPoint => {
      const dataPoint: SdtRadarDataPoint = {
        subject: dim.subject,
        fullMark: dim.fullMark,
        chat: 0,
        traditional: 0,
      };
      if (dim.subject === "Autonomy") {
        dataPoint.chat = chatSystem?.autonomy || 0;
        dataPoint.traditional = traditionalSystem?.autonomy || 0;
      } else if (dim.subject === "Competence") {
        dataPoint.chat = chatSystem?.competence || 0;
        dataPoint.traditional = traditionalSystem?.competence || 0;
      } else if (dim.subject === "Performance Satisfaction") {
        dataPoint.chat = chatSystem?.performanceSatisfaction || 0;
        dataPoint.traditional = traditionalSystem?.performanceSatisfaction || 0;
      } else if (dim.subject === "System Satisfaction") {
        dataPoint.chat = chatSystem?.systemSatisfaction || 0;
        dataPoint.traditional = traditionalSystem?.systemSatisfaction || 0;
      }
      return dataPoint;
    });
  }, [surveyScores.sdt]);

  const sdtChartConfig: ChartConfig = {
    chat: {
      label: SystemTypes.chat_agent,
      color: "var(--chat)",
    },
    traditional: {
      label: SystemTypes.traditional,
      color: "var(--traditional)",
    },
  };

  return (
    <div className='space-y-8'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {/* SUS Score */}
        <Card>
          <CardHeader>
            <CardTitle>System Usability Scale (SUS)</CardTitle>
            <CardDescription>
              Mean SUS scores by system type (scale: 0-100, higher is better)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={susChartConfig}
              className='min-h-[300px] w-full'
            >
              <BarChart accessibilityLayer data={susData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='system'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={[0, 100]}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, props) => {
                        const data = props.payload as (typeof susData)[0];
                        const numValue =
                          typeof value === "number"
                            ? value
                            : parseFloat(String(value));
                        return [
                          `${numValue.toFixed(1)} (±${data.stdDev.toFixed(1)}) `,
                          `Mean SUS Score (n=${data.count})`,
                        ];
                      }}
                    />
                  }
                />
                <Bar dataKey='mean' radius={4}>
                  {susData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        entry.system === SystemTypes.chat_agent
                          ? "var(--color-chat)"
                          : "var(--color-traditional)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>

            <Collapsible open={susExpanded} onOpenChange={setSusExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant='ghost' className='mt-4 w-full justify-between'>
                  <span>How SUS is calculated</span>
                  {susExpanded ? (
                    <ChevronUp className='h-4 w-4' />
                  ) : (
                    <ChevronDown className='h-4 w-4' />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className='mt-2'>
                <div className='text-muted-foreground rounded-lg border bg-muted/50 p-4 text-sm'>
                  <p className='mb-2 font-medium'>SUS Calculation Formula:</p>
                  <ul className='list-disc space-y-1 pl-5'>
                    <li>
                      SUS uses 10 items on a Likert scale of 1-5 (Strongly
                      Disagree to Strongly Agree)
                    </li>
                    <li>
                      <strong>Odd items</strong> (1, 3, 5, 7, 9): contribution ={" "}
                      <code>score - 1</code>
                    </li>
                    <li>
                      <strong>Even items</strong> (2, 4, 6, 8, 10): contribution
                      = <code>5 - score</code>
                    </li>
                    <li>
                      Sum all 10 contributions, then multiply by 2.5:{" "}
                      <code>SUS = sum × 2.5</code>
                    </li>
                    <li>Final score ranges from 0-100 (higher is better)</li>
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Raw NASA-TLX Score */}
        <Card>
          <CardHeader>
            <CardTitle>NASA Task Load Index (Raw TLX)</CardTitle>
            <CardDescription>
              Mean workload scores by system type (scale: 0-100, lower is
              better)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={tlxChartConfig}
              className='min-h-[300px] w-full'
            >
              <BarChart accessibilityLayer data={tlxData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='system'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={[0, 100]}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, props) => {
                        const data = props.payload as (typeof tlxData)[0];
                        const numValue =
                          typeof value === "number"
                            ? value
                            : parseFloat(String(value));
                        return [
                          `${numValue.toFixed(1)} (±${data.stdDev.toFixed(1)}) `,
                          `Mean Raw TLX Score (n=${data.count})`,
                        ];
                      }}
                    />
                  }
                />
                <Bar dataKey='mean' radius={4}>
                  {tlxData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        entry.system === SystemTypes.chat_agent
                          ? "var(--color-chat)"
                          : "var(--color-traditional)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>

            <Collapsible open={tlxExpanded} onOpenChange={setTlxExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant='ghost' className='mt-4 w-full justify-between'>
                  <span>How Raw TLX is calculated</span>
                  {tlxExpanded ? (
                    <ChevronUp className='h-4 w-4' />
                  ) : (
                    <ChevronDown className='h-4 w-4' />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className='mt-2'>
                <div className='text-muted-foreground rounded-lg border bg-muted/50 p-4 text-sm'>
                  <p className='mb-2 font-medium'>
                    Raw TLX Calculation Formula:
                  </p>
                  <ul className='list-disc space-y-1 pl-5'>
                    <li>
                      Raw TLX measures workload across 6 dimensions (0-100
                      scale):
                    </li>
                    <li>
                      1. Mental Demand, 2. Physical Demand, 3. Temporal Demand,
                      4. Performance, 5. Effort, 6. Frustration
                    </li>
                    <li>
                      <strong>Performance</strong> (dimension 4) is
                      reverse-coded: <code>100 - performance_score</code>
                    </li>
                    <li>
                      Raw TLX = average of all 6 values:{" "}
                      <code>
                        (mental + physical + temporal + (100-performance) +
                        effort + frustration) / 6
                      </code>
                    </li>
                    <li>Final score ranges from 0-100 (lower is better)</li>
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </div>

      {/* SDT Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Self-Determination Theory (SDT)</CardTitle>
          <CardDescription>
            Mean subscale scores by system type (scale: 1-7, higher is better)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={sdtChartConfig}
            className='mx-auto aspect-square max-h-[520px] min-w-0 overflow-visible'
          >
            <RadarChart
              data={sdtRadarData}
              margin={{ top: 48, right: 56, bottom: 48, left: 56 }}
              outerRadius='70%'
            >
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent className='w-48' indicator='line' />
                }
              />
              <PolarAngleAxis dataKey='subject' tick={{ fontSize: 12 }} />
              <PolarGrid radialLines={false} />
              <PolarRadiusAxis angle={60} domain={[0, 7]} />
              <Radar
                dataKey='chat'
                fill='var(--color-chat)'
                fillOpacity={0}
                stroke='var(--color-chat)'
                strokeWidth={2}
              />
              <Radar
                dataKey='traditional'
                fill='var(--color-traditional)'
                fillOpacity={0}
                stroke='var(--color-traditional)'
                strokeWidth={2}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </RadarChart>
          </ChartContainer>

          <Collapsible open={sdtExpanded} onOpenChange={setSdtExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant='ghost' className='mt-4 w-full justify-between'>
                <span>How SDT is calculated</span>
                {sdtExpanded ? (
                  <ChevronUp className='h-4 w-4' />
                ) : (
                  <ChevronDown className='h-4 w-4' />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className='mt-2'>
              <div className='text-muted-foreground rounded-lg border bg-muted/50 p-4 text-sm'>
                <p className='mb-2 font-medium'>SDT Calculation Formula:</p>
                <ul className='list-disc space-y-1 pl-5'>
                  <li>
                    SDT measures four subscales using a Likert scale of 1-7:
                  </li>
                  <li>
                    <strong>Autonomy</strong>: Mean of items 1-3 (sense of
                    control and choice)
                  </li>
                  <li>
                    <strong>Competence</strong>: Mean of items 4-6 (feeling
                    capable and effective)
                  </li>
                  <li>
                    <strong>Performance Satisfaction</strong>: Mean of items 7-8
                    (satisfaction with task performance)
                  </li>
                  <li>
                    <strong>System Satisfaction</strong>: Mean of items 9-10
                    (satisfaction with the system)
                  </li>
                  <li>
                    Each subscale score = average of item scores for that
                    subscale
                  </li>
                  <li>Final scores range from 1-7 (higher is better)</li>
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
}
