import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResearchClient } from "@/components/research/research-client";
import { ResearchProtocolSwitcher } from "@/components/research/research-protocol-switcher";
import { ResearchV2EmptyState } from "@/components/research/research-v2-empty-state";
import { calculateUserMetricsFromPayload } from "@/lib/analysis-calculations";
import { getResearchPayload } from "@/lib/research-data";
import { PROTOCOL_META } from "@/lib/study-protocol-labels";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ResearchPageProps = {
  searchParams: Promise<{ protocol?: string }>;
};

export default async function ResearchPage({ searchParams }: ResearchPageProps) {
  const { protocol: protocolParam } = await searchParams;
  const { version, payload, v2Available } =
    await getResearchPayload(protocolParam);
  const meta = PROTOCOL_META[version];

  const metrics = payload
    ? calculateUserMetricsFromPayload(payload, { isFiltered: true })
    : null;

  return (
    <div className='min-h-screen bg-linear-to-b from-background to-muted/30'>
      <div className='container mx-auto max-w-6xl px-4 py-6 sm:py-10'>
        <Button
          variant='ghost'
          size='sm'
          className='mb-8 -ml-2 text-muted-foreground hover:text-foreground transition-colors'
          asChild
        >
          <Link href='/'>
            <ChevronLeft className='mr-1 h-4 w-4' />
            Back to Home
          </Link>
        </Button>

        <ResearchProtocolSwitcher
          activeVersion={version}
          v2Available={v2Available}
        />

        {/* Hero Section */}
        <header
          className={cn(
            "mb-12 rounded-lg border-b border-l-4 px-5 py-6 sm:px-6 sm:py-8",
            meta.bannerClass,
          )}
        >
          <div className='flex flex-wrap items-center gap-2 mb-3'>
            <Badge variant='secondary' className='text-xs'>
              Research Paper
            </Badge>
            <Badge variant='outline' className={cn("text-xs", meta.badgeClass)}>
              {meta.title}
            </Badge>
            {version === "v1_simple" && (
              <Badge variant='outline' className='text-xs text-muted-foreground'>
                February 5–18, 2026
              </Badge>
            )}
          </div>
          <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight mb-4'>
            Comparing Intent-Driven and Interface-Driven Interaction
          </h1>
          <p className='text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl'>
            An empirical study of Traditional UI and Conversational AI using the
            Model Context Protocol (MCP), evaluating usability, cognitive
            workload, psychological experience, and user preference.
          </p>
          {metrics && (
            <div className='flex flex-wrap gap-6 mt-6 text-sm'>
              <div className='flex flex-col'>
                <span className='text-muted-foreground text-xs uppercase tracking-wider font-medium'>
                  Total Participants
                </span>
                <span className='text-2xl font-bold tabular-nums'>
                  {metrics.startedUsers}
                </span>
              </div>
              <div className='flex flex-col'>
                <span className='text-muted-foreground text-xs uppercase tracking-wider font-medium'>
                  Completed
                </span>
                <span className='text-2xl font-bold tabular-nums'>
                  {metrics.completedAllTasks}
                </span>
              </div>
              <div className='flex flex-col'>
                <span className='text-muted-foreground text-xs uppercase tracking-wider font-medium'>
                  Completion Rate
                </span>
                <span className='text-2xl font-bold tabular-nums'>
                  {metrics.startedUsers > 0
                    ? `${((metrics.completedAllTasks / metrics.startedUsers) * 100).toFixed(0)}%`
                    : "—"}
                </span>
              </div>
            </div>
          )}
        </header>

        {!payload ? (
          <ResearchV2EmptyState />
        ) : (
          <>
            {/* Table of Contents */}
            <nav className='mb-12 rounded-xl border bg-card p-5'>
              <h2 className='text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3'>
                Contents
              </h2>
              <ul className='grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm'>
                <li>
                  <a
                    href='#empirical-comparison'
                    className='text-foreground hover:text-primary transition-colors hover:underline underline-offset-4'
                  >
                    Empirical Comparison
                  </a>
                </li>
                <li className='pl-4 text-muted-foreground'>
                  <a
                    href='#system-usability'
                    className='hover:text-foreground transition-colors'
                  >
                    A. System Usability
                  </a>
                </li>
                <li className='pl-4 text-muted-foreground'>
                  <a
                    href='#cognitive-workload'
                    className='hover:text-foreground transition-colors'
                  >
                    B. Cognitive Workload
                  </a>
                </li>
                <li className='pl-4 text-muted-foreground'>
                  <a
                    href='#psychological-experience'
                    className='hover:text-foreground transition-colors'
                  >
                    C. Psychological Experience
                  </a>
                </li>
                <li className='pl-4 text-muted-foreground'>
                  <a
                    href='#system-preference'
                    className='hover:text-foreground transition-colors'
                  >
                    D. System Preference
                  </a>
                </li>
                <li className='pl-4 text-muted-foreground'>
                  <a
                    href='#task-preference'
                    className='hover:text-foreground transition-colors'
                  >
                    E. Task-Based Preference
                  </a>
                </li>
                <li>
                  <a
                    href='#demographics'
                    className='text-foreground hover:text-primary transition-colors hover:underline underline-offset-4'
                  >
                    User Demographics
                  </a>
                </li>
                <li>
                  <a
                    href='#task-duration'
                    className='text-foreground hover:text-primary transition-colors hover:underline underline-offset-4'
                  >
                    Task Performance Duration
                  </a>
                </li>
              </ul>
            </nav>

            <ResearchClient
              protocolVersion={version}
              data={payload}
              metrics={metrics!}
            />
          </>
        )}
      </div>
    </div>
  );
}
