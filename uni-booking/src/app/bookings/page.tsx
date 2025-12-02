import { Suspense } from "react";
import { getUserBookings } from "@/app/actions/bookings";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import BookingsClient from "./bookings-client";

async function BookingsList() {
  const { data: bookings, error } = await getUserBookings();

  if (error) {
    return (
      <Card>
        <CardContent className='py-10 text-center text-destructive'>
          {error}
        </CardContent>
      </Card>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardContent className='py-10 text-center text-muted-foreground'>
          You don&apos;t have any bookings yet.
        </CardContent>
      </Card>
    );
  }

  return <BookingsClient bookings={bookings} />;
}

export default function BookingsPage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>My Bookings</h1>
        <p className='text-muted-foreground mt-2'>
          View and manage your facility bookings
        </p>
      </div>

      <Suspense
        fallback={
          <div className='flex items-center justify-center py-12'>
            <div className='flex flex-col items-center gap-4'>
              <Spinner size='lg' />
              <p className='text-sm text-muted-foreground'>
                Loading bookings...
              </p>
            </div>
          </div>
        }
      >
        <BookingsList />
      </Suspense>
    </div>
  );
}
