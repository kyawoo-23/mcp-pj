import { z } from "zod";
import { getSupabase } from "../lib/supabase.js";
import { recordTaskCompletion } from "../lib/task-mode.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Register course-related tools with the MCP server
 */
export function registerCourseTools(server: McpServer) {
  const supabase = getSupabase();

  // ============ search_courses ============
  server.tool(
    "search_courses",
    "Search for courses by code or title, or list all available courses if no query provided",
    {
      query: z
        .string()
        .optional()
        .describe(
          "Search query for course code or title. If omitted, returns all available courses."
        ),
    },
    async ({ query }) => {
      console.log(`🔧 [Tool] search_courses called with query: ${query || "(all courses)"}`);
      
      try {
        let baseQuery = supabase
          .from("courses")
          .select("id, code, title, credits, description");

        if (query) {
          baseQuery = baseQuery.or(
            `code.ilike.%${query}%,title.ilike.%${query}%`
          );
        }

        // Stable ordering helps pagination/caching and tends to use indexes well.
        const { data, error } = await baseQuery.order("code", { ascending: true }).limit(50);

        if (error) {
          console.error(`❌ [Tool Error] search_courses failed: ${error.message}`);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: `Error searching courses: ${error.message}` }),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ courses: data }),
            },
          ],
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`❌ [Tool Exception] search_courses exception: ${errorMsg}`);
        throw err;
      }
    }
  );

  // ============ get_course_details ============
  server.tool(
    "get_course_details",
    "Get details of a specific course by ID",
    {
      courseId: z.string().uuid().describe("The UUID of the course"),
    },
    async ({ courseId }) => {
      console.log(`🔧 [Tool] get_course_details called with courseId: ${courseId}`);
      
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("id, code, title, credits, description")
          .eq("id", courseId)
          .maybeSingle();

        if (error) {
          console.error(`❌ [Tool Error] get_course_details failed: ${error.message}`);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: `Error getting course details: ${error.message}` }),
              },
            ],
          };
        }

        if (!data) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: "Course not found." }),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ course: data }),
            },
          ],
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`❌ [Tool Exception] get_course_details exception: ${errorMsg}`);
        throw err;
      }
    }
  );

  // ============ get_course_sections ============
  server.tool(
    "get_course_sections",
    "Get all available sections for a specific course",
    {
      courseId: z.string().uuid().describe("The UUID of the course"),
    },
    async ({ courseId }) => {
      console.log(`🔧 [Tool] get_course_sections called with courseId: ${courseId}`);
      
      try {
        const { data, error } = await supabase
          .from("course_sections")
          .select(
            "id, course_id, section_number, instructor, semester, year, schedule_days, start_time, end_time, room_location"
          )
          .eq("course_id", courseId)
          .order("section_number", { ascending: true });

        if (error) {
          console.error(`❌ [Tool Error] get_course_sections failed: ${error.message}`);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: `Error getting course sections: ${error.message}` }),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ sections: data }),
            },
          ],
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`❌ [Tool Exception] get_course_sections exception: ${errorMsg}`);
        throw err;
      }
    }
  );

  // ============ register_course ============
  server.tool(
    "register_course",
    "Register a student for a course section",
    {
      studentId: z.string().uuid().describe("The UUID of the student"),
      sectionId: z.string().uuid().describe("The UUID of the course section"),
    },
    async ({ studentId, sectionId }) => {
      console.log(`🔧 [Tool] register_course called with studentId: ${studentId}, sectionId: ${sectionId}`);
      
      try {
        // First check if already registered (avoid unique constraint violation)
        const { data: existing } = await supabase
          .from("student_registrations")
          .select("id")
          .eq("student_id", studentId)
          .eq("section_id", sectionId)
          .eq("status", "active")
          .maybeSingle();

        if (existing) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  errorCode: "ALREADY_REGISTERED",
                  error: "Already registered for this section.",
                  confirmed: true,
                }),
              },
            ],
          };
        }

        const { data, error } = await supabase
          .from("student_registrations")
          .insert({
            student_id: studentId,
            section_id: sectionId,
            status: "active",
          })
          .select()
          .single();

        if (error) {
          console.error(`❌ [Tool Error] register_course failed: ${error.message}`);
          const alreadyRegistered =
            error.code === "23505" ||
            /unique|duplicate/i.test(error.message);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
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
                }),
              },
            ],
          };
        }

        // Record task completion for task mode
        await recordTaskCompletion(supabase, {
          userId: studentId,
          systemType: "chat_agent",
          taskCode: "register_course",
          successPayload: {
            registration_id: data?.id ?? null,
            section_id: sectionId,
          },
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                registration: data,
                message: "Successfully registered for course",
              }),
            },
          ],
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`❌ [Tool Exception] register_course exception: ${errorMsg}`);
        throw err;
      }
    }
  );

  // ============ get_student_registrations ============
  server.tool(
    "get_student_registrations",
    "Get active course registrations for a student",
    {
      studentId: z.string().uuid().describe("The UUID of the student"),
    },
    async ({ studentId }) => {
      console.log(`🔧 [Tool] get_student_registrations called with studentId: ${studentId}`);
      
      try {
        const { data, error } = await supabase
          .from("student_registrations")
          .select(
            `
            id,
            student_id,
            section_id,
            status,
            registered_at,
            dropped_at,
            course_sections (
              id,
              course_id,
              section_number,
              instructor,
              semester,
              year,
              schedule_days,
              start_time,
              end_time,
              room_location,
              courses (id, code, title, credits)
            )
          `
          )
          .eq("student_id", studentId)
          .eq("status", "active");

        if (error) {
          console.error(`❌ [Tool Error] get_student_registrations failed: ${error.message}`);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: `Error fetching registrations: ${error.message}` }),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ registrations: data }),
            },
          ],
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`❌ [Tool Exception] get_student_registrations exception: ${errorMsg}`);
        throw err;
      }
    }
  );

  // ============ drop_course ============
  server.tool(
    "drop_course",
    "Drop a course section for a student",
    {
      studentId: z.string().uuid().describe("The UUID of the student"),
      sectionId: z.string().uuid().describe("The UUID of the course section"),
    },
    async ({ studentId, sectionId }) => {
      console.log(`🔧 [Tool] drop_course called with studentId: ${studentId}, sectionId: ${sectionId}`);
      
      try {
        // Check if registration exists and is active
        const { data: existing, error: checkError } = await supabase
          .from("student_registrations")
          .select("id, status")
          .eq("student_id", studentId)
          .eq("section_id", sectionId)
          .eq("status", "active")
          .single();

        if (checkError || !existing) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  error: "Active registration not found for this course section.",
                }),
              },
            ],
          };
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
          console.error(`❌ [Tool Error] drop_course failed: ${error.message}`);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: `Error dropping course: ${error.message}` }),
              },
            ],
          };
        }

        // Record task completion for task mode
        await recordTaskCompletion(supabase, {
          userId: studentId,
          systemType: "chat_agent",
          taskCode: "drop_course",
          successPayload: {
            registration_id: data?.id ?? null,
            section_id: sectionId,
          },
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                registration: data,
                message: "Successfully dropped course",
              }),
            },
          ],
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`❌ [Tool Exception] drop_course exception: ${errorMsg}`);
        throw err;
      }
    }
  );
}
