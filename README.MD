# University LangGraph QA System

A full-stack AI-powered university database question-answering system using:

* FastAPI
* PostgreSQL
* LangGraph
* OpenAI
* LangSmith
* React + Vite
* Docker Compose

The system allows users to ask natural language questions about a university database and receive AI-generated answers based on SQL queries.

---

# Features

## Backend

* FastAPI REST API
* LangGraph workflow engine
* Natural Language → SQL generation
* SQL validation/security layer
* PostgreSQL database
* LangSmith tracing
* Local execution traces
* Retry/error handling
* Unit-testable architecture

## Frontend

* React + Vite UI
* Ask questions in natural language
* View:

  * generated SQL
  * database rows
  * final answer
  * execution traces
* Modern modular architecture

---

# System Architecture

```text
React UI
   ↓
FastAPI API
   ↓
LangGraph Agent
   ├── Load Schema
   ├── Generate SQL
   ├── Validate SQL
   ├── Execute SQL
   └── Generate Answer
   ↓
PostgreSQL
```

Optional tracing:

```text
LangSmith
```

---

# Project Structure

```text
project/
├── docker-compose.yml
│
├── university_langgraph_qa/
│   ├── app/
│   ├── db/
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
└── university_qa_frontend/
    ├── src/
    ├── Dockerfile
    ├── nginx.conf
    └── package.json
```

---

# Running the Project

## 1. Start Everything

From the root folder:

```bash
docker compose up -d --build
```

---

# Services

## Frontend

```text
http://localhost:5173/
```

## FastAPI Swagger

```text
http://localhost:8000/docs
```

## PgAdmin

```text
http://localhost:5050
```

---

# PgAdmin Login

```text
Email: admin@example.com
Password: admin
```

---

# Example Questions

```text
List all teachers
```

```text
What is the average grade per course?
```

```text
Which teacher has the highest average grade in Fall 2025?
```

```text
How many students enrolled in Algorithms in Fall 2025?
```

---

# Frontend

The React UI provides:

* question input
* SQL viewer
* database rows table
* execution trace viewer
* API health checking

---

# Backend

The backend uses LangGraph nodes:

## load_schema

Loads DB schema description.

## generate_sql

Converts natural language to SQL using OpenAI.

## validate_sql

Ensures only safe read-only SQL executes.

## execute_sql

Runs SQL against PostgreSQL.

## formulate_answer

Creates human-readable answer.

## handle_error

Handles invalid SQL/errors.

---

# Tracing

## Local tracing

Stored under:

```text
traces/
```

## LangSmith tracing

Enable in `.env`:

```env
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=your_key
LANGSMITH_PROJECT=university-langgraph-qa
```

Dashboard:

```text
https://smith.langchain.com
```

---

# Environment Variables

## Backend `.env`

```env
OPENAI_API_KEY=your_openai_key

LANGSMITH_TRACING=true
LANGSMITH_API_KEY=your_langsmith_key
LANGSMITH_PROJECT=university-langgraph-qa
```

---

# Development

## Backend

```bash
cd university_langgraph_qa
uvicorn app.main:app --reload
```

## Frontend

```bash
cd university_qa_frontend
npm install
npm run dev
```

---

# Production Considerations

For production systems:

* authentication
* HTTPS
* rate limiting
* monitoring
* secrets management
* SQL sandboxing
* RBAC
* observability
* autoscaling
* caching

should be added.

---

# Technologies Used

## Backend

* Python
* FastAPI
* LangGraph
* LangChain
* PostgreSQL
* SQLAlchemy
* Pydantic

## Frontend

* React
* Vite
* TailwindCSS
* Framer Motion

## Infrastructure

* Docker
* Docker Compose
* Nginx

---

# Notes

* All business logic runs locally.
* PostgreSQL runs locally in Docker.
* LangSmith is optional and used only for observability/tracing.
* The architecture is modular and database-agnostic.

---

# Quick Start

```bash
docker compose up -d --build
```

Open:

```text
Frontend:
http://localhost:5173/

Backend:
http://localhost:8000/docs
```
