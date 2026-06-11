import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { fetchProtocolCompletionCounts } from "@/app/actions/analysis";
import { ProtocolVersionPicker } from "@/components/analysis/protocol-version-picker";
import { Button } from "@/components/ui/button";

export default async function AnalysisPage() {
  const result = await fetchProtocolCompletionCounts();
  const completedCounts = result.data ?? undefined;

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

      <header className='mb-10 text-center max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold tracking-tight'>Research Analysis</h1>
        <p className='text-muted-foreground mt-2'>
          Choose a study protocol version to view results.
        </p>
        {result.error && (
          <p className='text-sm text-destructive mt-2'>{result.error}</p>
        )}
      </header>

      <ProtocolVersionPicker completedCounts={completedCounts} />
    </div>
  );
}
