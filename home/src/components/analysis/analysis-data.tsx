import { Suspense } from "react";
import { fetchAnalysis } from "@/app/actions/analysis";
import { AnalysisClient } from "@/components/analysis/analysis-client";
import { calculateUserMetrics } from "@/lib/analysis-calculations";
import { DashboardContentSkeleton } from "@/components/analysis/analysis-skeleton";

export async function AnalysisData() {
  const { data, error } = await fetchAnalysis();
  const fullMetrics = data ? calculateUserMetrics(data) : null;

  return (
    <Suspense fallback={<DashboardContentSkeleton />}>
      <AnalysisClient
        initialData={data}
        initialError={error}
        metrics={fullMetrics}
      />
    </Suspense>
  );
}
