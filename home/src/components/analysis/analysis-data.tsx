"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchAnalysisClient } from "@/lib/analysis-client";
import { AnalysisClient } from "@/components/analysis/analysis-client";
import { calculateUserMetrics } from "@/lib/analysis-calculations";
import { DashboardContentSkeleton } from "@/components/analysis/analysis-skeleton";
import type { AnalysisPayload } from "@/lib/types";

export function AnalysisData() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<AnalysisPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Watch for refresh trigger in query params
  const refreshKey = searchParams.get("refresh");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      const result = await fetchAnalysisClient();
      
      if (result.error) {
        // If unauthorized, redirect to login
        if (result.error.includes("Not authenticated") || result.error.includes("Unauthorized")) {
          router.push("/auth/login");
          return;
        }
        setError(result.error);
      } else {
        setData(result.data);
      }
      setLoading(false);
    }

    loadData();
    // router is stable, only refreshKey triggers refetch (best practice 5.3)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  if (loading) {
    return <DashboardContentSkeleton />;
  }

  const fullMetrics = data ? calculateUserMetrics(data) : null;

  return (
    <AnalysisClient
      initialData={data}
      initialError={error}
      metrics={fullMetrics}
    />
  );
}
