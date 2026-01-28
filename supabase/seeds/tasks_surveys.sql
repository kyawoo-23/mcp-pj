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
  ('RAW_TLX', '1'),  -- Raw-TLX: Unweighted NASA-TLX (no pairwise comparisons, no weighting)
  ('SDT', '1')
ON CONFLICT (survey_name, version) DO NOTHING;

-- SUS questions (Likert 1-5)
INSERT INTO task_survey_questions (survey_id, question_text, scale_type, min_value, max_value, order_index, construct)
SELECT id, question_text, 'likert_5', 1, 5, order_index, 'Usability'::survey_construct
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
    (8, 'I found the system very awkward to use.'),
    (9, 'I felt very confident using the system.'),
    (10, 'I needed to learn a lot of things before I could get going with this system.')
) AS sus(order_index, question_text)
WHERE task_surveys.survey_name = 'SUS' AND task_surveys.version = '1';

-- Raw-TLX questions (0-100 scale)
-- Raw-TLX = Unweighted NASA-TLX (no pairwise comparisons, no weighting)
-- Scoring: Average of 6 dimensions, with Performance reverse-coded during analysis
-- 
-- IMPORTANT: Performance (order_index = 4) is reverse-coded during analysis:
--   performance_workload = 100 - performance_score
-- This is because high performance = good, but high workload = bad.
-- Do NOT change stored values; apply reverse-coding only during analysis.
--
-- Raw-TLX formula:
--   Raw_TLX = (mental_demand + physical_demand + temporal_demand + 
--              (100 - performance) + effort + frustration) / 6
INSERT INTO task_survey_questions (survey_id, question_text, scale_type, min_value, max_value, order_index, construct)
SELECT id, question_text, 'numeric_0_100', 0, 100, order_index, 'Workload'::survey_construct
FROM task_surveys
CROSS JOIN (
  VALUES
    (1, 'Mental demand: How mentally demanding was the task?'),
    (2, 'Physical demand: How physically demanding was the task?'),
    (3, 'Temporal demand: How hurried or rushed was the pace of the task?'),
    (4, 'Performance: How successful were you in accomplishing what you were asked to do?'),  -- REVERSE-CODED in analysis
    (5, 'Effort: How hard did you have to work to accomplish your level of performance?'),
    (6, 'Frustration: How insecure, discouraged, irritated, stressed, and annoyed were you?')
) AS tlx(order_index, question_text)
WHERE task_surveys.survey_name = 'RAW_TLX' AND task_surveys.version = '1';

-- SDT (Autonomy, Competence, Satisfaction) questions (Likert 1-7)
INSERT INTO task_survey_questions (survey_id, question_text, scale_type, min_value, max_value, order_index, construct)
SELECT id, question_text, 'likert_7', 1, 7, order_index, construct::survey_construct
FROM task_surveys
CROSS JOIN (
  VALUES
    -- Autonomy
    (1, 'I felt I had control over how to complete the tasks.', 'Autonomy'),
    (2, 'I felt able to use the system in my own way.', 'Autonomy'),
    (3, 'My actions in the system felt voluntary and self-endorsed.', 'Autonomy'),
    
    -- Competence
    (4, 'I felt competent while using the system.', 'Competence'),
    (5, 'I felt capable of achieving my goals with this system.', 'Competence'),
    (6, 'I felt effective in using the system.', 'Competence'),

    -- Performance Satisfaction
    (7, 'I am satisfied with my performance in the tasks.', 'Performance Satisfaction'),
    (8, 'I am satisfied with the results I achieved.', 'Performance Satisfaction'),

    -- System Satisfaction
    (9, 'Overall, I am satisfied with this system.', 'System Satisfaction'),
    (10, 'This system meets my expectations for completing these tasks.', 'System Satisfaction')
) AS sdt(order_index, question_text, construct)
WHERE task_surveys.survey_name = 'SDT' AND task_surveys.version = '1';

-- Interview questions
INSERT INTO task_interview_questions (question_text, options, order_index)
VALUES
  ('Which system made you feel more in control of task execution?', '["Chat-based system", "Traditional UI", "Both equally", "Neither"]'::jsonb, 1),
  ('In which system was it clearer what actions were being performed on your behalf?', '["Chat-based system", "Traditional UI", "Both equally", "Neither"]'::jsonb, 2),
  ('Which system behaved more predictably during task completion?', '["Chat-based system", "Traditional UI", "Both equally", "Neither"]'::jsonb, 3),
  ('Which system would you trust more to complete similar tasks without close supervision?', '["Chat-based system", "Traditional UI", "Both equally", "Neither"]'::jsonb, 4),
  ('Which system would you prefer depending on the task?', '["Chat-based system for most tasks", "Traditional UI for most tasks", "Chat for simple tasks, UI for complex tasks", "No clear preference"]'::jsonb, 5)
ON CONFLICT (order_index) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  options = EXCLUDED.options;
