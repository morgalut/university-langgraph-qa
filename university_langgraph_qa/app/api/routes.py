from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.agent.graph import qa_graph

router = APIRouter()


class QuestionRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=3,
        examples=["What is the average grade per course?"],
    )


class QuestionResponse(BaseModel):
    answer: str
    sql: str | None = None
    rows: list[dict[str, Any]] = []
    trace: dict[str, Any] | None = None


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/ask", response_model=QuestionResponse)
def ask(req: QuestionRequest):
    result = qa_graph.invoke(
        {"question": req.question},
        config={
            "run_name": "university_qa_agent",
            "tags": ["fastapi", "langgraph", "postgres"],
            "metadata": {
                "project": "university-langgraph-qa",
                "environment": "local-dev",
            },
        },
    )

    return QuestionResponse(
        answer=result.get("answer", ""),
        sql=result.get("sql"),
        rows=result.get("rows", []),
        trace=result.get("trace"),
    )