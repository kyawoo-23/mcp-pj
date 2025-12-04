-- Seed data for Supabase
-- This file seeds the database with sample data for facilities, courses, and course sections

-- ============================================================================
-- FACILITIES
-- ============================================================================

INSERT INTO facilities (name, facility_type, building, room_number, capacity, description, amenities) VALUES
-- Study Rooms
('Study Room 101', 'study_room', 'Library', '101', 4, 'Quiet study room with whiteboard', ARRAY['whiteboard', 'wifi', 'power_outlets']),
('Study Room 102', 'study_room', 'Library', '102', 6, 'Group study room with projector', ARRAY['projector', 'whiteboard', 'wifi', 'power_outlets']),
('Study Room 103', 'study_room', 'Library', '103', 4, 'Small study room for individual or pair work', ARRAY['whiteboard', 'wifi']),
('Study Room 201', 'study_room', 'Library', '201', 8, 'Large group study room', ARRAY['projector', 'whiteboard', 'wifi', 'power_outlets', 'hdmi_cable']),
('Study Room 202', 'study_room', 'Library', '202', 4, 'Quiet study space', ARRAY['whiteboard', 'wifi']),
('Study Room 301', 'study_room', 'Student Center', '301', 6, 'Collaborative study space', ARRAY['projector', 'whiteboard', 'wifi', 'power_outlets']),
('Study Room 302', 'study_room', 'Student Center', '302', 4, 'Quiet study room', ARRAY['whiteboard', 'wifi']),

-- Computer Labs
('Computer Lab A', 'computer_lab', 'Engineering', 'E101', 30, 'Windows-based computer lab', ARRAY['projector', 'wifi', 'windows_pcs', 'printer']),
('Computer Lab B', 'computer_lab', 'Engineering', 'E102', 25, 'Mac-based computer lab', ARRAY['projector', 'wifi', 'mac_pcs', 'printer']),
('Computer Lab C', 'computer_lab', 'Science', 'S201', 20, 'Linux-based computer lab for programming', ARRAY['projector', 'wifi', 'linux_pcs', 'whiteboard']),
('Computer Lab D', 'computer_lab', 'Business', 'B301', 35, 'General purpose computer lab', ARRAY['projector', 'wifi', 'windows_pcs', 'printer', 'scanner']),

-- Labs
('Chemistry Lab 1', 'lab', 'Science', 'S101', 24, 'General chemistry laboratory', ARRAY['lab_equipment', 'safety_equipment', 'fume_hoods', 'wifi']),
('Chemistry Lab 2', 'lab', 'Science', 'S102', 24, 'Organic chemistry laboratory', ARRAY['lab_equipment', 'safety_equipment', 'fume_hoods', 'wifi']),
('Physics Lab 1', 'lab', 'Science', 'S301', 20, 'Physics experiments laboratory', ARRAY['lab_equipment', 'safety_equipment', 'wifi', 'whiteboard']),
('Biology Lab 1', 'lab', 'Science', 'S401', 22, 'Biology and microbiology lab', ARRAY['lab_equipment', 'microscopes', 'safety_equipment', 'wifi']),
('Engineering Lab 1', 'lab', 'Engineering', 'E201', 18, 'Electronics and circuits lab', ARRAY['lab_equipment', 'oscilloscopes', 'power_supplies', 'wifi']),

-- Meeting Rooms
('Meeting Room A', 'meeting_room', 'Administration', 'A101', 10, 'Small meeting room', ARRAY['projector', 'whiteboard', 'wifi', 'video_conference']),
('Meeting Room B', 'meeting_room', 'Administration', 'A102', 15, 'Medium meeting room', ARRAY['projector', 'whiteboard', 'wifi', 'video_conference', 'phone']),
('Meeting Room C', 'meeting_room', 'Student Center', 'SC201', 20, 'Large meeting room', ARRAY['projector', 'whiteboard', 'wifi', 'video_conference', 'phone', 'microphone']),
('Meeting Room D', 'meeting_room', 'Business', 'B201', 12, 'Business meeting room', ARRAY['projector', 'whiteboard', 'wifi', 'video_conference']),
('Conference Room', 'meeting_room', 'Administration', 'A301', 30, 'Large conference room for presentations', ARRAY['projector', 'whiteboard', 'wifi', 'video_conference', 'microphone', 'sound_system']),

