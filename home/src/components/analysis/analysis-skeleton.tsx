import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Skeleton for just the dashboard content (used during tab transitions)
export function DashboardContentSkeleton() {
  return (
    <div className='space-y-12 animate-pulse'>
      {/* Demographics Charts Skeleton */}
      <section>
        <Skeleton className='h-8 w-64 mb-4' />
        <div className='grid gap-4 grid-cols-1 lg:grid-cols-2'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className='flex flex-col'>
              <CardHeader>
                <Skeleton className='h-6 w-3/4 mx-auto' />
              </CardHeader>
              <CardContent className='flex-1 flex items-center justify-center min-h-[200px]'>
                <Skeleton className='h-[150px] w-[150px] rounded-full' />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Survey Results Skeleton */}
      <section>
        <Skeleton className='h-8 w-64 mb-4' />
        <div className='grid gap-6 md:grid-cols-2'>
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className='h-6 w-1/2 mb-2' />
                <Skeleton className='h-4 w-3/4' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-[300px] w-full' />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Preference Questions Skeleton */}
      <section>
        <Skeleton className='h-8 w-72 mb-4' />
        <div className='grid gap-6 md:grid-cols-2'>
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className='h-6 w-1/2 mb-2' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-[250px] w-full' />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Task Duration Skeleton */}
      <section>
        <Skeleton className='h-8 w-72 mb-4' />
        <div className='grid gap-6 md:grid-cols-2'>
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className='h-6 w-1/2 mb-2' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-[300px] w-full' />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

export function AnalysisSkeleton() {
  return (
    <div className='container mx-auto max-w-7xl px-4 py-8 pointer-events-none'>
      {/* Header Skeleton handled by page.tsx, but good to have some spacing if needed */}
      <div className='space-y-6'>
        {/* Overview Cards Skeleton */}
        <section className='mb-12'>
          <Skeleton className='h-8 w-48 mb-4' /> {/* "Overview" title */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    <Skeleton className='h-4 w-24' />
                  </CardTitle>
                  <Skeleton className='h-4 w-4' />
                </CardHeader>
                <CardContent>
                  <Skeleton className='h-8 w-16 mb-1' />
                  <Skeleton className='h-3 w-32' />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Tabs Skeleton */}
        <div className='w-full'>
          <Skeleton className='h-12 w-full rounded-lg mb-8' /> {/* Tabs List */}
          {/* Tab Content Skeleton */}
          <div className='space-y-12'>
            {/* Demographics Charts Skeleton */}
            <section>
              <Skeleton className='h-8 w-64 mb-4' />
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className='flex flex-col'>
                    <CardHeader>
                      <Skeleton className='h-6 w-3/4 mx-auto' />
                    </CardHeader>
                    <CardContent className='flex-1 flex items-center justify-center min-h-[200px]'>
                      <Skeleton className='h-[150px] w-[150px] rounded-full' />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Survey Results Skeleton */}
            <section>
              <Skeleton className='h-8 w-64 mb-4' />
              <div className='grid gap-6 md:grid-cols-2'>
                {Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className='h-6 w-1/2 mb-2' />
                      <Skeleton className='h-4 w-3/4' />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className='h-[300px] w-full' />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
