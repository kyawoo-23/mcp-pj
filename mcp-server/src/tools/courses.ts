import { z } from "zod";
import { getSupabase } from "../lib/supabase.js";
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
      let baseQuery = supabase.from("courses").select("*");

      if (query) {
        baseQuery = baseQuery.or(
          `code.ilike.%${query}%,title.ilike.%${query}%`
        );
      }

      const { data, error } = await baseQuery.limit(50);

      if (error) {
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
    }
  );

  // ============ get_course_details ============
  server.tool(
    "get_course_details",
    "Get details of a specific course by ID",
    {
      courseId: z.string().describe("The UUID of the course"),
    },
    async ({ courseId }) => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: `Error getting course details: ${error.message}` }),
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
    }
  );

  // ============ get_course_sections ============
  server.tool(
    "get_course_sections",
    "Get all available sections for a specific course",
    {
      courseId: z.string().describe("The UUID of the course"),
    },
    async ({ courseId }) => {
      const { data, error } = await supabase
        .from("course_sections")
        .select("*")
        .eq("course_id", courseId)
        .order("section_number", { ascending: true });

      if (error) {
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
    }
  );

  // ============ register_course ============
  server.tool(
    "register_course",
    "Register a student for a course section",
    {
      studentId: z.string().describe("The UUID of the student"),
      sectionId: z.string().describe("The UUID of the course section"),
    },
    async ({ studentId, sectionId }) => {
      // First check if already registered
      const { data: existing } = await supabase
        .from("student_registrations")
        .select("*")
        .eq("student_id", studentId)
        .eq("section_id", sectionId)
        .eq("status", "active")
        .single();

      if (existing) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: "Student is already registered for this section." }),
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
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: `Error registering course: ${error.message}` }),
            },
          ],
        };
      }

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
    }
  );

  // ============ get_student_registrations ============
  server.tool(
    "get_student_registrations",
    "Get active course registrations for a student",
    {
      studentId: z.string().describe("The UUID of the student"),
    },
    async ({ studentId }) => {
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
        .eq("student_id", studentId)
        .eq("status", "active");

      if (error) {
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
    }
  );

  // ============ drop_course ============
  server.tool(
    "drop_course",
    "Drop a course section for a student",
    {
      studentId: z.string().describe("The UUID of the student"),
      sectionId: z.string().describe("The UUID of the course section"),
    },
    async ({ studentId, sectionId }) => {
      // Check if registration exists and is active
      const { data: existing, error: checkError } = await supabase
        .from("student_registrations")
        .select("*")
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
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: `Error dropping course: ${error.message}` }),
            },
          ],
        };
      }

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
    }
  );
}
