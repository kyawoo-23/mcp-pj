"use client";

import { useMemo } from "react";
import type { AnalysisPayload } from "@/lib/types";
import {
  calculateDemographics,
  calculateTaskDurations,
  filterPayloadToCompletedUsers,
  filterPayloadByDemographics,
  type StudyProtocolVersion,
} from "@/lib/analysis-calculations";
import type { SkillChartMode } from "@/components/analysis/demographics-charts";
import { TaskDurationCharts } from "@/components/analysis/task-duration-charts";
import { EmpiricalComparison } from "@/components/research/empirical-comparison";
import { DemographicsCharts } from "@/components/analysis/demographics-charts";
import { getAdvancedSubgroupCopy } from "@/lib/empirical-calculations";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ResearchClientProps = {
  protocolVersion: StudyProtocolVersion;
  data: AnalysisPayload;
  metrics: {
    totalUsers: number;
    neverLoggedIn: number;
    inProgress: number;
    completedAllTasks: number;
  };
};

export function ResearchClient({
  protocolVersion,
  data,
}: ResearchClientProps) {
  const skillChartMode: SkillChartMode =
    protocolVersion === "v1_simple" ? "technical" : "programming";
  const advancedSubgroupCopy = getAdvancedSubgroupCopy(protocolVersion);

  const advancedCriteria = useMemo(
    () =>
      protocolVersion === "v1_simple"
        ? [{ dimension: "technical_proficiency" as const, values: ["advanced"] }]
        : [
            {
              dimension: "programming_experience" as const,
              values: ["three_plus_years"],
            },
          ],
    [protocolVersion],
  );

  const completedPayload = useMemo(
    () => filterPayloadToCompletedUsers(data),
    [data],
  );

  const advancedPayload = useMemo(
    () => filterPayloadByDemographics(completedPayload, advancedCriteria),
    [completedPayload, advancedCriteria],
  );

  const taskDurations = useMemo(
    () => calculateTaskDurations(completedPayload),
    [completedPayload],
  );
  const demographicsAll = useMemo(
    () => calculateDemographics(completedPayload),
    [completedPayload],
  );
  const demographicsAdvanced = useMemo(
    () => calculateDemographics(advancedPayload),
    [advancedPayload],
  );

  return (
    <>
      {/* Empirical Comparison */}
      <section className='mb-16'>
        <EmpiricalComparison payload={data} protocolVersion={protocolVersion} />
      </section>

      {/* Demographics */}
      <section id='demographics' className='mb-16 scroll-mt-20'>
        <h2 className='text-2xl sm:text-3xl font-bold tracking-tight mb-6'>User Demographics</h2>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All Participants (N={completedPayload.profiles.length})
            </TabsTrigger>
            <TabsTrigger value="advanced">
              {advancedSubgroupCopy.tabLabel} (N={advancedPayload.profiles.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-0">
            <DemographicsCharts
              demographics={demographicsAll}
              skillChartMode={skillChartMode}
            />
          </TabsContent>
          <TabsContent value="advanced" className="mt-0">
            <DemographicsCharts
              demographics={demographicsAdvanced}
              skillChartMode={skillChartMode}
            />
          </TabsContent>
        </Tabs>
      </section>

      {/* Task Performance Duration */}
      <section id='task-duration' className='mb-16 scroll-mt-20'>
        <div className='flex items-center gap-2 mb-4'>
          <h2 className='text-2xl sm:text-3xl font-bold tracking-tight'>Task Performance Duration</h2>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type='button'
                className='inline-flex items-center justify-center rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                aria-label='How task duration is calculated'
              >
                <Info className='h-5 w-5' />
              </button>
            </PopoverTrigger>
            <PopoverContent side='bottom' align='start' className='max-w-sm'>
              <p className='text-sm'>
                Task durations longer than 1 hour are considered noise and are
                excluded from the calculation.
              </p>
            </PopoverContent>
          </Popover>
        </div>
        <TaskDurationCharts durations={taskDurations} />
      </section>
    </>
  );
}
