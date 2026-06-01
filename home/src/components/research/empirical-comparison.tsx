"use client";

import { useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
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
import { Badge } from "@/components/ui/badge";
import { ResearchDataDialog } from "@/components/research/research-data-dialog";
import { Sparkles } from "lucide-react";
import { SystemTypes } from "@/lib/constants";
import type { AnalysisPayload } from "@/lib/types";
import {
  computeEmpiricalData,
  type EmpiricalData,
  type TLXRadarDataPoint,
  type SDTComparisonDataPoint,
} from "@/lib/empirical-calculations";

// ============================================================================
// Helpers
// ============================================================================

const radarChartConfig: ChartConfig = {
  chat: { label: SystemTypes.chat_agent, color: "var(--chat)" },
  traditional: { label: SystemTypes.traditional, color: "var(--traditional)" },
};

const susChartConfig: ChartConfig = {
  chat: { label: SystemTypes.chat_agent, color: "var(--chat)" },
  traditional: { label: SystemTypes.traditional, color: "var(--traditional)" },
};

function SectionBlock({
  id,
  badge,
  title,
  description,
  children,
}: {
  id: string;
  badge: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className='scroll-mt-20'>
      <div className='mb-5'>
        <Badge variant='outline' className='mb-2 text-xs font-mono'>
          {badge}
        </Badge>
        <h3 className='text-xl sm:text-2xl font-semibold tracking-tight'>
          {title}
        </h3>
        <p className='text-sm text-muted-foreground leading-relaxed mt-1 max-w-3xl'>
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

/** Styled callout for analysis findings. */
function FindingCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className='rounded-lg border-l-4 border-l-primary/40 bg-muted/40 px-5 py-4 mt-5'>
      <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5'>
        Key Finding
      </p>
      <p className='text-sm leading-relaxed text-foreground/80'>{children}</p>
    </div>
  );
}

// ============================================================================
// A. System Usability
// ============================================================================

function SUSBarChart({ data }: { data: EmpiricalData }) {
  const chartData = useMemo(() => {
    const tradRow = data.sus.find((r) => r.systemType === "traditional");
    const chatRow = data.sus.find((r) => r.systemType === "chat_agent");

    return [
      {
        population: "All Participants",
        traditional: Number(tradRow?.allMean ?? 0).toFixed(1),
        chat: Number(chatRow?.allMean ?? 0).toFixed(1),
      },
      {
        population: "3+ Yrs Programming",
        traditional: Number(tradRow?.advancedMean ?? 0).toFixed(1),
        chat: Number(chatRow?.advancedMean ?? 0).toFixed(1),
      },
    ];
  }, [data.sus]);

  return (
    <Card className='overflow-hidden shadow-sm border bg-white'>
      <CardHeader className='pb-0 pt-0'>
        <CardTitle className='text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center'>
          Comparison of SUS Scores
        </CardTitle>
      </CardHeader>
      <CardContent className='pb-0'>
        <ChartContainer
          config={susChartConfig}
          className='mx-auto aspect-video max-h-[220px] w-full container'
        >
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis
              dataKey='population'
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              fontSize={11}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={11}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='line' />}
            />
            <Bar
              dataKey='chat'
              fill='var(--color-chat)'
              radius={[4, 4, 0, 0]}
              barSize={32}
            />
            <Bar
              dataKey='traditional'
              fill='var(--color-traditional)'
              radius={[4, 4, 0, 0]}
              barSize={32}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function SUSSection({ data }: { data: EmpiricalData }) {
  const chatRow = data.sus.find((r) => r.systemType === "chat_agent");
  const tradRow = data.sus.find((r) => r.systemType === "traditional");

  return (
    <SectionBlock
      id='system-usability'
      badge='Section A'
      title='System Usability'
      description='Mean SUS scores were calculated and compared across systems and participant populations to evaluate system usability.'
    >
      <div className='grid grid-cols-1 xl:grid-cols-5 gap-6'>
        <div className='xl:col-span-3'>
          <Card className='h-full'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base'>
                Table IV — Mean SUS Scores by System and Population
              </CardTitle>
              <CardDescription>Scale: 0–100, higher is better</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b bg-muted/30'>
                      <th className='text-left py-3 px-4 font-medium text-muted-foreground'>
                        System
                      </th>
                      <th className='text-right py-3 px-4 font-medium text-muted-foreground'>
                        All Participants
                        <span className='block text-[10px] font-normal'>
                          N = {data.allCount}
                        </span>
                      </th>
                      <th className='text-right py-3 px-4 font-medium text-muted-foreground'>
                        3+ Yrs Programming
                        <span className='block text-[10px] font-normal'>
                          N = {data.advancedCount}
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className='border-b hover:bg-muted/20 transition-colors'>
                      <td className='py-3.5 px-4 font-medium flex items-center gap-2'>
                        <span
                          className='inline-block h-2.5 w-2.5 rounded-full shrink-0'
                          style={{ backgroundColor: "var(--chat)" }}
                        />
                        {SystemTypes.chat_agent}
                      </td>
                      <td className='text-right py-3.5 px-4 font-mono text-base'>
                        {chatRow?.allMean.toFixed(1) ?? "—"}
                      </td>
                      <td className='text-right py-3.5 px-4 font-mono text-base'>
                        {chatRow?.advancedMean.toFixed(1) ?? "—"}
                      </td>
                    </tr>
                    <tr className='hover:bg-muted/20 transition-colors'>
                      <td className='py-3.5 px-4 font-medium flex items-center gap-2'>
                        <span
                          className='inline-block h-2.5 w-2.5 rounded-full shrink-0'
                          style={{ backgroundColor: "var(--traditional)" }}
                        />
                        {SystemTypes.traditional}
                      </td>
                      <td className='text-right py-3.5 px-4 font-mono text-base'>
                        {tradRow?.allMean.toFixed(1) ?? "—"}
                      </td>
                      <td className='text-right py-3.5 px-4 font-mono text-base'>
                        {tradRow?.advancedMean.toFixed(1) ?? "—"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='xl:col-span-2'>
          <SUSBarChart data={data} />
        </div>
      </div>

      <FindingCallout>
        While the Traditional UI received higher overall usability ratings,
        participants with 3+ years of programming experience preferred the
        Chat-Agent, which reached acceptable usability thresholds for this
        group. Experienced programmers appear better equipped to leverage
        intent-driven conversational workflows.
      </FindingCallout>
    </SectionBlock>
  );
}

// ============================================================================
// B. Cognitive Workload
// ============================================================================

function TLXRadar({
  data,
  title,
}: {
  data: TLXRadarDataPoint[];
  title: string;
}) {
  return (
    <Card className='overflow-hidden'>
      <CardHeader className='pb-0'>
        <CardTitle className='text-sm font-medium text-center'>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='pb-4'>
        <ChartContainer
          config={radarChartConfig}
          className='mx-auto aspect-square max-h-[380px] min-w-0 overflow-visible'
        >
          <RadarChart
            data={data}
            margin={{ top: 32, right: 44, bottom: 32, left: 44 }}
            outerRadius='65%'
            startAngle={120}
            endAngle={-240}
          >
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className='w-48'
                  indicator='line'
                  formatter={(value, name) => {
                    const label =
                      radarChartConfig[name as keyof typeof radarChartConfig]
                        ?.label || name;
                    const num =
                      typeof value === "number"
                        ? value
                        : parseFloat(String(value));
                    return `${label}: ${num.toFixed(1)}`;
                  }}
                />
              }
            />
            <PolarAngleAxis dataKey='dimension' tick={{ fontSize: 11 }} />
            <PolarGrid radialLines={false} />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 80]}
              tick={{ fontSize: 10 }}
            />
            <Radar
              dataKey='chat'
              fill='var(--color-chat)'
              fillOpacity={0.08}
              stroke='var(--color-chat)'
              strokeWidth={2}
            />
            <Radar
              dataKey='traditional'
              fill='var(--color-traditional)'
              fillOpacity={0.08}
              stroke='var(--color-traditional)'
              strokeWidth={2}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function TLXSection({ data }: { data: EmpiricalData }) {
  return (
    <SectionBlock
      id='cognitive-workload'
      badge='Section B'
      title='Cognitive Workload'
      description='Cognitive workload was assessed using the Raw-TLX across six workload dimensions.'
    >
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <TLXRadar
          data={data.tlx.all}
          title={`All Participants (N = ${data.allCount})`}
        />
        <TLXRadar
          data={data.tlx.advanced}
          title={`3+ Yrs Programming (N = ${data.advancedCount})`}
        />
      </div>

      <p className='text-xs text-muted-foreground italic mt-3'>
        *Performance: higher value = better self-assessed task performance (not
        reverse-coded in this dimension view).
      </p>

      <FindingCallout>
        The Chat-Agent imposes a higher cognitive load on general users, notably
        increasing mental demand and frustration. In contrast, advanced users
        show significantly better adaptability, with workload levels paritying
        the traditional interface and even showing reduced frustration.
      </FindingCallout>
    </SectionBlock>
  );
}

// ============================================================================
// C. Psychological Experience (SDT)
// ============================================================================

function SDTRadar({
  data,
  title,
}: {
  data: SDTComparisonDataPoint[];
  title: string;
}) {
  return (
    <Card className='overflow-hidden'>
      <CardHeader className='pb-0'>
        <CardTitle className='text-sm font-medium text-center'>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='pb-4'>
        <ChartContainer
          config={radarChartConfig}
          className='mx-auto aspect-square max-h-[380px] min-w-0 overflow-visible'
        >
          <RadarChart
            data={data}
            margin={{ top: 32, right: 44, bottom: 32, left: 44 }}
            outerRadius='65%'
          >
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className='w-48'
                  indicator='line'
                  formatter={(value, name) => {
                    const label =
                      radarChartConfig[name as keyof typeof radarChartConfig]
                        ?.label || name;
                    const num =
                      typeof value === "number"
                        ? value
                        : parseFloat(String(value));
                    return `${label}: ${num.toFixed(2)}`;
                  }}
                />
              }
            />
            <PolarAngleAxis dataKey='construct' tick={{ fontSize: 11 }} />
            <PolarGrid radialLines={false} />
            <PolarRadiusAxis
              angle={30}
              domain={[1, 7]}
              tick={{ fontSize: 10 }}
            />
            <Radar
              dataKey='chat'
              fill='var(--color-chat)'
              fillOpacity={0.08}
              stroke='var(--color-chat)'
              strokeWidth={2}
            />
            <Radar
              dataKey='traditional'
              fill='var(--color-traditional)'
              fillOpacity={0.08}
              stroke='var(--color-traditional)'
              strokeWidth={2}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function SDTSection({ data }: { data: EmpiricalData }) {
  return (
    <SectionBlock
      id='psychological-experience'
      badge='Section C'
      title='Psychological Experience'
      description='Psychological experience was evaluated using questionnaire items derived from Self-Determination Theory (SDT), measuring Autonomy, Competence, Performance Satisfaction, and System Satisfaction.'
    >
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <SDTRadar
          data={data.sdt.all}
          title={`All Participants (N = ${data.allCount})`}
        />
        <SDTRadar
          data={data.sdt.advanced}
          title={`3+ Yrs Programming (N = ${data.advancedCount})`}
        />
      </div>

      <FindingCallout>
        General participants reported higher autonomy and competence with the
        Traditional UI, while advanced users felt more empowered and efficient
        using the Chat-Agent. Despite these gains, overall satisfaction remained
        higher for the Traditional UI, highlighting a disconnect between
        interaction flexibility and outcome confidence.
      </FindingCallout>
    </SectionBlock>
  );
}

// ============================================================================
// D. System Preference
// ============================================================================

const prefChartConfig: ChartConfig = {
  chatAll: { label: "Chat-Agent (All)", color: "var(--chat)" },
  chatAdv: {
    label: "Chat-Agent (Advanced)",
    color: "color-mix(in oklch, var(--chat) 45%, transparent)",
  },
  tradAll: { label: "Traditional UI (All)", color: "var(--traditional)" },
  tradAdv: {
    label: "Traditional UI (Advanced)",
    color: "color-mix(in oklch, var(--traditional) 45%, transparent)",
  },
  bothAll: { label: "Both Equally (All)", color: "var(--chart-3)" },
  bothAdv: {
    label: "Both Equally (Advanced)",
    color: "color-mix(in oklch, var(--chart-3) 45%, transparent)",
  },
};

function PreferenceGroupedBarChart({ data }: { data: EmpiricalData }) {
  const chartData = useMemo(() => {
    const labelMap: Record<number, string> = {
      1: "More in control",
      2: "Clearer actions",
      3: "More predictable",
      4: "Trust without supervision",
    };

    return data.preferences.map((q) => {
      const getVal = (
        responses: { label: string; percentage: number }[],
        label: string,
      ) => responses.find((r) => r.label === label)?.percentage || 0;

      return {
        category: labelMap[q.orderIndex] || q.shortLabel,
        chatAll: getVal(q.allResponses, "Chat-based system"),
        tradAll: getVal(q.allResponses, "Traditional UI"),
        bothAll: getVal(q.allResponses, "Both equally"),
        chatAdv: getVal(q.advancedResponses, "Chat-based system"),
        tradAdv: getVal(q.advancedResponses, "Traditional UI"),
        bothAdv: getVal(q.advancedResponses, "Both equally"),
      };
    });
  }, [data.preferences]);

  return (
    <Card className='overflow-hidden shadow-sm border bg-white dark:bg-card'>
      <CardContent className='p-2 sm:p-6 pb-2'>
        <ChartContainer
          config={prefChartConfig}
          className='w-full aspect-4/3 sm:aspect-2/1 min-h-[350px] overflow-visible'
        >
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 0, left: -10, bottom: 60 }}
            barGap={4}
          >
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis
              dataKey='category'
              tickLine={false}
              axisLine={false}
              tickMargin={20}
              fontSize={11}
              fontWeight={500}
              angle={-15}
              textAnchor='end'
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={11}
              label={{
                value: "Percentage (%)",
                angle: -90,
                position: "insideLeft",
                offset: 20,
                style: {
                  fontSize: 13,
                  fontWeight: 500,
                  fill: "hsl(var(--muted-foreground))",
                },
              }}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.2 }}
              content={<ChartTooltipContent indicator='dot' />}
            />

            <ChartLegend
              content={<ChartLegendContent />}
              verticalAlign='top'
              wrapperStyle={{ paddingBottom: "20px" }}
            />

            {/* Stack 1: All Participants */}
            <Bar dataKey='chatAll' stackId='all' fill='var(--color-chatAll)' />
            <Bar dataKey='tradAll' stackId='all' fill='var(--color-tradAll)' />
            <Bar dataKey='bothAll' stackId='all' fill='var(--color-bothAll)' />

            {/* Stack 2: Advanced Participants */}
            <Bar dataKey='chatAdv' stackId='adv' fill='var(--color-chatAdv)' />
            <Bar dataKey='tradAdv' stackId='adv' fill='var(--color-tradAdv)' />
            <Bar dataKey='bothAdv' stackId='adv' fill='var(--color-bothAdv)' />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function PreferenceSection({ data }: { data: EmpiricalData }) {
  return (
    <SectionBlock
      id='system-preference'
      badge='Section D'
      title='System Preference'
      description='User preferences were evaluated through comparative survey questions measuring perceived control, predictability, clarity of system actions, and trust.'
    >
      <div className='mt-6 mb-6'>
        <PreferenceGroupedBarChart data={data} />
      </div>

      <FindingCallout>
        Control and trust remain strongly associated with the Traditional UI for
        all users. However, we see a clear preference shift among advanced
        users, who favor the Chat-Agent for its superior clarity and
        predictability compared to traditional methods.
      </FindingCallout>
    </SectionBlock>
  );
}

// ============================================================================
// E. Task-Based Interaction Preference
// ============================================================================

function TaskPreferenceSection({ data }: { data: EmpiricalData }) {
  return (
    <SectionBlock
      id='task-preference'
      badge='Section E'
      title='Task-Based Interaction Preference'
      description='Participants were asked which interaction modality they would prefer depending on the task.'
    >
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base'>
            Table V — Task-Based System Preference by Participant Group
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b bg-muted/30'>
                  <th className='text-left py-3 px-4 font-medium text-muted-foreground'>
                    Preference
                  </th>
                  <th className='text-right py-3 px-4 font-medium text-muted-foreground'>
                    All Participants
                  </th>
                  <th className='text-right py-3 px-4 font-medium text-muted-foreground'>
                    Advanced
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.taskPreference.map((row, i) => (
                  <tr
                    key={row.label}
                    className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${
                      i === 0 ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className='py-3.5 px-4'>{row.label}</td>
                    <td className='text-right py-3.5 px-4 font-mono text-base'>
                      {row.allPercentage > 0
                        ? `${row.allPercentage.toFixed(0)}%`
                        : "—"}
                    </td>
                    <td className='text-right py-3.5 px-4 font-mono text-base'>
                      {row.advancedPercentage > 0
                        ? `${row.advancedPercentage.toFixed(0)}%`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <FindingCallout>
        Users across all skill levels overwhelmingly prefer a hybrid interaction
        model. While general users still lean heavily on traditional UIs, the
        data suggests conversational agents are most effective as specialized
        supplements rather than total replacements.
      </FindingCallout>
    </SectionBlock>
  );
}

// ============================================================================
// Main Component
// ============================================================================

interface EmpiricalComparisonProps {
  payload: AnalysisPayload;
}

export function EmpiricalComparison({ payload }: EmpiricalComparisonProps) {
  const data = useMemo(() => computeEmpiricalData(payload), [payload]);

  return (
    <div id='empirical-comparison' className='scroll-mt-20'>
      <div className='mb-10'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <Badge
                variant='secondary'
                className='rounded-full px-3 py-1 text-[10px] h-auto uppercase tracking-wider font-semibold bg-primary/10 text-primary border-none'
              >
                <Sparkles className='w-3 h-3 mr-1' />
                Research Insights
              </Badge>
            </div>
            <h2 className='text-3xl sm:text-4xl font-bold tracking-tight text-foreground'>
              Empirical Comparison
            </h2>
          </div>
          <div className='flex items-center gap-3'>
            <ResearchDataDialog data={payload} />
          </div>
        </div>

        <p className='text-base sm:text-lg text-muted-foreground leading-relaxed max-w-4xl'>
          This stage of our study compares the traditional graphical interface
          and the MCP-based conversational system across usability, cognitive
          workload, psychological experience, and user preference for{" "}
          <span className='text-foreground font-semibold'>
            all completed participants (N={data.allCount})
          </span>{" "}
          and a specialized subgroup with{" "}
          <span className='text-foreground font-semibold'>
            3+ years of programming experience (N={data.advancedCount})
          </span>
          .
        </p>
      </div>

      <div className='space-y-16'>
        <SUSSection data={data} />
        <TLXSection data={data} />
        <SDTSection data={data} />
        <PreferenceSection data={data} />
        <TaskPreferenceSection data={data} />
      </div>
    </div>
  );
}
