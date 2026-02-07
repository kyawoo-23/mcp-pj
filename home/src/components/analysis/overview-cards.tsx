"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CountUp } from "@/components/ui/count-up";
import { Users, Trophy, GlobeX, Pickaxe } from "lucide-react";

interface UserMetrics {
  totalUsers: number;
  neverLoggedIn: number;
  inProgress: number;
  completedAllTasks: number;
}

interface OverviewCardsProps {
  metrics: UserMetrics;
}

export function OverviewCards({ metrics }: OverviewCardsProps) {
  const getPercentage = (value: number) => {
    if (metrics.totalUsers === 0) return "0%";
    return `${Math.round((value / metrics.totalUsers) * 100)}%`;
  };

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card className='relative overflow-hidden'>
        <div className='absolute right-2 top-2 text-muted-foreground/10'>
          <Users className='h-8 w-8' />
        </div>
        <CardHeader className='pb-2'>
          <CardDescription className='font-medium'>Total Users</CardDescription>
          <CardTitle className='text-3xl font-bold'>
            <CountUp to={metrics.totalUsers} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-xs'>
            Total registered participants
          </p>
        </CardContent>
      </Card>

      <Card className='relative overflow-hidden'>
        <div className='absolute right-2 top-2 text-muted-foreground/10'>
          <GlobeX className='h-8 w-8' />
        </div>
        <CardHeader className='pb-2'>
          <div className='flex items-center gap-2'>
            <CardDescription className='font-medium'>
              Never Logged In
            </CardDescription>
            <span className='bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-bold'>
              {getPercentage(metrics.neverLoggedIn)}
            </span>
          </div>
          <CardTitle className='text-3xl font-bold'>
            <CountUp to={metrics.neverLoggedIn} delay={100} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-xs'>
            Registered but never accessed
          </p>
        </CardContent>
      </Card>

      <Card className='relative overflow-hidden'>
        <div className='absolute right-2 top-2 text-muted-foreground/10'>
          <Pickaxe className='h-8 w-8' />
        </div>
        <CardHeader className='pb-2'>
          <div className='flex items-center gap-2'>
            <CardDescription className='font-medium'>
              In Progress
            </CardDescription>
            <span className='bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-bold'>
              {getPercentage(metrics.inProgress)}
            </span>
          </div>
          <CardTitle className='text-3xl font-bold'>
            <CountUp to={metrics.inProgress} delay={200} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-xs'>
            Currently active on tasks
          </p>
        </CardContent>
      </Card>

      <Card className='relative overflow-hidden'>
        <div className='absolute right-2 top-2 text-muted-foreground/10'>
          <Trophy className='h-8 w-8' />
        </div>
        <CardHeader className='pb-2'>
          <div className='flex items-center gap-2'>
            <CardDescription className='font-medium'>All Done</CardDescription>
            <span className='bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-bold'>
              {getPercentage(metrics.completedAllTasks)}
            </span>
          </div>
          <CardTitle className='text-3xl font-bold'>
            <CountUp to={metrics.completedAllTasks} delay={300} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-xs'>
            Completed all tasks & surveys
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
