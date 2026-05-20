# Example Questions

## Average grade by course
Question: `What is the average grade per course?`

Expected SQL shape:
```sql
SELECT c.code, c.title, ROUND(AVG(e.grade), 2) AS average_grade
FROM enrollments e
JOIN course_offerings co ON co.id = e.offering_id
JOIN courses c ON c.id = co.course_id
GROUP BY c.code, c.title
ORDER BY c.code;
```

## Teachers and courses
Question: `Which teachers taught which courses?`

Expected SQL shape:
```sql
SELECT t.name AS teacher, c.code, c.title, co.semester, co.year
FROM course_offerings co
JOIN teachers t ON t.id = co.teacher_id
JOIN courses c ON c.id = co.course_id;
```

## Student grades
Question: `Show student grades by course.`

Expected SQL shape:
```sql
SELECT s.name AS student, c.code, c.title, e.grade, co.semester, co.year
FROM enrollments e
JOIN students s ON s.id = e.student_id
JOIN course_offerings co ON co.id = e.offering_id
JOIN courses c ON c.id = co.course_id;
```
