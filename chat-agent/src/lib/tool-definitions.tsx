import {
  BookOpen,
  Calendar,
  Search,
  Building2,
  UserCircle,
  CheckCircle,
  LucideProps,
} from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export interface ToolDefinition {
  name: string;
  description: string;
  icon?: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  displayName: string;
}

export const TOOL_DEFINITIONS: Record<string, ToolDefinition> = {
  search_courses: {
    name: "search_courses",
    description:
      "Search for courses by code or title, or list all available courses if no query provided",
    icon: Search,
    displayName: "Searching courses",
  },
  get_course_details: {
    name: "get_course_details",
    description: "Get details of a specific course by ID",
    icon: BookOpen,
    displayName: "Getting course details",
  },
  get_course_sections: {
    name: "get_course_sections",
    description: "Get all available sections for a specific course",
    icon: BookOpen,
    displayName: "Getting course sections",
  },
  register_course: {
    name: "register_course",
    description: "Register a student for a course section",
    icon: CheckCircle,
    displayName: "Registering for course",
  },
  get_student_registrations: {
    name: "get_student_registrations",
    description: "Get active course registrations for a student",
    icon: Calendar,
    displayName: "Fetching your registrations",
  },
  drop_course: {
    name: "drop_course",
    description: "Drop a course section for a student",
    icon: UserCircle,
    displayName: "Dropping course",
  },
  search_facilities: {
    name: "search_facilities",
    description:
      "Search facilities by English name, room number, building, or description. Names in the database are English (e.g. 'Study Room 202'). Map the user's facility wording to the canonical English name or room number before calling. Omit query to list all (optionally filter with type).",
    icon: Building2,
    displayName: "Searching facilities",
  },
  book_facility: {
    name: "book_facility",
    description: "Book a facility for a specific time slot",
    icon: Calendar,
    displayName: "Booking facility",
  },
  get_student_bookings: {
    name: "get_student_bookings",
    description: "Get facility bookings for a student",
    icon: Calendar,
    displayName: "Fetching your bookings",
  },
  cancel_booking: {
    name: "cancel_booking",
    description: "Cancel a facility booking for a student",
    icon: Calendar,
    displayName: "Canceling booking",
  },
};

export const AVAILABLE_TOOLS = Object.values(TOOL_DEFINITIONS);
