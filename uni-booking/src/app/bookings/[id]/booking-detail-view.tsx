"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, X } from "lucide-react";
import { cancelBooking } from "@/app/actions/bookings";
import type { FacilityBookingWithDetails } from "@/lib/types";
import { formatDate, formatTimeRange } from "@/lib/utils/date";

interface BookingDetailViewProps {
  booking: FacilityBookingWithDetails;
}

export default function BookingDetailView({ booking }: BookingDetailViewProps) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCancel =
    booking.status === "pending" || booking.status === "confirmed";

  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500",
    confirmed: "bg-green-500/10 text-green-600 dark:text-green-500",
    cancelled: "bg-gray-500/10 text-gray-600 dark:text-gray-500",
    completed: "bg-blue-500/10 text-blue-600 dark:text-blue-500",
  };

  const handleCancel = async () => {
    setIsCancelDialogOpen(false);
    setError(null);
    setCancelling(true);

    try {
      const result = await cancelBooking(booking.id);

      if (result.error) {
        setError(result.error);
        toast.error("Failed to cancel booking", {
          description: result.error,
        });
      } else {
        toast.success("Booking cancelled successfully");
        if (result.taskCompleted) {
          toast.success("Task completed: Cancel a booking");
        }
        router.push("/bookings");
        router.refresh();
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to cancel booking";
      setError(errorMessage);
      toast.error("Failed to cancel booking", {
        description: errorMessage,
      });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div>
              <CardTitle>{booking.facilities.name}</CardTitle>
              <CardDescription className='flex items-center gap-2 mt-1'>
                <MapPin className='h-4 w-4' />
                {booking.facilities.building}
                {booking.facilities.room_number &&
                  ` - Room ${booking.facilities.room_number}`}
              </CardDescription>
            </div>
            <Badge className={statusColors[booking.status]}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-sm'>
              <Calendar className='h-4 w-4 text-muted-foreground' />
              <span className='font-medium'>Date: </span>
              <span>{formatDate(booking.booking_date)}</span>
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <Clock className='h-4 w-4 text-muted-foreground' />
              <span className='font-medium'>Time: </span>
              <span>
                {formatTimeRange(booking.start_time, booking.end_time)}
              </span>
            </div>
            {booking.purpose && (
              <div className='text-sm pt-2'>
                <span className='font-medium'>Purpose: </span>
                <p className='text-muted-foreground mt-1'>{booking.purpose}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && <div className='text-sm text-destructive'>{error}</div>}

      <div className='flex justify-end gap-2'>
        {canCancel && (
          <>
            <Button
              variant='destructive'
              onClick={() => setIsCancelDialogOpen(true)}
              disabled={cancelling}
            >
              <X className='h-4 w-4 mr-1' />
              {cancelling ? "Cancelling..." : "Cancel Booking"}
            </Button>

            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
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
                    onClick={() => setIsCancelDialogOpen(false)}
                    disabled={cancelling}
                  >
                    Keep Booking
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    {cancelling ? "Cancelling..." : "Yes, Cancel Booking"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
        <div className='flex gap-2'>
          <Button variant='outline' onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
