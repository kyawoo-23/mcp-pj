export type RecordValue = Record<string, unknown>;

export interface CourseSummary {
  id: string;
  code: string;
  title: string;
  credits?: number;
  description?: string | null;
}

export interface CourseSectionSummary {
  id: string;
  course_id?: string;
  section_number: string;
  instructor?: string | null;
  semester?: string | null;
  year?: number | null;
  schedule_days?: string[] | null;
  start_time?: string | null;
  end_time?: string | null;
  room_location?: string | null;
  courses?: CourseSummary | null;
}

export interface RegistrationSummary {
  id: string;
  section_id: string;
  status?: string;
  registered_at?: string;
  course_sections?: CourseSectionSummary | null;
}

export interface FacilitySummary {
  id: string;
  name: string;
  facility_type?: string;
  building?: string | null;
  room_number?: string | null;
  description?: string | null;
  amenities?: string[] | null;
}

export interface BookingSummary {
  id: string;
  facility_id?: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status?: string;
  purpose?: string | null;
  facilities?: Pick<
    FacilitySummary,
    "name" | "building" | "room_number"
  > | null;
}

export function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isCourse(value: unknown): value is CourseSummary {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.code === "string" &&
    typeof value.title === "string"
  );
}

export function isSection(value: unknown): value is CourseSectionSummary {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.section_number === "string"
  );
}

export function isRegistration(value: unknown): value is RegistrationSummary {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.section_id === "string"
  );
}

export function isFacility(value: unknown): value is FacilitySummary {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string"
  );
}

export function isBooking(value: unknown): value is BookingSummary {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.booking_date === "string" &&
    typeof value.start_time === "string" &&
    typeof value.end_time === "string"
  );
}

export function arrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T,
): T[] {
  return Array.isArray(value) ? value.filter(guard) : [];
}

export function formatTime(value?: string | null): string {
  if (!value) return "TBD";
  const timeMatch =
    value.match(/T(\d{2}:\d{2})/) ?? value.match(/^(\d{2}:\d{2})/);
  return timeMatch?.[1] ?? value;
}

export function formatDateTimeRange(
  start?: string | null,
  end?: string | null,
): string {
  return `${formatTime(start)}-${formatTime(end)}`;
}

export function formatLocation(
  building?: string | null,
  room?: string | null,
): string {
  return [building, room ? `Room ${room}` : null].filter(Boolean).join(", ");
}
