import { fetchAnalysis } from "@/app/actions/analysis";
import { AnalysisClient } from "@/components/analysis/analysis-client";
import { calculateUserMetrics } from "@/lib/analysis-calculations";

/**
 * Server component that fetches analysis data via the Supabase Edge Function
 * on the server side using the server Supabase client.
 *
 * Best practice: data is fetched server-side (no client waterfall),
 * and the server Supabase client automatically forwards the user's
 * auth token to the edge function via `supabase.functions.invoke`.
 */
export async function AnalysisData() {
  const result = await fetchAnalysis();

  const fullMetrics = result.data
    ? calculateUserMetrics(result.data)
    : null;

  return (
    <AnalysisClient
      initialData={result.data}
      initialError={result.error}
      metrics={fullMetrics}
    />
  );
}
