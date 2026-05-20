"""Deterministic fallback for tests and demos when no API key is configured."""

def generate_fallback_sql(question: str) -> str:
    q = question.lower()
    if "average" in q or "avg" in q:
        return """
        SELECT c.code, c.title, ROUND(AVG(e.grade), 2) AS average_grade
        FROM enrollments e
        JOIN course_offerings co ON co.id = e.offering_id
        JOIN courses c ON c.id = co.course_id
        GROUP BY c.code, c.title
        ORDER BY c.code
        """
    if "how many" in q or "count" in q or "number" in q:
        return """
        SELECT c.code, c.title, COUNT(e.id) AS enrolled_students
        FROM courses c
        JOIN course_offerings co ON co.course_id = c.id
        LEFT JOIN enrollments e ON e.offering_id = co.id
        GROUP BY c.code, c.title
        ORDER BY c.code
        """
    if "teacher" in q or "taught" in q or "teaches" in q:
        return """
        SELECT t.name AS teacher, c.code, c.title, co.semester, co.year
        FROM course_offerings co
        JOIN teachers t ON t.id = co.teacher_id
        JOIN courses c ON c.id = co.course_id
        ORDER BY co.year, co.semester, t.name
        """
    if "student" in q or "grade" in q:
        return """
        SELECT s.name AS student, c.code, c.title, e.grade, co.semester, co.year
        FROM enrollments e
        JOIN students s ON s.id = e.student_id
        JOIN course_offerings co ON co.id = e.offering_id
        JOIN courses c ON c.id = co.course_id
        ORDER BY s.name, c.code
        """
    return """
    SELECT c.code, c.title, t.name AS teacher, co.semester, co.year
    FROM course_offerings co
    JOIN courses c ON c.id = co.course_id
    JOIN teachers t ON t.id = co.teacher_id
    ORDER BY co.year, co.semester, c.code
    """
