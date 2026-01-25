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
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
        <TabsList>
          <TabsTrigger value="all">All ({bookingsByStatus.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({bookingsByStatus.pending})</TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmed ({bookingsByStatus.confirmed})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({bookingsByStatus.cancelled})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({bookingsByStatus.completed})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancelClick}
              />
            ))}
          </div>
          {filteredBookings.length === 0 && (
            <div className="py-10 text-center text-muted-foreground">
              No bookings found for this status.
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!bookingToCancel} onOpenChange={(open) => !open && setBookingToCancel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBookingToCancel(null)}
              disabled={isCancelling}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
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

