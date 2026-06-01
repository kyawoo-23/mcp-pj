/**
 * Helpers for matching task assignment set criteria to user actions.
 */

export function toTaskTimeHHMM(timeStr: string): string | null {
  try {
    if (timeStr.includes("T")) {
      const parsed = new Date(timeStr);
      if (!isNaN(parsed.getTime())) {
        const hours = parsed.getHours().toString().padStart(2, "0");
        const minutes = parsed.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
      }
    }

    const fromClock = new Date(`2000-01-01 ${timeStr}`);
    if (!isNaN(fromClock.getTime())) {
      const hours = fromClock.getHours().toString().padStart(2, "0");
      const minutes = fromClock.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    }

    return null;
  } catch {
    return null;
  }
}

export function matchesTaskTime(
  criteriaTime: string | undefined,
  actualTime: string
): boolean {
  if (!criteriaTime) return true;
  const actualHHMM = toTaskTimeHHMM(actualTime);
  const criteriaHHMM = toTaskTimeHHMM(criteriaTime);
  if (!actualHHMM || !criteriaHHMM) return false;
  return criteriaHHMM === actualHHMM;
}

function formatLocalDateYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function matchesTaskBookingDate(
  criteriaDate: string | undefined,
  actualDate: string
): boolean {
  if (!criteriaDate) return true;
  if (criteriaDate === "tomorrow") {
    const now = new Date();
    const today = formatLocalDateYYYYMMDD(now);
    const tomorrow = formatLocalDateYYYYMMDD(
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    );
    return actualDate === today || actualDate === tomorrow;
  }
  return criteriaDate === actualDate;
}

export function extractBookingWallTime(
  bookingDate: string,
  timestamp: string
): string | null {
  const dateOnly = bookingDate.slice(0, 10);
  if (timestamp.startsWith(`${dateOnly}T`)) {
    const match = timestamp.match(new RegExp(`^${dateOnly}T(\\d{2}):(\\d{2})`));
    if (match) {
      return `${match[1]}:${match[2]}`;
    }
  }
  return toTaskTimeHHMM(timestamp);
}

export type BookingTaskCriteria = {
  facility_name?: string;
  booking_date?: string;
  start_time?: string;
  end_time?: string;
};

export function matchesBookingTaskCriteria(
  criteria: BookingTaskCriteria,
  actual: {
    facilityName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
  }
): boolean {
  return (
    (!criteria.facility_name ||
      criteria.facility_name === actual.facilityName) &&
    matchesTaskBookingDate(criteria.booking_date, actual.bookingDate) &&
    matchesBookingWallTime(criteria.start_time, actual.bookingDate, actual.startTime) &&
    matchesBookingWallTime(criteria.end_time, actual.bookingDate, actual.endTime)
  );
}

function matchesBookingWallTime(
  criteriaTime: string | undefined,
  bookingDate: string,
  timestamp: string
): boolean {
  if (!criteriaTime) return true;
  const criteriaHHMM = toTaskTimeHHMM(criteriaTime);
  if (!criteriaHHMM) return false;

  const wall = extractBookingWallTime(bookingDate, timestamp);
  const local = toTaskTimeHHMM(timestamp);

  return criteriaHHMM === wall || criteriaHHMM === local;
}