-- Lecture Halls
('Lecture Hall 1', 'lecture_hall', 'Main Building', 'M101', 150, 'Large lecture hall with tiered seating', ARRAY['projector', 'whiteboard', 'wifi', 'microphone', 'sound_system', 'recording_equipment']),
('Lecture Hall 2', 'lecture_hall', 'Main Building', 'M102', 120, 'Medium lecture hall', ARRAY['projector', 'whiteboard', 'wifi', 'microphone', 'sound_system']),
('Lecture Hall 3', 'lecture_hall', 'Science', 'S501', 100, 'Science lecture hall', ARRAY['projector', 'whiteboard', 'wifi', 'microphone', 'lab_demo_area']),

-- Library Spaces
('Library Study Area 1', 'library_space', 'Library', 'L101', 50, 'Open study area with tables', ARRAY['wifi', 'power_outlets', 'quiet_zone']),
('Library Study Area 2', 'library_space', 'Library', 'L201', 40, 'Collaborative study area', ARRAY['wifi', 'power_outlets', 'whiteboard']),
('Library Reading Room', 'library_space', 'Library', 'L301', 30, 'Quiet reading room', ARRAY['wifi', 'comfortable_seating']);

-- ============================================================================
-- COURSES
-- ============================================================================

INSERT INTO courses (code, title, description, credits, department) VALUES
-- Computer Science
('CS101', 'Introduction to Computer Science', 'Fundamental concepts of computer science including algorithms, data structures, and programming basics.', 3, 'Computer Science'),
('CS102', 'Data Structures and Algorithms', 'Study of fundamental data structures (arrays, linked lists, trees, graphs) and algorithm design techniques.', 3, 'Computer Science'),
('CS201', 'Object-Oriented Programming', 'Principles of object-oriented programming using modern programming languages.', 3, 'Computer Science'),
('CS202', 'Database Systems', 'Introduction to database design, SQL, and database management systems.', 3, 'Computer Science'),
('CS301', 'Software Engineering', 'Software development lifecycle, design patterns, and project management.', 3, 'Computer Science'),
('CS302', 'Web Development', 'Modern web development including frontend and backend technologies.', 3, 'Computer Science'),
('CS401', 'Machine Learning', 'Introduction to machine learning algorithms and applications.', 3, 'Computer Science'),
('CS402', 'Computer Networks', 'Network protocols, architecture, and security fundamentals.', 3, 'Computer Science'),

-- Mathematics
('MATH101', 'Calculus I', 'Limits, derivatives, and applications of differentiation.', 4, 'Mathematics'),
('MATH102', 'Calculus II', 'Integration techniques, sequences, and series.', 4, 'Mathematics'),
('MATH201', 'Linear Algebra', 'Vector spaces, matrices, eigenvalues, and eigenvectors.', 3, 'Mathematics'),
('MATH202', 'Discrete Mathematics', 'Logic, set theory, combinatorics, and graph theory.', 3, 'Mathematics'),
('MATH301', 'Probability and Statistics', 'Probability theory, statistical inference, and data analysis.', 3, 'Mathematics'),
('MATH302', 'Differential Equations', 'Ordinary and partial differential equations with applications.', 3, 'Mathematics'),

-- Physics
('PHYS101', 'General Physics I', 'Mechanics, waves, and thermodynamics.', 4, 'Physics'),
('PHYS102', 'General Physics II', 'Electricity, magnetism, and optics.', 4, 'Physics'),
('PHYS201', 'Modern Physics', 'Special relativity, quantum mechanics, and atomic physics.', 3, 'Physics'),
('PHYS301', 'Electromagnetism', 'Advanced treatment of electric and magnetic fields.', 3, 'Physics'),

