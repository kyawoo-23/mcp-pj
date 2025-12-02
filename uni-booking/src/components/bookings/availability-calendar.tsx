"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { FacilityBooking } from "@/lib/types";

interface AvailabilityCalendarProps {
  bookings: FacilityBooking[];
  selectedDate?: Date;
  onDateSelect?: (date: Date | undefined) => void;
}

export function AvailabilityCalendar({
  bookings,
  selectedDate,
  onDateSelect,
}: AvailabilityCalendarProps) {
  // Group bookings by date
  const bookingsByDate = new Map<string, FacilityBooking[]>();
  bookings.forEach((booking) => {
    const date = booking.booking_date;
    if (!bookingsByDate.has(date)) {
      bookingsByDate.set(date, []);
    }
    bookingsByDate.get(date)!.push(booking);
  });

  // Check if a date has bookings
  const hasBookings = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return bookingsByDate.has(dateStr);
  };

  // Get booking count for a date
  const getBookingCount = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return bookingsByDate.get(dateStr)?.length || 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability Calendar</CardTitle>
        <CardDescription>Select a date to view available time slots</CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          className="rounded-md border"
          modifiers={{
            booked: (date) => hasBookings(date),
          }}
          modifiersClassNames={{
            booked: "bg-yellow-100 dark:bg-yellow-900/20",
          }}
        />
        {selectedDate && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium">
              Bookings on {format(selectedDate, "MMMM d, yyyy")}
            </h4>
            {bookingsByDate.has(format(selectedDate, "yyyy-MM-dd")) ? (
              <div className="space-y-1">
                {bookingsByDate
                  .get(format(selectedDate, "yyyy-MM-dd"))!
                  .map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-md border p-2 text-sm"
                    >
                      <span>
                        {booking.start_time} - {booking.end_time}
                      </span>
                      <Badge variant="outline">{booking.status}</Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No bookings on this date</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

