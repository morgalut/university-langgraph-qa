# University Database + LangGraph QA Agent

A FastAPI + PostgreSQL + LangGraph question-answering system for a university database.

## Run locally

```bash
cp .env.example .env
# Optional: add OPENAI_API_KEY to .env for real LLM SQL generation
docker compose up --build

# Or Local 
uvicorn app.main:app --reload
```

Services:
- API: http://localhost:8000/docs
- PostgreSQL: localhost:5432
- PgAdmin: http://localhost:5050
  - email: `admin@example.com`
  - password: `admin`

PgAdmin connection:
- host: `postgres`
- user: `university`
- password: `university`
- database: `university_db`

## Ask a question

```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the average grade per course?"}'
```

## Run tests

```bash
pytest
```

Some tests do not require a live database. End-to-end DB tests can be added after the Docker database is running.

## Architecture

See `docs/DESIGN.md`.

## Tracing

Every `/ask` response includes a local trace:

`User Input -> LangGraph Nodes -> SQL -> DB Results -> Final Answer`

To enable LangSmith tracing, set these in `.env`:

```bash
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=your_key
LANGSMITH_PROJECT=university-langgraph-qa
```
