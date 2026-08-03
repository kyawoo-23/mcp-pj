-- ============================================================================
-- TASK ASSIGNMENT SETS — randomized specific task targets per participant
-- ============================================================================

INSERT INTO task_assignment_sets (set_label, targets) VALUES
(
  'Set A',
  '{
    "register_course": {
      "title": "Register for CS201 — Object-Oriented Programming (Section A)",
      "description": "Find and register for CS201 Object-Oriented Programming, Section A taught by Dr. Robert Martinez (Mon/Wed/Fri 11:00–11:50 AM, Room E102).",
      "criteria": { "course_code": "CS201", "section_number": "A" }
    },
    "drop_course": {
      "title": "Drop CS201 — Object-Oriented Programming (Section A)",
      "description": "Drop your CS201 Object-Oriented Programming, Section A registration that you just made.",
      "criteria": { "course_code": "CS201", "section_number": "A" }
    },
    "book_room": {
      "title": "Book Study Room 201 for tomorrow, 10:00 AM–12:00 PM",
      "description": "Book Study Room 201 in the Library building for tomorrow from 10:00 AM to 12:00 PM for group study.",
      "criteria": { "facility_name": "Study Room 201", "booking_date": "tomorrow", "start_time": "10:00", "end_time": "12:00" }
    },
    "cancel_booking": {
      "title": "Cancel your Study Room 201 booking for tomorrow, 10:00 AM–12:00 PM",
      "description": "Cancel the Study Room 201 booking you just made for tomorrow from 10:00 AM to 12:00 PM.",
      "criteria": { "facility_name": "Study Room 201", "booking_date": "tomorrow", "start_time": "10:00", "end_time": "12:00" }
    }
  }'::jsonb
),
(
  'Set B',
  '{
    "register_course": {
      "title": "Register for MATH102 — Calculus II (Section A)",
      "description": "Find and register for MATH102 Calculus II, Section A taught by Dr. Christopher Moore (Mon/Wed/Fri 10:00–10:50 AM, Room M102).",
      "criteria": { "course_code": "MATH102", "section_number": "A" }
    },
    "drop_course": {
      "title": "Drop MATH102 — Calculus II (Section A)",
      "description": "Drop your MATH102 Calculus II, Section A registration that you just made.",
      "criteria": { "course_code": "MATH102", "section_number": "A" }
    },
    "book_room": {
      "title": "Book Meeting Room A for tomorrow, 2:00 PM–4:00 PM",
      "description": "Book Meeting Room A in the Administration building for tomorrow from 2:00 PM to 4:00 PM for a group meeting.",
      "criteria": { "facility_name": "Meeting Room A", "booking_date": "tomorrow", "start_time": "14:00", "end_time": "16:00" }
    },
    "cancel_booking": {
      "title": "Cancel your Meeting Room A booking for tomorrow, 2:00 PM–4:00 PM",
      "description": "Cancel the Meeting Room A booking you just made for tomorrow from 2:00 PM to 4:00 PM.",
      "criteria": { "facility_name": "Meeting Room A", "booking_date": "tomorrow", "start_time": "14:00", "end_time": "16:00" }
    }
  }'::jsonb
),
(
  'Set C',
  '{
    "register_course": {
      "title": "Register for CS101 — Introduction to Computer Science (Section A)",
      "description": "Find and register for CS101 Introduction to Computer Science, Section A taught by Dr. Sarah Johnson (Mon/Wed/Fri 9:00–9:50 AM, Room M101).",
      "criteria": { "course_code": "CS101", "section_number": "A" }
    },
    "drop_course": {
      "title": "Drop CS101 — Introduction to Computer Science (Section A)",
      "description": "Drop your CS101 Introduction to Computer Science, Section A registration that you just made.",
      "criteria": { "course_code": "CS101", "section_number": "A" }
    },
    "book_room": {
      "title": "Book Study Room 301 for tomorrow, 9:00 AM–11:00 AM",
      "description": "Book Study Room 301 in the Student Center for tomorrow from 9:00 AM to 11:00 AM for individual study.",
      "criteria": { "facility_name": "Study Room 301", "booking_date": "tomorrow", "start_time": "09:00", "end_time": "11:00" }
    },
    "cancel_booking": {
      "title": "Cancel your Study Room 301 booking for tomorrow, 9:00 AM–11:00 AM",
      "description": "Cancel the Study Room 301 booking you just made for tomorrow from 9:00 AM to 11:00 AM.",
      "criteria": { "facility_name": "Study Room 301", "booking_date": "tomorrow", "start_time": "09:00", "end_time": "11:00" }
    }
  }'::jsonb
)
ON CONFLICT (set_label) DO UPDATE SET targets = EXCLUDED.targets;