-- Chemistry
('CHEM101', 'General Chemistry I', 'Atomic structure, chemical bonding, and stoichiometry.', 4, 'Chemistry'),
('CHEM102', 'General Chemistry II', 'Thermodynamics, kinetics, and equilibrium.', 4, 'Chemistry'),
('CHEM201', 'Organic Chemistry I', 'Structure, properties, and reactions of organic compounds.', 3, 'Chemistry'),
('CHEM202', 'Organic Chemistry II', 'Advanced organic reactions and synthesis.', 3, 'Chemistry'),

-- Biology
('BIO101', 'General Biology I', 'Cell biology, genetics, and molecular biology.', 4, 'Biology'),
('BIO102', 'General Biology II', 'Ecology, evolution, and organismal biology.', 4, 'Biology'),
('BIO201', 'Genetics', 'Principles of heredity and genetic analysis.', 3, 'Biology'),
('BIO301', 'Microbiology', 'Study of microorganisms and their applications.', 3, 'Biology'),

-- Business
('BUS101', 'Introduction to Business', 'Overview of business principles and practices.', 3, 'Business'),
('BUS201', 'Principles of Marketing', 'Marketing strategies, consumer behavior, and market research.', 3, 'Business'),
('BUS202', 'Financial Accounting', 'Accounting principles and financial statement analysis.', 3, 'Business'),
('BUS301', 'Management Principles', 'Organizational behavior and management theories.', 3, 'Business'),
('BUS302', 'Operations Management', 'Production systems, quality control, and supply chain management.', 3, 'Business'),

-- Engineering
('ENG101', 'Introduction to Engineering', 'Engineering fundamentals and design process.', 3, 'Engineering'),
('ENG201', 'Engineering Mechanics', 'Statics and dynamics of engineering systems.', 3, 'Engineering'),
('ENG202', 'Electrical Circuits', 'DC and AC circuit analysis.', 3, 'Engineering'),
('ENG301', 'Thermodynamics', 'Energy, heat, and work in engineering systems.', 3, 'Engineering'),

-- English
('ENGL101', 'Composition I', 'Academic writing and critical thinking.', 3, 'English'),
('ENGL102', 'Composition II', 'Advanced writing and research methods.', 3, 'English'),
('ENGL201', 'World Literature', 'Survey of world literature from ancient to modern times.', 3, 'English'),
('ENGL202', 'American Literature', 'Major works and movements in American literature.', 3, 'English'),

-- Psychology
('PSY101', 'Introduction to Psychology', 'Overview of psychological principles and research methods.', 3, 'Psychology'),
('PSY201', 'Developmental Psychology', 'Human development across the lifespan.', 3, 'Psychology'),
('PSY202', 'Cognitive Psychology', 'Mental processes including perception, memory, and thinking.', 3, 'Psychology'),
('PSY301', 'Abnormal Psychology', 'Psychological disorders and treatment approaches.', 3, 'Psychology');

-- ============================================================================
-- COURSE SECTIONS
-- ============================================================================

-- Note: We'll use subqueries to get course IDs. For Spring 2025 semester.

-- CS101 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Sarah Johnson', 'Spring', 2025, 40, ARRAY['Monday', 'Wednesday', 'Friday'], '09:00:00', '09:50:00', 'M101'
FROM courses WHERE code = 'CS101';

INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'B', 'Prof. Michael Chen', 'Spring', 2025, 35, ARRAY['Tuesday', 'Thursday'], '10:30:00', '12:00:00', 'M102'
FROM courses WHERE code = 'CS101';

INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'C', 'Dr. Sarah Johnson', 'Spring', 2025, 30, ARRAY['Monday', 'Wednesday', 'Friday'], '14:00:00', '14:50:00', 'E101'
FROM courses WHERE code = 'CS101';

-- CS102 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. David Kim', 'Spring', 2025, 35, ARRAY['Monday', 'Wednesday', 'Friday'], '10:00:00', '10:50:00', 'M102'
FROM courses WHERE code = 'CS102';

INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'B', 'Prof. Lisa Wang', 'Spring', 2025, 30, ARRAY['Tuesday', 'Thursday'], '13:00:00', '14:30:00', 'E101'
FROM courses WHERE code = 'CS102';

