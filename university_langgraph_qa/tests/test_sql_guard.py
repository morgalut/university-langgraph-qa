import pytest
from app.db.sql_guard import validate_read_only_sql, UnsafeSQLError


def test_select_gets_limit():
    sql = validate_read_only_sql("SELECT * FROM students")
    assert "LIMIT 100" in sql


def test_rejects_delete():
    with pytest.raises(UnsafeSQLError):
        validate_read_only_sql("DELETE FROM students")
