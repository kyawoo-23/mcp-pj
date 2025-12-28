import { z } from "zod";
import { tool } from "ai";
import { supabase } from "@/lib/supabase";

/**
 * AI SDK Tool Definitions
 * These tools integrate with the university services (course registration & facility booking)
 */

// ============ Course Registration Tools ============

export const searchCourses = tool({
  description: "Search for courses by code or title",
  inputSchema: z.object({
    query: z.string().describe("Search query for course code or title"),
  }),
  execute: async (params) => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .or(`code.ilike.%${params.query}%,title.ilike.%${params.query}%`)
      .limit(50);

    if (error) {
      return { error: `Error searching courses: ${error.message}` };
    }

    return { courses: data };
  },
});

export const getCourseDetails = tool({
  description: "Get details of a specific course by ID",
  inputSchema: z.object({
    courseId: z.string().describe("The UUID of the course"),
  }),
  execute: async (params) => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", params.courseId)
      .single();

    if (error) {
      return { error: `Error getting course details: ${error.message}` };
    }

    return { course: data };
  },
});

export const registerCourse = tool({
  description: "Register a student for a course section",
  inputSchema: z.object({
    studentId: z.string().describe("The UUID of the student"),
    sectionId: z.string().describe("The UUID of the course section"),
  }),
  execute: async (params) => {
    // First check if already registered
    const { data: existing } = await supabase
      .from("student_registrations")
      .select("*")
      .eq("student_id", params.studentId)
      .eq("section_id", params.sectionId)
      .eq("status", "active")
      .single();

    if (existing) {
      return { error: "Student is already registered for this section." };
    }

    const { data, error } = await supabase
      .from("student_registrations")
      .insert({
        student_id: params.studentId,
        section_id: params.sectionId,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      return { error: `Error registering course: ${error.message}` };
    }

    return {
      registration: data,
      message: "Successfully registered for course",
    };
  },
});

export const getStudentRegistrations = tool({
  description: "Get active course registrations for a student",
  inputSchema: z.object({
    studentId: z.string().describe("The UUID of the student"),
  }),
  execute: async (params) => {
    const { data, error } = await supabase
      .from("student_registrations")
      .select(
        `
        *,
        course_sections (
          *,
          courses (*)
        )
      `
      )
      .eq("student_id", params.studentId)
      .eq("status", "active");

    if (error) {
      return { error: `Error fetching registrations: ${error.message}` };
    }

    return { registrations: data };
  },
});

// ============ Facility Booking Tools ============

const facilityTypeSchema = z
  .enum([
    "study_room",
    "lab",
    "meeting_room",
    "lecture_hall",
    "computer_lab",
    "library_space",
    "other",
  ])
  .optional();

export const searchFacilities = tool({
  description: "Search for facilities by name or type",
  inputSchema: z.object({
    query: z.string().optional().describe("Search query for facility name"),
    type: facilityTypeSchema.describe("Filter by facility type"),
  }),
  execute: async (params) => {
    let dbQuery = supabase.from("facilities").select("*").eq("is_active", true);

    if (params.query) {
      dbQuery = dbQuery.ilike("name", `%${params.query}%`);
    }

    if (params.type) {
      dbQuery = dbQuery.eq("facility_type", params.type);
    }

    const { data, error } = await dbQuery.limit(50);

    if (error) {
      return { error: `Error searching facilities: ${error.message}` };
    }

    return { facilities: data };
  },
});

export const bookFacility = tool({
  description: "Book a facility for a specific time slot",
  inputSchema: z.object({
    studentId: z.string().describe("The UUID of the student"),
    facilityId: z.string().describe("The UUID of the facility"),
    bookingDate: z.string().describe("Date of booking (YYYY-MM-DD)"),
    startTime: z.string().describe("Start time (HH:MM:SS)"),
    endTime: z.string().describe("End time (HH:MM:SS)"),
    purpose: z.string().optional().describe("Purpose of booking"),
  }),
  execute: async (params) => {
    // Check for overlapping bookings
    const { data: conflicts, error: conflictError } = await supabase
      .from("facility_bookings")
      .select("*")
      .eq("facility_id", params.facilityId)
      .eq("booking_date", params.bookingDate)
      .neq("status", "cancelled")
      .lt("start_time", params.endTime)
      .gt("end_time", params.startTime);

    if (conflictError) {
      return { error: `Error checking conflicts: ${conflictError.message}` };
    }

    if (conflicts && conflicts.length > 0) {
      return { error: "Facility is already booked for this time slot." };
    }

    const { data, error } = await supabase
      .from("facility_bookings")
      .insert({
        student_id: params.studentId,
        facility_id: params.facilityId,
        booking_date: params.bookingDate,
        start_time: params.startTime,
        end_time: params.endTime,
        purpose: params.purpose || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return { error: `Error booking facility: ${error.message}` };
    }

    return { booking: data, message: "Successfully booked facility" };
  },
});

export const getStudentBookings = tool({
  description: "Get facility bookings for a student",
  inputSchema: z.object({
    studentId: z.string().describe("The UUID of the student"),
  }),
  execute: async (params) => {
    const { data, error } = await supabase
      .from("facility_bookings")
      .select(
        `
        *,
        facilities (
          name,
          building,
          room_number
        )
      `
      )
      .eq("student_id", params.studentId)
      .order("booking_date", { ascending: false })
      .order("start_time", { ascending: false });

    if (error) {
      return { error: `Error fetching bookings: ${error.message}` };
    }

    return { bookings: data };
  },
});

// ============ Export All Tools ============

export const allTools = {
  search_courses: searchCourses,
  get_course_details: getCourseDetails,
  register_course: registerCourse,
  get_student_registrations: getStudentRegistrations,
  search_facilities: searchFacilities,
  book_facility: bookFacility,
  get_student_bookings: getStudentBookings,
};