-- CS201 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Robert Martinez', 'Spring', 2025, 30, ARRAY['Monday', 'Wednesday', 'Friday'], '11:00:00', '11:50:00', 'E102'
FROM courses WHERE code = 'CS201';

INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'B', 'Dr. Robert Martinez', 'Spring', 2025, 25, ARRAY['Tuesday', 'Thursday'], '15:00:00', '16:30:00', 'E102'
FROM courses WHERE code = 'CS201';

-- CS202 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Prof. Jennifer Lee', 'Spring', 2025, 28, ARRAY['Monday', 'Wednesday', 'Friday'], '13:00:00', '13:50:00', 'E101'
FROM courses WHERE code = 'CS202';

-- CS301 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Thomas Anderson', 'Spring', 2025, 25, ARRAY['Tuesday', 'Thursday'], '10:00:00', '11:30:00', 'E201'
FROM courses WHERE code = 'CS301';

-- CS302 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Prof. Emily Brown', 'Spring', 2025, 30, ARRAY['Monday', 'Wednesday', 'Friday'], '14:00:00', '14:50:00', 'E101'
FROM courses WHERE code = 'CS302';

-- MATH101 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. James Wilson', 'Spring', 2025, 45, ARRAY['Monday', 'Wednesday', 'Friday'], '09:00:00', '09:50:00', 'M101'
FROM courses WHERE code = 'MATH101';

INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'B', 'Prof. Patricia Taylor', 'Spring', 2025, 40, ARRAY['Tuesday', 'Thursday'], '10:30:00', '12:00:00', 'M102'
FROM courses WHERE code = 'MATH101';

INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'C', 'Dr. James Wilson', 'Spring', 2025, 35, ARRAY['Monday', 'Wednesday', 'Friday'], '15:00:00', '15:50:00', 'M101'
FROM courses WHERE code = 'MATH101';

-- MATH102 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Christopher Moore', 'Spring', 2025, 40, ARRAY['Monday', 'Wednesday', 'Friday'], '10:00:00', '10:50:00', 'M102'
FROM courses WHERE code = 'MATH102';

INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'B', 'Prof. Maria Garcia', 'Spring', 2025, 35, ARRAY['Tuesday', 'Thursday'], '13:00:00', '14:30:00', 'M101'
FROM courses WHERE code = 'MATH102';

-- MATH201 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Richard Jackson', 'Spring', 2025, 30, ARRAY['Monday', 'Wednesday', 'Friday'], '11:00:00', '11:50:00', 'M102'
FROM courses WHERE code = 'MATH201';

-- MATH202 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Prof. Susan White', 'Spring', 2025, 28, ARRAY['Tuesday', 'Thursday'], '11:00:00', '12:30:00', 'M102'
FROM courses WHERE code = 'MATH202';

-- PHYS101 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Daniel Harris', 'Spring', 2025, 50, ARRAY['Monday', 'Wednesday', 'Friday'], '09:00:00', '09:50:00', 'S501'
FROM courses WHERE code = 'PHYS101';

INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'B', 'Prof. Nancy Martin', 'Spring', 2025, 45, ARRAY['Tuesday', 'Thursday'], '10:30:00', '12:00:00', 'S501'
FROM courses WHERE code = 'PHYS101';

-- PHYS102 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Kevin Thompson', 'Spring', 2025, 45, ARRAY['Monday', 'Wednesday', 'Friday'], '10:00:00', '10:50:00', 'S501'
FROM courses WHERE code = 'PHYS102';

-- CHEM101 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Amanda Lewis', 'Spring', 2025, 40, ARRAY['Monday', 'Wednesday', 'Friday'], '09:00:00', '09:50:00', 'S101'
FROM courses WHERE code = 'CHEM101';

INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'B', 'Prof. Mark Walker', 'Spring', 2025, 35, ARRAY['Tuesday', 'Thursday'], '10:30:00', '12:00:00', 'S101'
FROM courses WHERE code = 'CHEM101';

