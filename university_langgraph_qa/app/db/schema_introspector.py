from app.db.connection import fetch_all

SCHEMA_SQL = """
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
"""

FK_SQL = """
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
"""

def get_schema_description() -> str:
    columns = fetch_all(SCHEMA_SQL)
    fks = fetch_all(FK_SQL)
    grouped: dict[str, list[str]] = {}
    for row in columns:
        grouped.setdefault(row["table_name"], []).append(f"{row['column_name']} {row['data_type']}")
    lines = ["Tables:"]
    for table, cols in grouped.items():
        lines.append(f"- {table}({', '.join(cols)})")
    lines.append("Relationships:")
    for fk in fks:
        lines.append(f"- {fk['table_name']}.{fk['column_name']} -> {fk['foreign_table_name']}.{fk['foreign_column_name']}")
    return "\n".join(lines)
