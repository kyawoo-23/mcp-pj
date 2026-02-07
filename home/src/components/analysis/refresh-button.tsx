"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { revalidateAnalysisAction } from "@/app/actions/analysis";
import { toast } from "sonner";

export function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(async () => {
      await revalidateAnalysisAction();
      router.refresh();
      toast.success("Data refreshed successfully");
    });
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      variant='outline'
      className='w-full md:w-auto'
    >
      <RefreshCw
        className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
      />
      {isRefreshing ? "Refreshing..." : "Refresh Data"}
    </Button>
  );
}
