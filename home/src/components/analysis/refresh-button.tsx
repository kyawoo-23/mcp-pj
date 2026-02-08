"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { revalidateAnalysisAction } from "@/app/actions/analysis";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(async () => {
      const result = await revalidateAnalysisAction();
      if (result.ok) {
        router.refresh();
        toast.success("Data refreshed successfully");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isPending}
      variant='outline'
      className='w-full md:w-auto'
    >
      <RefreshCw
        className={`w-4 h-4 mr-2 ${isPending ? "animate-spin" : ""}`}
      />
      {isPending ? "Refreshing..." : "Refresh Data"}
    </Button>
  );
}
