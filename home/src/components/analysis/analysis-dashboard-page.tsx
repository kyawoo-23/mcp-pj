import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { fetchAnalysis } from "@/app/actions/analysis";
import { AnalysisProtocolSwitcher } from "@/components/analysis/analysis-protocol-switcher";
import { RefreshButton } from "@/components/analysis/refresh-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnalysisClient } from "@/components/analysis/analysis-client";
import { AnalysisSkeleton } from "@/components/analysis/analysis-skeleton";
import { calculateUserMetricsFromPayload } from "@/lib/analysis-calculations";
import type { StudyProtocolVersion } from "@/lib/analysis-calculations";
import { PROTOCOL_META } from "@/lib/study-protocol-labels";
import { cn } from "@/lib/utils";

type AnalysisDashboardPageProps = {
  protocolVersion: StudyProtocolVersion;
};

async function AnalysisDashboardContent({
  protocolVersion,
}: AnalysisDashboardPageProps) {
  const result = await fetchAnalysis({ protocolVersion });
  const metrics = result.data
    ? calculateUserMetricsFromPayload(result.data, { isFiltered: true })
    : null;

  return (
    <AnalysisClient
      protocolVersion={protocolVersion}
      initialData={result.data}
      initialError={result.error}
      metrics={metrics}
    />
  );
}

export function AnalysisDashboardPage({
  protocolVersion,
}: AnalysisDashboardPageProps) {
  const meta = PROTOCOL_META[protocolVersion];

  return (
    <div className='container mx-auto max-w-7xl px-4 py-8'>
      <div className='flex flex-wrap items-center gap-2 mb-6'>
        <Button
          variant='ghost'
          size='sm'
          className='-ml-2 text-muted-foreground'
          asChild
        >
          <Link href='/'>
            <ChevronLeft className='mr-1 h-4 w-4' />
            Back to Home
          </Link>
        </Button>
        <AnalysisProtocolSwitcher activeVersion={protocolVersion} />
      </div>

      <div className={cn("mb-8 rounded-lg border-l-4 px-4 py-3", meta.bannerClass)}>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div>
            <div className='flex flex-wrap items-center gap-2 mb-1'>
              <Badge variant='outline' className={cn("text-xs", meta.badgeClass)}>
                {meta.shortLabel}
              </Badge>
              <h1 className='text-3xl font-bold'>{meta.title} Analysis</h1>
            </div>
            <p className='text-sm text-muted-foreground mt-1'>{meta.description}</p>
          </div>
          <RefreshButton />
        </div>
      </div>

      <Suspense fallback={<AnalysisSkeleton />}>
        <AnalysisDashboardContent protocolVersion={protocolVersion} />
      </Suspense>
    </div>
  );
}
