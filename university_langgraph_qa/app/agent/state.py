from typing import Any, TypedDict

class QAState(TypedDict, total=False):
    question: str
    schema: str
    sql: str
    rows: list[dict[str, Any]]
    answer: str
    error: str
    attempts: int
    trace: dict[str, Any]
    _trace_recorder: Any
