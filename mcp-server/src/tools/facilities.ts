import { z } from "zod";
import { getSupabase } from "../lib/supabase.js";
import { recordTaskCompletion } from "../lib/task-mode.js";
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
      console.log(`🔧 [Tool] search_facilities called with query: ${query || "(all)"}, type: ${type || "(all)"}`);
      
      try {
        let dbQuery = supabase
          .from("facilities")
          .select("id, name, facility_type, building, room_number, description")
          .eq("is_active", true);

        if (query) {
          dbQuery = dbQuery.ilike("name", `%${query}%`);
        }

        if (type) {
          dbQuery = dbQuery.eq("facility_type", type);
        }

        // Stable ordering helps pagination/caching and tends to use indexes well.
        const { data, error } = await dbQuery.order("name", { ascending: true }).limit(50);

        if (error) {
          console.error(`❌ [Tool Error] search_facilities failed: ${error.message}`);
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
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`❌ [Tool Exception] search_facilities exception: ${errorMsg}`);
        throw err;
      }
    }
  );

  // ============ book_facility ============
  server.tool(
    "book_facility",
    "Book a facility for a specific time slot",
    {
      studentId: z.string().uuid().describe("The UUID of the student"),
      facilityId: z.string().uuid().describe("The UUID of the facility"),
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
      console.log(`🔧 [Tool] book_facility called with facilityId: ${facilityId}, date: ${bookingDate}, time: ${startTime}-${endTime}`);
      
      try {
        // Normalize times
        const normalizedStartTime = normalizeTime(startTime);
        const normalizedEndTime = normalizeTime(endTime);

        if (!normalizedStartTime) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  errorCode: "INVALID_TIME",
                  error: `Invalid start time format: "${startTime}". Please use a format like "HH:MM", "HH:MM AM/PM".`,
                  confirmed: true,
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
                  errorCode: "INVALID_TIME",
                  error: `Invalid end time format: "${endTime}". Please use a format like "HH:MM", "HH:MM AM/PM".`,
                  confirmed: true,
                }),
              },
            ],
          };
        }

        // Validate booking date is not in the past (based on server time, date-only comparison)
        const bookingDateObj = new Date(`${bookingDate}T00:00:00`);
        if (isNaN(bookingDateObj.getTime())) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  errorCode: "INVALID_DATE",
                  error: `Invalid booking date format: "${bookingDate}". Please use "YYYY-MM-DD".`,
                  confirmed: true,
                }),
              },
            ],
          };
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const bookingDay = new Date(
          bookingDateObj.getFullYear(),
          bookingDateObj.getMonth(),
          bookingDateObj.getDate()
        );

        if (bookingDay < today) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  errorCode: "INVALID_DATE_PAST",
                  error: "Booking date must not be in the past.",
                  confirmed: true,
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
                  errorCode: "INVALID_TIME_RANGE",
                  error: "End time must be strictly after start time.",
                  confirmed: true,
                }),
              },
            ],
          };
        }

        // Verify facility exists and is bookable (avoids FK violation + clear error)
        const { data: facility, error: facilityError } = await supabase
          .from("facilities")
          .select("id")
          .eq("id", facilityId)
          .eq("is_active", true)
          .maybeSingle();

        if (facilityError) {
          console.error(`❌ [Tool Error] book_facility facility check failed: ${facilityError.message}`);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  errorCode: "FACILITY_CHECK_FAILED",
                  error: `Error checking facility: ${facilityError.message}`,
                  confirmed: false,
                }),
              },
            ],
          };
        }
        if (!facility) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  errorCode: "FACILITY_NOT_FOUND",
                  error:
                    "Facility not found or not available for booking. Use the exact facility id from search_facilities (the 'id' field), not the name.",
                  confirmed: true,
                }),
              },
            ],
          };
        }

        // Check for overlapping bookings
        // Prefer an existence check over COUNT(*) for speed (stops at first match).
        const { data: conflict, error: conflictError } = await supabase
          .from("facility_bookings")
          .select("id")
          .eq("facility_id", facilityId)
          .eq("booking_date", bookingDate)
          .neq("status", "cancelled")
          .lt("start_time", endDateTime)
          .gt("end_time", startDateTime)
          .limit(1)
          .maybeSingle();

        if (conflictError) {
          console.error(`❌ [Tool Error] book_facility conflict check failed: ${conflictError.message}`);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  errorCode: "CONFLICT_CHECK_FAILED",
                  error: `Error checking conflicts: ${conflictError.message}`,
                  confirmed: false,
                }),
              },
            ],
          };
        }

        if (conflict) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  errorCode: "TIME_SLOT_UNAVAILABLE",
                  error: "Facility is already booked for this time slot.",
                  confirmed: true,
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
          console.error(`❌ [Tool Error] book_facility failed: ${error.message}`);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  errorCode: "BOOKING_FAILED",
                  error: `Error booking facility: ${error.message}`,
                  confirmed: false,
                }),
              },
            ],
          };
        }

        // Check task assignment criteria
        const { data: assignment } = await supabase
          .from("task_user_assignments")
          .select(`
            task_assignment_sets (
              targets
            )
          `)
          .eq("user_id", studentId)
          .maybeSingle();

        let isTargetMatch = true;

        const taskAssignmentSets = assignment?.task_assignment_sets as unknown as Record<string, unknown>;
        if (taskAssignmentSets?.targets) {
          const targets = taskAssignmentSets.targets as Record<string, { title: string; description: string; criteria: Record<string, string> }>;
          const criteria = targets.book_room?.criteria;
          
          if (criteria) {
            const { data: facilityData } = await supabase
              .from("facilities")
              .select("name")
              .eq("id", facilityId)
              .single();
              
            if (facilityData) {
              const facilityName = facilityData.name;
              isTargetMatch = 
                (!criteria.facility_name || criteria.facility_name === facilityName) &&
                (!criteria.start_time || criteria.start_time === startTime) &&
                (!criteria.end_time || criteria.end_time === endTime);
            } else {
              isTargetMatch = false;
            }
          }
        }

        if (isTargetMatch) {
          // Record task completion for task mode
          await recordTaskCompletion(supabase, {
            userId: studentId,
            systemType: "chat_agent",
            taskCode: "book_room",
            successPayload: {
              booking_id: data?.id ?? null,
              facility_id: facilityId,
              booking_date: bookingDate,
            },
          });
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
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`❌ [Tool Exception] book_facility exception: ${errorMsg}`);
        throw err;
      }
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
      console.log(`🔧 [Tool] get_student_bookings called with studentId: ${studentId}`);
      
      try {
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
          console.error(`❌ [Tool Error] get_student_bookings failed: ${error.message}`);
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
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`❌ [Tool Exception] get_student_bookings exception: ${errorMsg}`);
        throw err;
      }
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
      console.log(`🔧 [Tool] cancel_booking called with bookingId: ${bookingId}`);
      
      try {
        // Check if booking exists and belongs to student
        const { data: existing, error: checkError } = await supabase
          .from("facility_bookings")
          .select("id, student_id, facility_id, status")
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
          console.error(`❌ [Tool Error] cancel_booking failed: ${error.message}`);
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

        // Check task assignment criteria
        const { data: assignment } = await supabase
          .from("task_user_assignments")
          .select(`
            task_assignment_sets (
              targets
            )
          `)
          .eq("user_id", studentId)
          .maybeSingle();

        let isTargetMatch = true;

        const taskAssignmentSets = assignment?.task_assignment_sets as unknown as Record<string, unknown>;
        if (taskAssignmentSets?.targets) {
          const targets = taskAssignmentSets.targets as Record<string, { title: string; description: string; criteria: Record<string, string> }>;
          const criteria = targets.cancel_booking?.criteria;
          
          if (criteria) {
            const { data: facilityData } = await supabase
              .from("facilities")
              .select("name")
              .eq("id", data?.facility_id ?? "")
              .single();
              
            if (facilityData) {
              const facilityName = facilityData.name;
              isTargetMatch = !criteria.facility_name || criteria.facility_name === facilityName;
            } else {
              isTargetMatch = false;
            }
          }
        }

        if (isTargetMatch) {
          // Record task completion for task mode
          await recordTaskCompletion(supabase, {
            userId: studentId,
            systemType: "chat_agent",
            taskCode: "cancel_booking",
            successPayload: {
              booking_id: data?.id ?? null,
              facility_id: data?.facility_id ?? null,
            },
          });
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
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`❌ [Tool Exception] cancel_booking exception: ${errorMsg}`);
        throw err;
      }
    }
  );
}
