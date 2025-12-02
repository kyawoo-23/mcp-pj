import type { FacilityBooking, AvailabilityCheck } from "@/lib/types";

/**
 * Check if a time range conflicts with existing bookings
 */
export function hasTimeConflict(
  newBooking: AvailabilityCheck,
  existingBookings: FacilityBooking[]
): boolean {
  const newStart = timeToMinutes(newBooking.start_time);
  const newEnd = timeToMinutes(newBooking.end_time);

  return existingBookings.some((booking) => {
    // Skip the booking being edited
    if (newBooking.exclude_booking_id && booking.id === newBooking.exclude_booking_id) {
      return false;
    }

    // Only check bookings on the same date
    if (booking.booking_date !== newBooking.booking_date) {
      return false;
    }

    // Skip cancelled and completed bookings
    if (booking.status === "cancelled" || booking.status === "completed") {
      return false;
    }

    const existingStart = timeToMinutes(booking.start_time);
    const existingEnd = timeToMinutes(booking.end_time);

    // Check for overlap
    return (
      (newStart >= existingStart && newStart < existingEnd) ||
      (newEnd > existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    );
  });
}

/**
 * Convert time string (HH:mm) or timestamp to minutes since midnight
 */
function timeToMinutes(time: string): number {
  // Handle timestamp format (e.g., "2024-12-01T13:00:00+00:00" or "2024-12-01T13:00:00")
  if (time.includes("T")) {
    const date = new Date(time);
    return date.getHours() * 60 + date.getMinutes();
  }
  // Handle time string format (e.g., "13:00")
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Validate booking time range
 */
export function validateTimeRange(startTime: string, endTime: string): {
  valid: boolean;
  error?: string;
} {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (start >= end) {
    return {
      valid: false,
      error: "End time must be after start time",
    };
  }

  if (end - start < 30) {
    return {
      valid: false,
      error: "Booking must be at least 30 minutes",
    };
  }

  if (end - start > 8 * 60) {
    return {
      valid: false,
      error: "Booking cannot exceed 8 hours",
    };
  }

  return { valid: true };
}

/**
 * Check if booking date is in the past
 */
export function isPastDate(dateString: string): boolean {
  const bookingDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return bookingDate < today;
}

