import { z } from "zod";
import { tool } from "ai";
import { TOOL_DEFINITIONS } from "@/lib/tool-definitions";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../../supabase/types/database.types";
import { recordTaskCompletion } from "@/lib/task-mode-server";

/**
 * AI SDK Tool Definitions Factory
 * These tools integrate with the university services (course registration & facility booking)
 */
export const createTools = (supabase: SupabaseClient<Database>) => {
  // ============ Course Registration Tools ============

  const searchCourses = tool({
    description: TOOL_DEFINITIONS.search_courses.description,
    inputSchema: z.object({
      query: z
        .string()
        .optional()
        .describe("Search query for course code or title. If omitted, returns all available courses."),
    }),
    execute: async (params) => {
      let baseQuery = supabase.from("courses").select("*");

      if (params.query) {
        const query = params.query;
        baseQuery = baseQuery.or(`code.ilike.%${query}%,title.ilike.%${query}%`);
      }

      const { data, error } = await baseQuery.limit(50);

      if (error) {
        return { error: `Error searching courses: ${error.message}` };
      }

      return { courses: data };
    },
  });

  const getCourseDetails = tool({
    description: TOOL_DEFINITIONS.get_course_details.description,
    inputSchema: z.object({
      courseId: z.string().uuid().describe("The UUID of the course"),
    }),
    execute: async (params) => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", params.courseId)
        .maybeSingle();

      if (error) {
        return { error: `Error getting course details: ${error.message}` };
      }

      if (!data) {
        return { error: "Course not found." };
      }

      return { course: data };
    },
  });

  const getCourseSections = tool({
    description: TOOL_DEFINITIONS.get_course_sections.description,
    inputSchema: z.object({
      courseId: z.string().uuid().describe("The UUID of the course"),
    }),
    execute: async (params) => {
      const { data, error } = await supabase
        .from("course_sections")
        .select("*")
        .eq("course_id", params.courseId)
        .order("section_number", { ascending: true });

      if (error) {
        return { error: `Error getting course sections: ${error.message}` };
      }

      return { sections: data };
    },
  });

  const registerCourse = tool({
    description: TOOL_DEFINITIONS.register_course.description,
    inputSchema: z.object({
      studentId: z.string().uuid().describe("The UUID of the student"),
      sectionId: z.string().uuid().describe("The UUID of the course section"),
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
        return {
          errorCode: "ALREADY_REGISTERED",
          error: "Already registered for this section.",
          confirmed: true,
        };
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
        const alreadyRegistered =
          error.code === "23505" || /unique|duplicate/i.test(error.message ?? "");
        return {
          ...(alreadyRegistered
            ? {
                errorCode: "ALREADY_REGISTERED",
                error: "Already registered for this section.",
                confirmed: true,
              }
            : {
                errorCode: "REGISTER_FAILED",
                error: `Error registering course: ${error.message}`,
                confirmed: false,
              }),
        };
      }

      await recordTaskCompletion(supabase, {
        userId: params.studentId,
        systemType: "chat_agent",
        taskCode: "register_course",
        successPayload: {
          registration_id: data?.id ?? null,
          section_id: params.sectionId,
        },
      });

      return {
        registration: data,
        message: "Successfully registered for course",
      };
    },
  });

  const getStudentRegistrations = tool({
    description: TOOL_DEFINITIONS.get_student_registrations.description,
    inputSchema: z.object({
      studentId: z.string().uuid().describe("The UUID of the student"),
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

  const dropCourse = tool({
    description: TOOL_DEFINITIONS.drop_course.description,
    inputSchema: z.object({
      studentId: z.string().uuid().describe("The UUID of the student"),
      sectionId: z.string().uuid().describe("The UUID of the course section"),
    }),
    execute: async (params) => {
      // Check if registration exists and is active
      const { data: existing, error: checkError } = await supabase
        .from("student_registrations")
        .select("*")
        .eq("student_id", params.studentId)
        .eq("section_id", params.sectionId)
        // We only want to drop active registrations
        .eq("status", "active")
        .single();

      if (checkError || !existing) {
        return { error: "Active registration not found for this course section." };
      }

      const { data, error } = await supabase
        .from("student_registrations")
        .update({
          status: "dropped",
          dropped_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        return { error: `Error dropping course: ${error.message}` };
      }

      await recordTaskCompletion(supabase, {
        userId: params.studentId,
        systemType: "chat_agent",
        taskCode: "drop_course",
        successPayload: {
          registration_id: data?.id ?? null,
          section_id: params.sectionId,
        },
      });

      return {
        registration: data,
        message: "Successfully dropped course",
      };
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

  const searchFacilities = tool({
    description: TOOL_DEFINITIONS.search_facilities.description,
    inputSchema: z.object({
      query: z.string().optional().describe("Search query for facility name. If omitted, returns all available facilities."),
      type: facilityTypeSchema.describe("Filter by facility type"),
    }),
    execute: async (params) => {
      let dbQuery = supabase
        .from("facilities")
        .select("*")
        .eq("is_active", true);

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

  // ============ Internal Helpers ============

  const normalizeTime = (timeStr: string): string | null => {
    try {
      // Create a dummy date with the provided time
      // using a fixed date allows us to just parse the time component
      const date = new Date(`2000-01-01 ${timeStr}`);
      
      if (isNaN(date.getTime())) {
        return null;
      }
      
      // Extract HH:MM:SS in 24-hour format
      // utilizing toLocaleTimeString with en-GB usually gives 24h format "HH:MM:SS"
      // but to be safe and consistent regardless of server locale:
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      
      return `${hours}:${minutes}:${seconds}`;
    } catch {
      return null;
    }
  };

  const bookFacility = tool({
    description: TOOL_DEFINITIONS.book_facility.description,
    inputSchema: z.object({
      studentId: z.string().uuid().describe("The UUID of the student"),
      facilityId: z.string().uuid().describe("The UUID of the facility"),
      bookingDate: z.string().describe("Date of booking (YYYY-MM-DD)"),
      startTime: z.string().describe("Start time (e.g., '14:00', '2:00 PM', '14:00:00')"),
      endTime: z.string().describe("End time (e.g., '15:00', '3:00 PM', '15:00:00')"),
      purpose: z.string().optional().describe("Purpose of booking (optional)"),
    }),
    execute: async (params) => {
      // Normalize times
      const normalizedStartTime = normalizeTime(params.startTime);
      const normalizedEndTime = normalizeTime(params.endTime);

      if (!normalizedStartTime) {
        return {
          errorCode: "INVALID_TIME",
          error: `Invalid start time format: "${params.startTime}". Please use a format like "HH:MM", "HH:MM AM/PM".`,
          confirmed: true,
        };
      }
      if (!normalizedEndTime) {
        return {
          errorCode: "INVALID_TIME",
          error: `Invalid end time format: "${params.endTime}". Please use a format like "HH:MM", "HH:MM AM/PM".`,
          confirmed: true,
        };
      }

      // Construct full timestamp strings
      const startDateTime = `${params.bookingDate}T${normalizedStartTime}`;
      const endDateTime = `${params.bookingDate}T${normalizedEndTime}`;

      // Validate that end time is after start time
      // Since we are on the same day, we can just compare the strings or date objects
      if (startDateTime >= endDateTime) {
         return {
          errorCode: "INVALID_TIME_RANGE",
          error: "End time must be strictly after start time.",
          confirmed: true,
        };
      }

      // Verify facility exists and is bookable (avoids FK violation + clear error)
      const { data: facility, error: facilityError } = await supabase
        .from("facilities")
        .select("id")
        .eq("id", params.facilityId)
        .eq("is_active", true)
        .maybeSingle();

      if (facilityError) {
        return {
          errorCode: "FACILITY_CHECK_FAILED",
          error: `Error checking facility: ${facilityError.message}`,
          confirmed: false,
        };
      }
      if (!facility) {
        return {
          errorCode: "FACILITY_NOT_FOUND",
          error:
            "Facility not found or not available for booking. Use the exact facility id from search_facilities (the 'id' field), not the name.",
          confirmed: true,
        };
      }

      // Check for overlapping bookings
      const { data: conflicts, error: conflictError } = await supabase
        .from("facility_bookings")
        .select("*")
        .eq("facility_id", params.facilityId)
        .eq("booking_date", params.bookingDate)
        .neq("status", "cancelled")
        .lt("start_time", endDateTime) // Use full timestamp
        .gt("end_time", startDateTime); // Use full timestamp

      if (conflictError) {
        return {
          errorCode: "CONFLICT_CHECK_FAILED",
          error: `Error checking conflicts: ${conflictError.message}`,
          confirmed: false,
        };
      }

      if (conflicts && conflicts.length > 0) {
        return {
          errorCode: "TIME_SLOT_UNAVAILABLE",
          error: "Facility is already booked for this time slot.",
          confirmed: true,
        };
      }

      const { data, error } = await supabase
        .from("facility_bookings")
        .insert({
          student_id: params.studentId,
          facility_id: params.facilityId,
          booking_date: params.bookingDate,
          start_time: startDateTime, // Use full timestamp
          end_time: endDateTime, // Use full timestamp
          purpose: params.purpose || null,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        return {
          errorCode: "BOOKING_FAILED",
          error: `Error booking facility: ${error.message}`,
          confirmed: false,
        };
      }

      await recordTaskCompletion(supabase, {
        userId: params.studentId,
        systemType: "chat_agent",
        taskCode: "book_room",
        successPayload: {
          booking_id: data?.id ?? null,
          facility_id: params.facilityId,
          booking_date: params.bookingDate,
        },
      });

      return { booking: data, message: "Successfully booked facility" };
    },
  });

  const getStudentBookings = tool({
    description: TOOL_DEFINITIONS.get_student_bookings.description,
    inputSchema: z.object({
      studentId: z.string().uuid().describe("The UUID of the student"),
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

  const cancelBooking = tool({
    description: TOOL_DEFINITIONS.cancel_booking.description,
    inputSchema: z.object({
      bookingId: z.string().uuid().describe("The UUID of the booking"),
      studentId: z.string().uuid().describe("The UUID of the student"),
    }),
    execute: async (params) => {
      // Check if booking exists and belongs to student
      const { data: existing, error: checkError } = await supabase
        .from("facility_bookings")
        .select("*")
        .eq("id", params.bookingId)
        .eq("student_id", params.studentId)
        .single();

      if (checkError || !existing) {
        return { error: "Booking not found or does not belong to this student." };
      }

      if (existing.status === "cancelled") {
        return { message: "Booking is already cancelled." };
      }

      const { data, error } = await supabase
        .from("facility_bookings")
        .update({
          status: "cancelled",
        })
        .eq("id", params.bookingId)
        .select()
        .single();

      if (error) {
        return { error: `Error cancelling booking: ${error.message}` };
      }

      await recordTaskCompletion(supabase, {
        userId: params.studentId,
        systemType: "chat_agent",
        taskCode: "cancel_booking",
        successPayload: {
          booking_id: data?.id ?? null,
          facility_id: data?.facility_id ?? null,
        },
      });

      return {
        booking: data,
        message: "Successfully cancelled booking",
      };
    },
  });

  return {
    search_courses: searchCourses,
    get_course_details: getCourseDetails,
    get_course_sections: getCourseSections,
    register_course: registerCourse,
    get_student_registrations: getStudentRegistrations,
    drop_course: dropCourse,
    search_facilities: searchFacilities,
    book_facility: bookFacility,
    get_student_bookings: getStudentBookings,
    cancel_booking: cancelBooking,
  };
};
