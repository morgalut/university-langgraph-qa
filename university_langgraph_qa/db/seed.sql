INSERT INTO students (name, email, major, year) VALUES
('Alice Cohen', 'alice@example.edu', 'Computer Science', 2),
('Ben Levi', 'ben@example.edu', 'Mathematics', 3),
('Maya Rosen', 'maya@example.edu', 'Computer Science', 1),
('Daniel Katz', 'daniel@example.edu', 'Physics', 4),
('Noa Amir', 'noa@example.edu', 'Mathematics', 2);

INSERT INTO teachers (name, department) VALUES
('Dr. Rachel Green', 'Computer Science'),
('Prof. David Stone', 'Mathematics'),
('Dr. Sarah Bloom', 'Physics');

INSERT INTO courses (code, title, credits) VALUES
('CS101', 'Introduction to Programming', 4),
('CS220', 'Databases', 3),
('MATH201', 'Linear Algebra', 3),
('PHY110', 'Classical Mechanics', 4);

INSERT INTO course_offerings (course_id, teacher_id, semester, year) VALUES
((SELECT id FROM courses WHERE code='CS101'), (SELECT id FROM teachers WHERE name='Dr. Rachel Green'), 'Fall', 2025),
((SELECT id FROM courses WHERE code='CS220'), (SELECT id FROM teachers WHERE name='Dr. Rachel Green'), 'Spring', 2026),
((SELECT id FROM courses WHERE code='MATH201'), (SELECT id FROM teachers WHERE name='Prof. David Stone'), 'Fall', 2025),
((SELECT id FROM courses WHERE code='PHY110'), (SELECT id FROM teachers WHERE name='Dr. Sarah Bloom'), 'Spring', 2026);

INSERT INTO enrollments (student_id, offering_id, grade) VALUES
((SELECT id FROM students WHERE name='Alice Cohen'), (SELECT co.id FROM course_offerings co JOIN courses c ON c.id=co.course_id WHERE c.code='CS101'), 92),
((SELECT id FROM students WHERE name='Ben Levi'), (SELECT co.id FROM course_offerings co JOIN courses c ON c.id=co.course_id WHERE c.code='CS101'), 81),
((SELECT id FROM students WHERE name='Maya Rosen'), (SELECT co.id FROM course_offerings co JOIN courses c ON c.id=co.course_id WHERE c.code='CS101'), 88),
((SELECT id FROM students WHERE name='Alice Cohen'), (SELECT co.id FROM course_offerings co JOIN courses c ON c.id=co.course_id WHERE c.code='CS220'), 95),
((SELECT id FROM students WHERE name='Maya Rosen'), (SELECT co.id FROM course_offerings co JOIN courses c ON c.id=co.course_id WHERE c.code='CS220'), 90),
((SELECT id FROM students WHERE name='Noa Amir'), (SELECT co.id FROM course_offerings co JOIN courses c ON c.id=co.course_id WHERE c.code='MATH201'), 86),
((SELECT id FROM students WHERE name='Ben Levi'), (SELECT co.id FROM course_offerings co JOIN courses c ON c.id=co.course_id WHERE c.code='MATH201'), 89),
((SELECT id FROM students WHERE name='Daniel Katz'), (SELECT co.id FROM course_offerings co JOIN courses c ON c.id=co.course_id WHERE c.code='PHY110'), 78);
