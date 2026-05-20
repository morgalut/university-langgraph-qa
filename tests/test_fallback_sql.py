from app.agent.fallback_sql import generate_fallback_sql
from app.db.sql_guard import validate_read_only_sql


def test_average_question_generates_join_query():
    sql = generate_fallback_sql("What is the average grade per course?")
    safe = validate_read_only_sql(sql)
    assert "AVG" in safe.upper()
    assert "JOIN" in safe.upper()
