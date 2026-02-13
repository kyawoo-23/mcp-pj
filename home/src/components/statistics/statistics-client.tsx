"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisPayload } from "@/lib/types";
import {
  filterPayloadToCompletedUsers,
  filterPayloadByDemographics,
} from "@/lib/analysis-calculations";
import { revalidateAnalysisAction } from "@/app/actions/analysis";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import {
  DemographicFilterBar,
  type DemographicFilterValue,
} from "@/components/analysis/demographic-filter-bar";
import { PairedStatisticsSection } from "@/components/analysis/paired-statistics-section";

type StatisticsClientProps = {
  initialData: AnalysisPayload | null;
  initialError: string | null;
};

export function StatisticsClient({
  initialData: data,
  initialError: error,
}: StatisticsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Always filter to completed users first
  const completedPayload = useMemo(
    () => (data ? filterPayloadToCompletedUsers(data) : null),
    [data],
  );

  const completedCount = completedPayload?.profiles.length ?? 0;

  // Demographic filters
  const [demographicFilters, setDemographicFilters] = useState<
    DemographicFilterValue[]
  >([]);

  const effectivePayload = useMemo(() => {
    if (!completedPayload) return null;
    const validFilters = demographicFilters.filter(
      (f) => f.dimension && f.values?.length > 0,
    );
    if (validFilters.length > 0) {
      return filterPayloadByDemographics(completedPayload, validFilters);
    }
    return completedPayload;
  }, [completedPayload, demographicFilters]);

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

  if (!data || !completedPayload) {
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
    <div className='space-y-6'>
      {/* Participants info */}
      <div className='flex items-center gap-3 flex-wrap'>
        <Badge variant='secondary' className='gap-1.5 text-sm py-1 px-3'>
          <Users className='h-3.5 w-3.5' />
          {completedCount} completed participant
          {completedCount !== 1 ? "s" : ""}
        </Badge>
        {demographicFilters.length > 0 && effectivePayload && (
          <Badge variant='outline' className='text-sm py-1 px-3'>
            {effectivePayload.profiles.length} after filters
          </Badge>
        )}
      </div>

      {/* Demographic Filters */}
      <DemographicFilterBar
        filters={demographicFilters}
        onFiltersChange={setDemographicFilters}
        filteredCount={
          demographicFilters.length > 0
            ? effectivePayload?.profiles.length
            : undefined
        }
        effectivePayload={effectivePayload}
        activeTab='completed'
      />

      {/* Paired Statistics */}
      {effectivePayload && (
        <PairedStatisticsSection payload={effectivePayload} />
      )}
    </div>
  );
}
