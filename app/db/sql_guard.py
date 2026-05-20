import re
import sqlparse

FORBIDDEN = re.compile(r"\b(insert|update|delete|drop|alter|truncate|create|grant|revoke|copy)\b", re.I)

class UnsafeSQLError(ValueError):
    pass

def validate_read_only_sql(sql: str) -> str:
    cleaned = sql.strip().rstrip(";")
    if not cleaned:
        raise UnsafeSQLError("SQL is empty")
    parsed = sqlparse.parse(cleaned)
    if len(parsed) != 1:
        raise UnsafeSQLError("Only one SQL statement is allowed")
    if parsed[0].get_type() != "SELECT":
        raise UnsafeSQLError("Only SELECT statements are allowed")
    if FORBIDDEN.search(cleaned):
        raise UnsafeSQLError("SQL contains forbidden write/admin keyword")
    if " limit " not in f" {cleaned.lower()} ":
        cleaned += " LIMIT 100"
    return cleaned
