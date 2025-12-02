import { format, parse } from "date-fns";

export function formatDate(dateString: string): string {
  try {
    const date = parse(dateString, "yyyy-MM-dd", new Date());
    return format(date, "MMMM d, yyyy");
  } catch {
    return dateString;
  }
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

/**
 * Extract time (HH:mm) from timestamp or return time string as-is
 * Extracts UTC time from timestamps to avoid timezone conversion issues
 */
export function extractTime(timeString: string): string {
  // Handle timestamp format (e.g., "2024-12-01T13:00:00+00:00" or "2024-12-01T13:00:00")
  if (timeString.includes("T")) {
    const date = new Date(timeString);
    // Use UTC methods to extract the time as stored in the database (UTC)
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }
  // Return time string as-is (e.g., "13:00")
  return timeString;
}

export function formatTime(timeString: string): string {
  try {
    // Extract time from timestamp if needed
    const time = extractTime(timeString);
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return format(date, "h:mm a");
  } catch {
    return timeString;
  }
}

export function formatDateTime(dateString: string, timeString: string): string {
  try {
    const date = parse(dateString, "yyyy-MM-dd", new Date());
    const [hours, minutes] = timeString.split(":").map(Number);
    date.setHours(hours, minutes);
    return format(date, "MMMM d, yyyy 'at' h:mm a");
  } catch {
    return `${dateString} ${timeString}`;
  }
}

