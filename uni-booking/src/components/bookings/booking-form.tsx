"use client";

import { useState, useEffect, useCallback } from "react";
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
import { format } from "date-fns";
import { getFacilityAvailability } from "@/app/actions/facilities";
import { createBooking } from "@/app/actions/bookings";
import type { Facility, FacilityBooking } from "@/lib/types";
import { validateTimeRange, hasTimeConflict } from "@/lib/utils/booking";
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

interface BookingFormProps {
  facilities: Facility[];
  preSelectedFacilityId?: string;
}

const timeOptions = generateTimeOptions();

export function BookingForm({
  facilities,
  preSelectedFacilityId,
}: BookingFormProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availableBookings, setAvailableBookings] = useState<FacilityBooking[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      facility_id: preSelectedFacilityId || "",
    },
  });

  const facilityId = watch("facility_id");
  const bookingDate = watch("booking_date");
  const startTime = watch("start_time");
  const endTime = watch("end_time");

  const loadAvailability = useCallback(async () => {
    if (!facilityId || !bookingDate) return;

    setCheckingAvailability(true);
    try {
      const bookings = await getFacilityAvailability(facilityId, bookingDate);
      setAvailableBookings(bookings);
    } catch (err) {
      console.error("Failed to load availability:", err);
    } finally {
      setCheckingAvailability(false);
    }
  }, [facilityId, bookingDate]);

  // Load availability when facility or date changes
  useEffect(() => {
    if (facilityId && bookingDate) {
      loadAvailability();
    }
  }, [facilityId, bookingDate, loadAvailability]);

  // Clear end time if start time is cleared
  useEffect(() => {
    if (!startTime && endTime) {
      setValue("end_time", "");
    }
  }, [startTime, endTime, setValue]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
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
    setError(null);
    setLoading(true);

    try {
      // Validate time range
      const timeValidation = validateTimeRange(data.start_time, data.end_time);
      if (!timeValidation.valid) {
        setError(timeValidation.error || null);
        setLoading(false);
        return;
      }

      // Check for conflicts
      if (hasTimeConflict(data, availableBookings)) {
        setError("This time slot conflicts with an existing booking");
        setLoading(false);
        return;
      }

      const result = await createBooking(data);

      if (result.error) {
        setError(result.error);
        toast.error("Failed to create booking", {
          description: result.error,
        });
      } else {
        toast.success("Booking created successfully");
        if (result.taskCompleted) {
          toast.success("Task completed: Book a room",);
        }
        router.push("/bookings");
        router.refresh();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create booking";
      setError(errorMessage);
      toast.error("Failed to create booking", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      {error && (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
          <CardDescription>
            Select facility, date, and time for your booking
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='facility_id'>Facility</Label>
            <Select
              value={facilityId}
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
                      {facility.room_number && ` Room ${facility.room_number}`}
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
              <Select value={startTime} onValueChange={handleStartTimeChange}>
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
                      startTime ? "Select end time" : "Select start time first"
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

          {checkingAvailability && (
            <p className='text-sm text-muted-foreground'>
              Checking availability...
            </p>
          )}

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

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type='submit' disabled={loading}>
          {loading ? "Creating..." : "Create Booking"}
        </Button>
      </div>
    </form>
  );
}
