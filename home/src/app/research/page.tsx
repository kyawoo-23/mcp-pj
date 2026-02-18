import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResearchClient } from "@/components/research/research-client";
import { calculateUserMetrics } from "@/lib/analysis-calculations";
import type { AnalysisPayload } from "@/lib/types";

import rawData from "@/data/research.json";

function getResearchPayload(): AnalysisPayload {
  const wrapper = rawData as Array<{ json_build_object: AnalysisPayload }>;
  return wrapper[0].json_build_object;
}

export default function ResearchPage() {
  const payload = getResearchPayload();
  const metrics = calculateUserMetrics(payload);

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
          Back to Home
        </Link>
      </Button>

      <div className='mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold'>Recorded Data Analysis</h1>
          <p className='text-sm text-muted-foreground mt-2'>
            Analysis of recorded data collected from February 5–18, 2026
          </p>
        </div>
      </div>

      <ResearchClient data={payload} metrics={metrics} />
    </div>
  );
}
