import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { fetchAnalysis } from "@/app/actions/analysis";
import { RefreshButton } from "@/components/analysis/refresh-button";
import { Button } from "@/components/ui/button";
import { StatisticsClient } from "@/components/statistics/statistics-client";
import { AnalysisSkeleton } from "@/components/analysis/analysis-skeleton";
async function StatisticsContent() {
  const result = await fetchAnalysis({ protocolVersion: "v2_criteria" });
  return (
    <StatisticsClient initialData={result.data} initialError={result.error} />
  );
}

export default function StatisticsPage() {
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
          <h1 className='text-3xl font-bold'>Paired Statistical Analysis</h1>
          <p className='text-sm text-muted-foreground mt-2'>
            Within-subject hypothesis testing for completed participants. Paired
            t-tests and Cohen&apos;s d across all constructs.
          </p>
        </div>
        <RefreshButton />
      </div>

      <Suspense fallback={<AnalysisSkeleton />}>
        <StatisticsContent />
      </Suspense>
    </div>
  );
}
