/**
 * Helpers for matching task assignment set criteria to user actions.
 */

/** Normalize a time string or ISO timestamp to HH:MM for task criteria comparison. */
export function toTaskTimeHHMM(timeStr: string): string | null {
  try {
    // Timestamptz / ISO strings: use local wall-clock (not UTC substring).
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

/** Compare criteria time (HH:MM) with an actual time value. */
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

/** IANA timezone for the study site (Chulalongkorn University, Bangkok). */
export const STUDY_TZ = "Asia/Bangkok";

/** Format a Date as YYYY-MM-DD in the study timezone. */
export function formatInStudyTZ(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STUDY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Return tomorrow's date as YYYY-MM-DD in the study timezone. */
export function getTomorrowInStudyTZ(): string {
  return formatInStudyTZ(new Date(Date.now() + 86_400_000));
}

/** Compare criteria booking_date with an actual YYYY-MM-DD date. Supports "tomorrow". */
export function matchesTaskBookingDate(
  criteriaDate: string | undefined,
  actualDate: string
): boolean {
  if (!criteriaDate) return true;
  if (criteriaDate === "tomorrow") {
    // Resolve "tomorrow" in the study timezone (Bangkok, UTC+7) so that participants
    // booking after midnight ICT are not penalised by the UTC-server date boundary.
    // At cancel time the booking date is often already "today" in Bangkok — both are accepted.
    const today = formatInStudyTZ(new Date());
    const tomorrow = getTomorrowInStudyTZ();
    return actualDate === today || actualDate === tomorrow;
  }
  return criteriaDate === actualDate;
}

/** HH:MM wall-clock from timestamptz using booking_date prefix when present. */
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
