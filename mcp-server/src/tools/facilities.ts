import { z } from "zod";
import { getSupabase } from "../lib/supabase.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Normalize time string to HH:MM:SS format
 */
function normalizeTime(timeStr: string): string | null {
  try {
    const date = new Date(`2000-01-01 ${timeStr}`);
    if (isNaN(date.getTime())) {
      return null;
    }
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  } catch {
    return null;
  }
}

/**
 * Register facility-related tools with the MCP server
 */
export function registerFacilityTools(server: McpServer) {
  const supabase = getSupabase();

  // ============ search_facilities ============
  server.tool(
    "search_facilities",
    "Search for facilities by name or type, or list all available facilities if no query provided",
    {
      query: z
        .string()
        .optional()
        .describe(
          "Search query for facility name. If omitted, returns all available facilities."
        ),
      type: z
        .enum([
          "study_room",
          "lab",
          "meeting_room",
          "lecture_hall",
          "computer_lab",
          "library_space",
          "other",
        ])
        .optional()
        .describe("Filter by facility type"),
    },
    async ({ query, type }) => {
      let dbQuery = supabase
        .from("facilities")
        .select("*")
        .eq("is_active", true);

      if (query) {
        dbQuery = dbQuery.ilike("name", `%${query}%`);
      }

      if (type) {
        dbQuery = dbQuery.eq("facility_type", type);
      }

      const { data, error } = await dbQuery.limit(50);

      if (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                error: `Error searching facilities: ${error.message}`,
              }),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ facilities: data }),
          },
        ],
      };
    }
  );

  // ============ book_facility ============
  server.tool(
    "book_facility",
    "Book a facility for a specific time slot",
    {
      studentId: z.string().describe("The UUID of the student"),
      facilityId: z.string().describe("The UUID of the facility"),
      bookingDate: z.string().describe("Date of booking (YYYY-MM-DD)"),
      startTime: z
        .string()
        .describe("Start time (e.g., '14:00', '2:00 PM', '14:00:00')"),
      endTime: z
        .string()
        .describe("End time (e.g., '15:00', '3:00 PM', '15:00:00')"),
      purpose: z.string().optional().describe("Purpose of booking (optional)"),
    },
    async ({ studentId, facilityId, bookingDate, startTime, endTime, purpose }) => {
      // Normalize times
      const normalizedStartTime = normalizeTime(startTime);
      const normalizedEndTime = normalizeTime(endTime);

      if (!normalizedStartTime) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                error: `Invalid start time format: "${startTime}". Please use a format like "HH:MM", "HH:MM AM/PM".`,
              }),
            },
          ],
        };
      }
      if (!normalizedEndTime) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                error: `Invalid end time format: "${endTime}". Please use a format like "HH:MM", "HH:MM AM/PM".`,
              }),
            },
          ],
        };
      }

      // Construct full timestamp strings
      const startDateTime = `${bookingDate}T${normalizedStartTime}`;
      const endDateTime = `${bookingDate}T${normalizedEndTime}`;

      // Validate that end time is after start time
      if (startDateTime >= endDateTime) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                error: "End time must be strictly after start time.",
              }),
            },
          ],
        };
      }

      // Check for overlapping bookings
      const { data: conflicts, error: conflictError } = await supabase
        .from("facility_bookings")
        .select("*")
        .eq("facility_id", facilityId)
        .eq("booking_date", bookingDate)
        .neq("status", "cancelled")
        .lt("start_time", endDateTime)
        .gt("end_time", startDateTime);

      if (conflictError) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                error: `Error checking conflicts: ${conflictError.message}`,
              }),
            },
          ],
        };
      }

      if (conflicts && conflicts.length > 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                error: "Facility is already booked for this time slot.",
              }),
            },
          ],
        };
      }

      const { data, error } = await supabase
        .from("facility_bookings")
        .insert({
          student_id: studentId,
          facility_id: facilityId,
          booking_date: bookingDate,
          start_time: startDateTime,
          end_time: endDateTime,
          purpose: purpose || null,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                error: `Error booking facility: ${error.message}`,
              }),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              booking: data,
              message: "Successfully booked facility",
            }),
          },
        ],
      };
    }
  );

  // ============ get_student_bookings ============
  server.tool(
    "get_student_bookings",
    "Get facility bookings for a student",
    {
      studentId: z.string().describe("The UUID of the student"),
    },
    async ({ studentId }) => {
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
        .eq("student_id", studentId)
        .order("booking_date", { ascending: false })
        .order("start_time", { ascending: false });

      if (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                error: `Error fetching bookings: ${error.message}`,
              }),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ bookings: data }),
          },
        ],
      };
    }
  );

  // ============ cancel_booking ============
  server.tool(
    "cancel_booking",
    "Cancel a facility booking for a student",
    {
      bookingId: z.string().describe("The UUID of the booking"),
      studentId: z.string().describe("The UUID of the student"),
    },
    async ({ bookingId, studentId }) => {
      // Check if booking exists and belongs to student
      const { data: existing, error: checkError } = await supabase
        .from("facility_bookings")
        .select("*")
        .eq("id", bookingId)
        .eq("student_id", studentId)
        .single();

      if (checkError || !existing) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                error: "Booking not found or does not belong to this student.",
              }),
            },
          ],
        };
      }

      if (existing.status === "cancelled") {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ message: "Booking is already cancelled." }),
            },
          ],
        };
      }

      const { data, error } = await supabase
        .from("facility_bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                error: `Error cancelling booking: ${error.message}`,
              }),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              booking: data,
              message: "Successfully cancelled booking",
            }),
          },
        ],
      };
    }
  );
}
