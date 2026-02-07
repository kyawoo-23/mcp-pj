"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function RefreshButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Update refresh query param to trigger refetch in AnalysisData
    // Read searchParams on demand instead of subscribing (best practice 5.1)
    const params = new URLSearchParams(window.location.search);
    params.set("refresh", Date.now().toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    
    // Reset refreshing state after a short delay
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Data refreshed successfully");
    }, 500);
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
