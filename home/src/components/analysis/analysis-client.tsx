"use client";

import { useMemo, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { AnalysisPayload } from "@/lib/types";
import {
  calculateDemographics,
  calculateSurveyScoresBySystem,
  calculatePreferenceResponses,
  calculateTaskDurations,
  filterPayloadToCompletedUsers,
} from "@/lib/analysis-calculations";
import { revalidateAnalysisAction } from "@/app/actions/analysis";
import { TaskDurationCharts } from "@/components/analysis/task-duration-charts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OverviewCards } from "@/components/analysis/overview-cards";
import { DemographicsCharts } from "@/components/analysis/demographics-charts";
import { SurveyScoresCharts } from "@/components/analysis/survey-scores-charts";
import { PreferenceCharts } from "@/components/analysis/preference-charts";
import { CircleCheck, Database, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DashboardContentSkeleton } from "@/components/analysis/analysis-skeleton";

type AnalysisClientProps = {
  initialData: AnalysisPayload | null;
  initialError: string | null;
  metrics: {
    totalUsers: number;
    neverLoggedIn: number;
    inProgress: number;
    completedAllTasks: number;
  } | null;
};

// Dashboard content component that accepts a payload and renders all sections
function DashboardContent({ payload }: { payload: AnalysisPayload }) {
  // Memoize heavy calculations so they only run when payload changes
  const taskDurations = useMemo(
    () => calculateTaskDurations(payload),
    [payload],
  );
  const demographics = useMemo(() => calculateDemographics(payload), [payload]);
  const surveyScores = useMemo(
    () => calculateSurveyScoresBySystem(payload),
    [payload],
  );
  const preferences = useMemo(
    () => calculatePreferenceResponses(payload),
    [payload],
  );

  return (
    <>
      {/* Demographics */}
      <section className='mb-12'>
        <h2 className='text-2xl font-semibold mb-4'>User Demographics</h2>
        <DemographicsCharts demographics={demographics} />
      </section>

      {/* Survey Results */}
      <section className='mb-12'>
        <h2 className='text-2xl font-semibold mb-4'>Survey Results</h2>
        <SurveyScoresCharts surveyScores={surveyScores} />
      </section>

      {/* Preference Questions */}
      <section className='mb-12'>
        <h2 className='text-2xl font-semibold mb-4'>
          Final Questions & Preferences
        </h2>
        <PreferenceCharts preferences={preferences} />
      </section>

      {/* Task Performance Duration */}
      <section className='mb-12'>
        <div className='flex items-center gap-2 mb-4'>
          <h2 className='text-2xl font-semibold'>Task Performance Duration</h2>
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

export function AnalysisClient({
  initialData: data,
  initialError: error,
  metrics,
}: AnalysisClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const activeTab = searchParams.get("tab") || "all";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const filteredData = useMemo(
    () => (data ? filterPayloadToCompletedUsers(data) : null),
    [data],
  );

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => {
              startTransition(async () => {
                await revalidateAnalysisAction();
                router.refresh();
              });
            }}
            disabled={isPending}
            variant='outline'
          >
            {isPending ? "Retrying..." : "Retry"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Data</CardTitle>
          <CardDescription>No analysis data available.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      {/* Overview Cards (always using full data) */}
      <section className='mb-12'>
        <h2 className='text-2xl font-semibold mb-4'>Overview</h2>
        <OverviewCards metrics={metrics} />
      </section>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-2 h-12'>
          <TabsTrigger
            value='all'
            className='gap-2 text-base py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground group'
          >
            <Database className='w-4 h-4 hidden md:block' />
            <span className='text-sm md:text-base'>ALL DATA</span>
            <Badge
              variant='secondary'
              className='ml-1 px-1.5 py-0 text-[10px] h-4 min-w-5 justify-center transition-colors group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground'
            >
              {metrics.totalUsers}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value='completed'
            className='gap-2 text-base py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground group'
          >
            <CircleCheck className='w-4 h-4 hidden md:block' />
            <span className='text-sm md:text-base'>COMPLETED ONLY</span>
            <Badge
              variant='secondary'
              className='ml-1 px-1.5 py-0 text-[10px] h-4 min-w-5 justify-center transition-colors group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground'
            >
              {metrics.completedAllTasks}
            </Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value='all' className='mt-8'>
          {isPending ? (
            <DashboardContentSkeleton />
          ) : (
            <DashboardContent payload={data} />
          )}
        </TabsContent>
        <TabsContent value='completed' className='mt-8'>
          {isPending ? (
            <DashboardContentSkeleton />
          ) : (
            <DashboardContent payload={filteredData!} />
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
