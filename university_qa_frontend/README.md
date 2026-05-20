# University QA Agent Frontend

React + Vite UI for the FastAPI/LangGraph university database QA agent.

## Run backend first

From the Python backend project:

```bash
uvicorn app.main:app --reload
```

Backend should be available at:

```text
http://127.0.0.1:8000
```

## Run frontend

```bash
cd university_qa_frontend
cp .env.example .env
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

## API endpoints used

- `GET /health`
- `POST /ask`

Expected `/ask` body:

```json
{
  "question": "List all teachers"
}
```

Expected response shape:

```json
{
  "answer": "...",
  "sql": "...",
  "rows": [],
  "trace": {}
}
```
