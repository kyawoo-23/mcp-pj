-- ----------------------------------------------------------------------------
-- Seed task definitions and surveys
-- ----------------------------------------------------------------------------

INSERT INTO task_definitions (system_type, task_code, title, description, success_criteria)
VALUES
  ('chat_agent', 'register_course', 'Register for a course', 'Complete a course registration via chat', 'Registration created in student_registrations'),
  ('chat_agent', 'drop_course', 'Drop a course', 'Drop an existing course registration via chat', 'Registration status set to dropped'),
  ('chat_agent', 'book_room', 'Book a room', 'Book a facility via chat', 'Booking created in facility_bookings'),
  ('chat_agent', 'cancel_booking', 'Cancel a booking', 'Cancel an existing booking via chat', 'Booking status set to cancelled'),
  ('traditional', 'register_course', 'Register for a course', 'Complete a course registration in the UI', 'Registration created in student_registrations'),
  ('traditional', 'drop_course', 'Drop a course', 'Drop an existing course registration in the UI', 'Registration status set to dropped'),
  ('traditional', 'book_room', 'Book a room', 'Book a facility in the UI', 'Booking created in facility_bookings'),
  ('traditional', 'cancel_booking', 'Cancel a booking', 'Cancel an existing booking in the UI', 'Booking status set to cancelled');

INSERT INTO task_surveys (survey_name, version)
VALUES
  ('SUS', '1'),
  ('NASA_TLX', '1')
ON CONFLICT (survey_name, version) DO NOTHING;

-- SUS questions (Likert 1-5)
INSERT INTO task_survey_questions (survey_id, question_text, scale_type, min_value, max_value, order_index)
SELECT id, question_text, 'likert_5', 1, 5, order_index
FROM task_surveys
CROSS JOIN (
  VALUES
    (1, 'I think that I would like to use this system frequently.'),
    (2, 'I found the system unnecessarily complex.'),
    (3, 'I thought the system was easy to use.'),
    (4, 'I think that I would need the support of a technical person to be able to use this system.'),
    (5, 'I found the various functions in this system were well integrated.'),
    (6, 'I thought there was too much inconsistency in this system.'),
    (7, 'I would imagine that most people would learn to use this system very quickly.'),
    (8, 'I found the system very cumbersome to use.'),
    (9, 'I felt very confident using the system.'),
    (10, 'I needed to learn a lot of things before I could get going with this system.')
) AS sus(order_index, question_text)
WHERE task_surveys.survey_name = 'SUS' AND task_surveys.version = '1';

-- NASA-TLX questions (0-100)
INSERT INTO task_survey_questions (survey_id, question_text, scale_type, min_value, max_value, order_index)
SELECT id, question_text, 'numeric_0_100', 0, 100, order_index
FROM task_surveys
CROSS JOIN (
  VALUES
    (1, 'Mental demand: How mentally demanding was the task?'),
    (2, 'Physical demand: How physically demanding was the task?'),
    (3, 'Temporal demand: How hurried or rushed was the pace of the task?'),
    (4, 'Performance: How successful were you in accomplishing what you were asked to do?'),
    (5, 'Effort: How hard did you have to work to accomplish your level of performance?'),
    (6, 'Frustration: How insecure, discouraged, irritated, stressed, and annoyed were you?')
) AS tlx(order_index, question_text)
WHERE task_surveys.survey_name = 'NASA_TLX' AND task_surveys.version = '1';

-- Interview questions
INSERT INTO task_interview_questions (question_text, order_index)
VALUES
  ('Which system felt more in control?', 1),
  ('Where did you hesitate?', 2),
  ('Did the AI behave as expected?', 3),
  ('Which system would you prefer for real use, and why?', 4)
ON CONFLICT (order_index) DO NOTHING;