-- CHEM102 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Laura Hall', 'Spring', 2025, 35, ARRAY['Monday', 'Wednesday', 'Friday'], '11:00:00', '11:50:00', 'S102'
FROM courses WHERE code = 'CHEM102';

-- CHEM201 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Steven Young', 'Spring', 2025, 30, ARRAY['Tuesday', 'Thursday'], '13:00:00', '14:30:00', 'S102'
FROM courses WHERE code = 'CHEM201';

-- BIO101 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Michelle King', 'Spring', 2025, 40, ARRAY['Monday', 'Wednesday', 'Friday'], '09:00:00', '09:50:00', 'S401'
FROM courses WHERE code = 'BIO101';

INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'B', 'Prof. Brian Wright', 'Spring', 2025, 35, ARRAY['Tuesday', 'Thursday'], '10:30:00', '12:00:00', 'S401'
FROM courses WHERE code = 'BIO101';

-- BIO102 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Jessica Lopez', 'Spring', 2025, 35, ARRAY['Monday', 'Wednesday', 'Friday'], '10:00:00', '10:50:00', 'S401'
FROM courses WHERE code = 'BIO102';

-- BUS101 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Prof. Robert Hill', 'Spring', 2025, 50, ARRAY['Monday', 'Wednesday', 'Friday'], '09:00:00', '09:50:00', 'B301'
FROM courses WHERE code = 'BUS101';

INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'B', 'Dr. Karen Scott', 'Spring', 2025, 45, ARRAY['Tuesday', 'Thursday'], '10:30:00', '12:00:00', 'B301'
FROM courses WHERE code = 'BUS101';

-- BUS201 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Prof. Timothy Green', 'Spring', 2025, 40, ARRAY['Monday', 'Wednesday', 'Friday'], '11:00:00', '11:50:00', 'B201'
FROM courses WHERE code = 'BUS201';

-- BUS202 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Stephanie Adams', 'Spring', 2025, 35, ARRAY['Tuesday', 'Thursday'], '13:00:00', '14:30:00', 'B301'
FROM courses WHERE code = 'BUS202';

-- ENG101 (Engineering) Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Matthew Baker', 'Spring', 2025, 30, ARRAY['Monday', 'Wednesday', 'Friday'], '13:00:00', '13:50:00', 'E201'
FROM courses WHERE code = 'ENG101' AND department = 'Engineering';

-- ENG201 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Prof. Rachel Nelson', 'Spring', 2025, 28, ARRAY['Tuesday', 'Thursday'], '14:00:00', '15:30:00', 'E201'
FROM courses WHERE code = 'ENG201';

-- ENG202 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Jason Carter', 'Spring', 2025, 25, ARRAY['Monday', 'Wednesday', 'Friday'], '14:00:00', '14:50:00', 'E201'
FROM courses WHERE code = 'ENG202';

-- ENGL101 (English) Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Prof. Elizabeth Mitchell', 'Spring', 2025, 25, ARRAY['Monday', 'Wednesday', 'Friday'], '10:00:00', '10:50:00', 'A101'
FROM courses WHERE code = 'ENGL101';

INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'B', 'Dr. Andrew Perez', 'Spring', 2025, 25, ARRAY['Tuesday', 'Thursday'], '11:00:00', '12:30:00', 'A102'
FROM courses WHERE code = 'ENGL101';

-- ENGL102 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Prof. Kimberly Roberts', 'Spring', 2025, 25, ARRAY['Monday', 'Wednesday', 'Friday'], '11:00:00', '11:50:00', 'A101'
FROM courses WHERE code = 'ENGL102';

-- PSY101 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Nicole Turner', 'Spring', 2025, 50, ARRAY['Monday', 'Wednesday', 'Friday'], '09:00:00', '09:50:00', 'M101'
FROM courses WHERE code = 'PSY101';

INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'B', 'Prof. Ryan Phillips', 'Spring', 2025, 45, ARRAY['Tuesday', 'Thursday'], '10:30:00', '12:00:00', 'M102'
FROM courses WHERE code = 'PSY101';

