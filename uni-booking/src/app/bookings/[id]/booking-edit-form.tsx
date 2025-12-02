"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { updateBooking, cancelBooking } from "@/app/actions/bookings";
import type { FacilityBookingWithDetails, Facility } from "@/lib/types";
import { formatDate, formatTimeRange, extractTime } from "@/lib/utils/date";
import {
  generateTimeOptions,
  getAvailableEndTimes,
  createStartTimeHandler,
  createEndTimeHandler,
} from "@/lib/utils/booking-form";

const bookingSchema = z.object({
  facility_id: z.string().min(1, "Facility is required"),
  booking_date: z.string().min(1, "Date is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  purpose: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const timeOptions = generateTimeOptions();

interface BookingEditFormProps {
  booking: FacilityBookingWithDetails;
  facilities: Facility[];
}

export default function BookingEditForm({
  booking,
  facilities,
}: BookingEditFormProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(booking.booking_date)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const canEdit =
    booking.status === "pending" || booking.status === "confirmed";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      facility_id: booking.facility_id,
      booking_date: booking.booking_date,
      start_time: extractTime(booking.start_time),
      end_time: extractTime(booking.end_time),
      purpose: booking.purpose || "",
    },
  });

  const startTime = watch("start_time");
  const endTime = watch("end_time");

  // Clear end time if start time is cleared
  useEffect(() => {
    if (!startTime && endTime) {
      setValue("end_time", "");
    }
  }, [startTime, endTime, setValue]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date!);
    if (date) {
      setValue("booking_date", format(date, "yyyy-MM-dd"));
    }
  };

  const handleStartTimeChange = createStartTimeHandler(
    setValue,
    setError,
    endTime
  );

  const handleEndTimeChange = createEndTimeHandler(
    setValue,
    setError,
    startTime
  );

  const onSubmit = async (data: BookingFormData) => {
    if (!canEdit) {
      setError("This booking cannot be edited");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await updateBooking(booking.id, data);

      if (result.error) {
        setError(result.error);
        toast.error("Failed to update booking", {
          description: result.error,
        });
      } else {
        toast.success("Booking updated successfully");
        router.push("/bookings");
        router.refresh();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update booking";
      setError(errorMessage);
      toast.error("Failed to update booking", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

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
        router.push("/bookings");
        router.refresh();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to cancel booking";
      setError(errorMessage);
      toast.error("Failed to cancel booking", {
        description: errorMessage,
      });
    } finally {
      setCancelling(false);
    }
  };

  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500",
    confirmed: "bg-green-500/10 text-green-600 dark:text-green-500",
    cancelled: "bg-gray-500/10 text-gray-600 dark:text-gray-500",
    completed: "bg-blue-500/10 text-blue-600 dark:text-blue-500",
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div>
              <CardTitle>{booking.facilities.name}</CardTitle>
              <CardDescription>
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
            <div className='text-sm'>
              <span className='font-medium'>Date: </span>
              {formatDate(booking.booking_date)}
            </div>
            <div className='text-sm'>
              <span className='font-medium'>Time: </span>
              {formatTimeRange(booking.start_time, booking.end_time)}
            </div>
            {booking.purpose && (
              <div className='text-sm'>
                <span className='font-medium'>Purpose: </span>
                {booking.purpose}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {canEdit && (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Edit Booking</CardTitle>
              <CardDescription>Update your booking details</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='facility_id'>Facility</Label>
                <Select
                  value={watch("facility_id")}
                  onValueChange={(value) => setValue("facility_id", value)}
                >
                  <SelectTrigger id='facility_id'>
                    <SelectValue placeholder='Select a facility' />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities
                      .filter((f) => f.is_active)
                      .map((facility) => (
                        <SelectItem key={facility.id} value={facility.id}>
                          {facility.name} - {facility.building}
                          {facility.room_number &&
                            ` Room ${facility.room_number}`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.facility_id && (
                  <p className='text-sm text-destructive'>
                    {errors.facility_id.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label>Booking Date</Label>
                <Calendar
                  mode='single'
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  className='rounded-md border'
                />
                <input type='hidden' {...register("booking_date")} />
                {errors.booking_date && (
                  <p className='text-sm text-destructive'>
                    {errors.booking_date.message}
                  </p>
                )}
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='start_time'>Start Time</Label>
                  <Select
                    value={startTime}
                    onValueChange={handleStartTimeChange}
                  >
                    <SelectTrigger id='start_time'>
                      <SelectValue placeholder='Select start time' />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.start_time && (
                    <p className='text-sm text-destructive'>
                      {errors.start_time.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='end_time'>End Time</Label>
                  <Select
                    value={endTime}
                    onValueChange={handleEndTimeChange}
                    disabled={!startTime}
                  >
                    <SelectTrigger id='end_time'>
                      <SelectValue
                        placeholder={
                          startTime
                            ? "Select end time"
                            : "Select start time first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableEndTimes(timeOptions, startTime).map(
                        (option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  {errors.end_time && (
                    <p className='text-sm text-destructive'>
                      {errors.end_time.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='purpose'>Purpose (Optional)</Label>
                <Textarea
                  id='purpose'
                  placeholder='Brief description of the booking purpose...'
                  {...register("purpose")}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className='flex justify-between gap-2'>
            <Button
              type='button'
              variant='destructive'
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Cancel Booking"}
            </Button>
            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.back()}
              >
                Back
              </Button>
              <Button type='submit' disabled={loading}>
                {loading ? "Updating..." : "Update Booking"}
              </Button>
            </div>
          </div>
        </form>
      )}

      {!canEdit && (
        <div className='flex justify-end'>
          <Button variant='outline' onClick={() => router.back()}>
            Back
          </Button>
        </div>
      )}
    </div>
  );
}
