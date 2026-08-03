"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, LayoutGrid, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StudyProtocolVersion } from "@/lib/analysis-calculations";
import { PROTOCOL_META, PROTOCOL_VERSIONS } from "@/lib/study-protocol-labels";
import { cn } from "@/lib/utils";

type AnalysisProtocolSwitcherProps = {
  activeVersion: StudyProtocolVersion;
};

export function AnalysisProtocolSwitcher({
  activeVersion,
}: AnalysisProtocolSwitcherProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' className='text-muted-foreground'>
          <Shuffle className='mr-1 h-4 w-4' />
          Change version
          <ChevronDown className='ml-1 h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-56'>
        {PROTOCOL_VERSIONS.map((version) => {
          const meta = PROTOCOL_META[version];
          const isActive = version === activeVersion;

          return (
            <DropdownMenuItem
              key={version}
              onSelect={() => {
                if (!isActive) {
                  router.push(meta.analysisPath);
                }
              }}
            >
              <Check
                className={cn("h-4 w-4", isActive ? "opacity-100" : "opacity-0")}
              />
              <span className='flex-1'>{meta.title}</span>
              <span className='text-xs text-muted-foreground'>{meta.shortLabel}</span>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href='/analysis' className='flex items-center gap-2'>
            <LayoutGrid className='h-4 w-4 text-muted-foreground' />
            All versions
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
