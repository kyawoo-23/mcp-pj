import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { fetchAnalysis } from "@/app/actions/analysis";
import { RefreshButton } from "@/components/analysis/refresh-button";
import { Button } from "@/components/ui/button";
import { AnalysisClient } from "@/components/analysis/analysis-client";
import { AnalysisSkeleton } from "@/components/analysis/analysis-skeleton";
import { calculateUserMetrics } from "@/lib/analysis-calculations";

async function AnalysisContent() {
  const result = await fetchAnalysis();
  const fullMetrics = result.data ? calculateUserMetrics(result.data) : null;
  return (
    <AnalysisClient
      initialData={result.data}
      initialError={result.error}
      metrics={fullMetrics}
    />
  );
}

export default function AnalysisPage() {
  return (
    <div className='container mx-auto max-w-7xl px-4 py-8'>
      <Button
        variant='ghost'
        size='sm'
        className='mb-6 -ml-2 text-muted-foreground'
        asChild
      >
        <Link href='/'>
          <ChevronLeft className='mr-1 h-4 w-4' />
          Back to Research
        </Link>
      </Button>

      <div className='mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold'>Research Analysis Dashboard</h1>
          <p className='text-sm text-muted-foreground mt-2'>
            Comprehensive analysis of user data, survey results, and system
            preferences
          </p>
        </div>
        <RefreshButton />
      </div>

      <Suspense fallback={<AnalysisSkeleton />}>
        <AnalysisContent />
      </Suspense>
    </div>
  );
}
