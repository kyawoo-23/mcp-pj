"use client";

import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/utils";
import { Users, Trophy, GlobeX, Pickaxe, type LucideIcon } from "lucide-react";

interface UserMetrics {
  totalUsers: number;
  startedUsers: number;
  neverLoggedIn: number;
  inProgress: number;
  completedAllTasks: number;
}

interface OverviewCardsProps {
  metrics: UserMetrics;
}

function getPercentage(value: number, base: number) {
  if (base === 0) return 0;
  return Math.round((value / base) * 100);
}

type MetricTone = "neutral" | "muted" | "amber" | "emerald";

const TONE_STYLES: Record<MetricTone, { icon: string; badge: string }> = {
  neutral: {
    icon: "bg-primary/10 text-primary",
    badge: "bg-primary/10 text-primary",
  },
  muted: {
    icon: "bg-muted text-muted-foreground",
    badge: "bg-muted text-muted-foreground",
  },
  amber: {
    icon: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    badge: "bg-amber-500/10 text-amber-800 dark:text-amber-300",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  },
};

function MetricStat({
  label,
  value,
  icon: Icon,
  tone,
  pct,
  delay = 0,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: MetricTone;
  pct?: number;
  delay?: number;
}) {
  const styles = TONE_STYLES[tone];

  return (
    <div className='flex min-w-0 items-center gap-3 px-3 py-2.5'>
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-md",
          styles.icon,
        )}
      >
        <Icon className='size-3.5' aria-hidden />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex items-baseline gap-1.5'>
          <p className='text-lg font-semibold tracking-tight tabular-nums leading-none'>
            <CountUp to={value} delay={delay} />
          </p>
          {pct !== undefined ? (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums leading-none",
                styles.badge,
              )}
            >
              {pct}%
            </span>
          ) : null}
        </div>
        <p className='mt-0.5 truncate text-xs text-muted-foreground'>{label}</p>
      </div>
    </div>
  );
}

function GroupHeader({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className='border-b border-border/70 bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground'>
      <span className='font-medium text-foreground/80'>{title}</span>
      <span className='text-muted-foreground/70'> · {detail}</span>
    </div>
  );
}

export function OverviewCards({ metrics }: OverviewCardsProps) {
  const started = metrics.startedUsers;

  return (
    <div className='overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs'>
      <div className='grid grid-cols-1 divide-y divide-border/70 lg:grid-cols-2 lg:divide-x lg:divide-y-0'>
        <section className='min-w-0'>
          <GroupHeader title='Account-wide' detail='all protocols' />
          <div className='grid grid-cols-2 divide-x divide-border/70'>
            <MetricStat
              label='Total users'
              value={metrics.totalUsers}
              icon={Users}
              tone='neutral'
            />
            <MetricStat
              label='Never logged in'
              value={metrics.neverLoggedIn}
              icon={GlobeX}
              tone='muted'
              pct={getPercentage(metrics.neverLoggedIn, metrics.totalUsers)}
              delay={80}
            />
          </div>
        </section>

        <section className='min-w-0'>
          <GroupHeader
            title='This protocol'
            detail={`${started.toLocaleString()} started`}
          />
          <div className='grid grid-cols-2 divide-x divide-border/70'>
            <MetricStat
              label='In progress'
              value={metrics.inProgress}
              icon={Pickaxe}
              tone='amber'
              pct={getPercentage(metrics.inProgress, started)}
              delay={160}
            />
            <MetricStat
              label='All done'
              value={metrics.completedAllTasks}
              icon={Trophy}
              tone='emerald'
              pct={getPercentage(metrics.completedAllTasks, started)}
              delay={240}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
