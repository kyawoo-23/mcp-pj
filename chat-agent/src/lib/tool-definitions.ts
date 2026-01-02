
import { BookOpen, Calendar, Search, Building2, UserCircle, LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export interface ToolDefinition {
  name: string;
  description: string;
  icon?: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

export const TOOL_DEFINITIONS: Record<string, ToolDefinition> = {
  search_courses: {
    name: "search_courses",
    description: "Search for courses by code or title, or list all available courses if no query provided",
    icon: Search,
  },
  get_course_details: {
    name: "get_course_details",
    description: "Get details of a specific course by ID",
    icon: BookOpen,
  },
  get_course_sections: {
    name: "get_course_sections",
    description: "Get all available sections for a specific course",
    icon: BookOpen,
  },
  register_course: {
    name: "register_course",
    description: "Register a student for a course section",
    icon: UserCircle,
  },
  get_student_registrations: {
    name: "get_student_registrations",
    description: "Get active course registrations for a student",
    icon: BookOpen,
  },
  drop_course: {
    name: "drop_course",
    description: "Drop a course section for a student",
    icon: UserCircle,
  },
  search_facilities: {
    name: "search_facilities",
    description: "Search for facilities by name or type, or list all available facilities if no query provided",
    icon: Search,
  },
  book_facility: {
    name: "book_facility",
    description: "Book a facility for a specific time slot",
    icon: Calendar,
  },
  get_student_bookings: {
    name: "get_student_bookings",
    description: "Get facility bookings for a student",
    icon: Building2,
  },
};

export const AVAILABLE_TOOLS = Object.values(TOOL_DEFINITIONS);
