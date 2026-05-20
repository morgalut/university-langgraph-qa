# University Database + LangGraph QA Agent Design

## Goal
Build a small, explainable QA system that answers natural-language questions over a university PostgreSQL database.

## Main parts

### 1. Database
Core entities:
- `students`: student identity and basic academic info.
- `teachers`: teacher identity and department.
- `courses`: reusable course catalog records.
- `course_offerings`: a specific course taught by a teacher in a semester/year.
- `enrollments`: a student enrolled in an offering, with an optional grade.

This separates the course catalog from a real semester offering, which makes joins and interview explanation clean.

### 2. API
FastAPI exposes:
- `GET /health`
- `POST /ask` with `{ "question": "..." }`

### 3. LangGraph workflow
The graph is:

`User Input -> load_schema -> generate_sql -> validate_sql -> execute_sql -> formulate_answer -> Final Answer`

Error path:

`validate_sql/execute_sql -> handle_error`

### 4. DB-agnostic design
Schema-specific details are isolated in:
- `db/schema.sql`
- `db/seed.sql`
- `app/db/schema_introspector.py`

The agent reads schema metadata dynamically from `information_schema`, so the prompt can be adapted to another database without rewriting graph logic.

### 5. Safety and debugging
The system validates SQL before execution:
- only one statement
- only `SELECT`
- rejects write/admin keywords
- adds `LIMIT 100` when missing

Each node records a local trace event. LangSmith can also be enabled through environment variables.

### 6. Production considerations
For production, add:
- real auth and authorization
- row-level permissions
- stricter SQL AST validation
- query timeout and max cost limits
- connection pooling configuration
- persistent trace storage
- monitoring dashboards and alerts
- migration tooling such as Alembic
- CI for tests and formatting
