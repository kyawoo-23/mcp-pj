"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookingCard } from "@/components/bookings/booking-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cancelBooking } from "@/app/actions/bookings";
import type { FacilityBookingWithDetails } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface BookingsClientProps {
  bookings: FacilityBookingWithDetails[];
}

export default function BookingsClient({ bookings }: BookingsClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelClick = (id: string) => {
    setBookingToCancel(id);
  };

  const confirmCancel = async () => {
    if (!bookingToCancel) return;

    setIsCancelling(true);
    setError(null);

    const result = await cancelBooking(bookingToCancel);

    if (result.error) {
      setError(result.error);
      toast.error("Failed to cancel booking", {
        description: result.error,
      });
    } else {
      toast.success("Booking cancelled successfully");
      router.refresh();
    }

    setIsCancelling(false);
    setBookingToCancel(null);
  };

  const filteredBookings = useMemo(() => {
    if (selectedStatus === "all") return bookings;
    return bookings.filter((booking) => booking.status === selectedStatus);
  }, [bookings, selectedStatus]);

  const bookingsByStatus = useMemo(() => {
    const groups: Record<string, number> = {
      all: bookings.length,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
    };

    bookings.forEach((booking) => {
      groups[booking.status] = (groups[booking.status] || 0) + 1;
    });

    return groups;
  }, [bookings]);

  return (
    <div className='space-y-4'>
      {error && (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
        <TabsList className='h-auto flex-wrap gap-1 sm:gap-0 sm:flex-nowrap'>
          <TabsTrigger value='all' className='text-xs sm:text-sm'>
            All ({bookingsByStatus.all})
          </TabsTrigger>
          <TabsTrigger value='pending' className='text-xs sm:text-sm'>
            Pending ({bookingsByStatus.pending})
          </TabsTrigger>
          <TabsTrigger value='confirmed' className='text-xs sm:text-sm'>
            Confirmed ({bookingsByStatus.confirmed})
          </TabsTrigger>
          <TabsTrigger value='cancelled' className='text-xs sm:text-sm'>
            Cancelled ({bookingsByStatus.cancelled})
          </TabsTrigger>
          <TabsTrigger value='completed' className='text-xs sm:text-sm'>
            Completed ({bookingsByStatus.completed})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className='mt-6'>
          <div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancelClick}
              />
            ))}
          </div>
          {filteredBookings.length === 0 && (
            <div className='py-10 text-center text-muted-foreground'>
              No bookings found for this status.
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!bookingToCancel}
        onOpenChange={(open) => !open && setBookingToCancel(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setBookingToCancel(null)}
              disabled={isCancelling}
            >
              Keep Booking
            </Button>
            <Button
              variant='destructive'
              onClick={confirmCancel}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Yes, Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