-- PSY201 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Samantha Campbell', 'Spring', 2025, 35, ARRAY['Monday', 'Wednesday', 'Friday'], '12:00:00', '12:50:00', 'M102'
FROM courses WHERE code = 'PSY201';

-- PSY202 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Prof. Justin Parker', 'Spring', 2025, 30, ARRAY['Tuesday', 'Thursday'], '14:00:00', '15:30:00', 'M102'
FROM courses WHERE code = 'PSY202';

-- CS401 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Alex Zhang', 'Spring', 2025, 25, ARRAY['Tuesday', 'Thursday'], '13:00:00', '14:30:00', 'E101'
FROM courses WHERE code = 'CS401';

-- CS402 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Prof. Kevin Liu', 'Spring', 2025, 28, ARRAY['Monday', 'Wednesday', 'Friday'], '12:00:00', '12:50:00', 'E102'
FROM courses WHERE code = 'CS402';

-- MATH301 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Benjamin Davis', 'Spring', 2025, 30, ARRAY['Monday', 'Wednesday', 'Friday'], '12:00:00', '12:50:00', 'M101'
FROM courses WHERE code = 'MATH301';

-- MATH302 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Prof. Catherine Miller', 'Spring', 2025, 28, ARRAY['Tuesday', 'Thursday'], '11:00:00', '12:30:00', 'M101'
FROM courses WHERE code = 'MATH302';

-- PHYS201 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Gregory Foster', 'Spring', 2025, 35, ARRAY['Monday', 'Wednesday', 'Friday'], '11:00:00', '11:50:00', 'S501'
FROM courses WHERE code = 'PHYS201';

-- PHYS301 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Prof. Deborah Cooper', 'Spring', 2025, 30, ARRAY['Tuesday', 'Thursday'], '13:00:00', '14:30:00', 'S501'
FROM courses WHERE code = 'PHYS301';

-- CHEM202 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Paul Rivera', 'Spring', 2025, 28, ARRAY['Monday', 'Wednesday', 'Friday'], '12:00:00', '12:50:00', 'S102'
FROM courses WHERE code = 'CHEM202';

-- BIO201 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Rebecca Torres', 'Spring', 2025, 30, ARRAY['Tuesday', 'Thursday'], '11:00:00', '12:30:00', 'S401'
FROM courses WHERE code = 'BIO201';

-- BIO301 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Prof. Frank Collins', 'Spring', 2025, 25, ARRAY['Monday', 'Wednesday', 'Friday'], '13:00:00', '13:50:00', 'S401'
FROM courses WHERE code = 'BIO301';

-- BUS301 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Victoria Reed', 'Spring', 2025, 35, ARRAY['Monday', 'Wednesday', 'Friday'], '12:00:00', '12:50:00', 'B201'
FROM courses WHERE code = 'BUS301';

-- BUS302 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Prof. George Bailey', 'Spring', 2025, 32, ARRAY['Tuesday', 'Thursday'], '14:00:00', '15:30:00', 'B301'
FROM courses WHERE code = 'BUS302';

-- ENG301 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Helen Murphy', 'Spring', 2025, 25, ARRAY['Monday', 'Wednesday', 'Friday'], '15:00:00', '15:50:00', 'E201'
FROM courses WHERE code = 'ENG301';

-- ENGL201 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Prof. Charles Hughes', 'Spring', 2025, 25, ARRAY['Tuesday', 'Thursday'], '10:00:00', '11:30:00', 'A101'
FROM courses WHERE code = 'ENGL201';

-- ENGL202 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Dorothy Price', 'Spring', 2025, 25, ARRAY['Monday', 'Wednesday', 'Friday'], '13:00:00', '13:50:00', 'A102'
FROM courses WHERE code = 'ENGL202';

-- PSY301 Sections
INSERT INTO course_sections (course_id, section_number, instructor, semester, year, capacity, schedule_days, start_time, end_time, room_location)
SELECT id, 'A', 'Dr. Raymond Wood', 'Spring', 2025, 30, ARRAY['Monday', 'Wednesday', 'Friday'], '13:00:00', '13:50:00', 'M102'
FROM courses WHERE code = 'PSY301';
