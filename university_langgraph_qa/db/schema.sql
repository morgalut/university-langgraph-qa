DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS course_offerings;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS students;

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    major TEXT,
    year INTEGER CHECK (year BETWEEN 1 AND 6)
);

CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT
);

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    credits INTEGER NOT NULL CHECK (credits > 0)
);

CREATE TABLE course_offerings (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    teacher_id INTEGER NOT NULL REFERENCES teachers(id),
    semester TEXT NOT NULL,
    year INTEGER NOT NULL,
    UNIQUE(course_id, teacher_id, semester, year)
);

CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id),
    offering_id INTEGER NOT NULL REFERENCES course_offerings(id),
    grade NUMERIC(5,2) CHECK (grade >= 0 AND grade <= 100),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, offering_id)
);

CREATE INDEX idx_course_offerings_semester ON course_offerings(semester, year);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_offering ON enrollments(offering_id);
