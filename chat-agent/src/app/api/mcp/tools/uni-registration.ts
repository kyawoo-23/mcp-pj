import { z } from 'zod'
import { supabase } from '@/lib/supabase'

export const uniRegistrationTool = (server: any) => {
  server.tool(
    'search_courses',
    'Search for courses by code or title',
    {
      query: z.string().describe('Search query for course code or title'),
    },
    async ({ query }: { query: string }) => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .or(`code.ilike.%${query}%,title.ilike.%${query}%`)
        .limit(10)

      if (error) {
        return {
          content: [{ type: 'text', text: `Error searching courses: ${error.message}` }],
          isError: true,
        }
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      }
    }
  )

  server.tool(
    'get_course_details',
    'Get details of a specific course by ID',
    {
      courseId: z.string().describe('The UUID of the course'),
    },
    async ({ courseId }: { courseId: string }) => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (error) {
        return {
          content: [{ type: 'text', text: `Error getting course details: ${error.message}` }],
          isError: true,
        }
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      }
    }
  )

  server.tool(
    'register_course',
    'Register a student for a course section',
    {
      studentId: z.string().describe('The UUID of the student'),
      sectionId: z.string().describe('The UUID of the course section'),
    },
    async ({ studentId, sectionId }: { studentId: string; sectionId: string }) => {
      // First check if already registered
      const { data: existing } = await supabase
        .from('student_registrations')
        .select('*')
        .eq('student_id', studentId)
        .eq('section_id', sectionId)
        .eq('status', 'active')
        .single()

      if (existing) {
        return {
          content: [{ type: 'text', text: 'Student is already registered for this section.' }],
          isError: true,
        }
      }

      const { data, error } = await supabase
        .from('student_registrations')
        .insert({
          student_id: studentId,
          section_id: sectionId,
          status: 'active',
        })
        .select()
        .single()

      if (error) {
        return {
          content: [{ type: 'text', text: `Error registering course: ${error.message}` }],
          isError: true,
        }
      }

      return {
        content: [{ type: 'text', text: `Successfully registered: ${JSON.stringify(data, null, 2)}` }],
      }
    }
  )

  server.tool(
    'get_student_registrations',
    'Get active registrations for a student',
    {
      studentId: z.string().describe('The UUID of the student'),
    },
    async ({ studentId }: { studentId: string }) => {
      const { data, error } = await supabase
        .from('student_registrations')
        .select(`
          *,
          course_sections (
            *,
            courses (*)
          )
        `)
        .eq('student_id', studentId)
        .eq('status', 'active')

      if (error) {
        return {
          content: [{ type: 'text', text: `Error fetching registrations: ${error.message}` }],
          isError: true,
        }
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      }
    }
  )
}
