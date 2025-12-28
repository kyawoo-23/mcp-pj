import { z } from 'zod'
import { supabase } from '@/lib/supabase'

export const uniBookingTool = (server: any) => {
  server.tool(
    'search_facilities',
    'Search for facilities by name or type',
    {
      query: z.string().optional().describe('Search query for facility name'),
      type: z.enum([
        'study_room',
        'lab',
        'meeting_room',
        'lecture_hall',
        'computer_lab',
        'library_space',
        'other',
      ]).optional().describe('Filter by facility type'),
    },
    async ({ query, type }: { query?: string; type?: 'study_room' | 'lab' | 'meeting_room' | 'lecture_hall' | 'computer_lab' | 'library_space' | 'other' }) => {
      let dbQuery = supabase
        .from('facilities')
        .select('*')
        .eq('is_active', true)

      if (query) {
        dbQuery = dbQuery.ilike('name', `%${query}%`)
      }

      if (type) {
        dbQuery = dbQuery.eq('facility_type', type)
      }

      const { data, error } = await dbQuery.limit(10)

      if (error) {
        return {
          content: [{ type: 'text', text: `Error searching facilities: ${error.message}` }],
          isError: true,
        }
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      }
    }
  )

  server.tool(
    'book_facility',
    'Book a facility for a specific time slot',
    {
      studentId: z.string().describe('The UUID of the student'),
      facilityId: z.string().describe('The UUID of the facility'),
      bookingDate: z.string().describe('Date of booking (YYYY-MM-DD)'),
      startTime: z.string().describe('Start time (HH:MM:SS)'),
      endTime: z.string().describe('End time (HH:MM:SS)'),
      purpose: z.string().optional().describe('Purpose of booking'),
    },
    async ({ studentId, facilityId, bookingDate, startTime, endTime, purpose }: { studentId: string; facilityId: string; bookingDate: string; startTime: string; endTime: string; purpose?: string }) => {
      // Check for overlapping bookings
      // Overlap logic: (StartA < EndB) and (EndA > StartB)
      const { data: conflicts, error: conflictError } = await supabase
        .from('facility_bookings')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('booking_date', bookingDate)
        .neq('status', 'cancelled')
        .lt('start_time', endTime)
        .gt('end_time', startTime)

      if (conflictError) {
        return {
          content: [{ type: 'text', text: `Error checking conflicts: ${conflictError.message}` }],
          isError: true,
        }
      }

      if (conflicts && conflicts.length > 0) {
        return {
          content: [{ type: 'text', text: 'Facility is already booked for this time slot.' }],
          isError: true,
        }
      }

      const { data, error } = await supabase
        .from('facility_bookings')
        .insert({
          student_id: studentId,
          facility_id: facilityId,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          purpose: purpose || null,
          status: 'pending', // Default status
        })
        .select()
        .single()

      if (error) {
        return {
          content: [{ type: 'text', text: `Error booking facility: ${error.message}` }],
          isError: true,
        }
      }

      return {
        content: [{ type: 'text', text: `Successfully booked: ${JSON.stringify(data, null, 2)}` }],
      }
    }
  )

  server.tool(
    'get_student_bookings',
    'Get bookings for a student',
    {
      studentId: z.string().describe('The UUID of the student'),
    },
    async ({ studentId }: { studentId: string }) => {
      const { data, error } = await supabase
        .from('facility_bookings')
        .select(`
          *,
          facilities (
            name,
            building,
            room_number
          )
        `)
        .eq('student_id', studentId)
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: false })

      if (error) {
        return {
          content: [{ type: 'text', text: `Error fetching bookings: ${error.message}` }],
          isError: true,
        }
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      }
    }
  )
}
