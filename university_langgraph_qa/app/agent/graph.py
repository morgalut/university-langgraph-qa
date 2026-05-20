from typing import Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import SystemMessage, HumanMessage
from langsmith import traceable

from app.agent.state import QAState
from app.agent.prompts import SQL_SYSTEM_PROMPT, ANSWER_SYSTEM_PROMPT
from app.agent.llm import get_llm
from app.agent.fallback_sql import generate_fallback_sql
from app.core.config import settings
from app.core.tracing import TraceRecorder
from app.db.schema_introspector import get_schema_description
from app.db.sql_guard import validate_read_only_sql
from app.db.connection import fetch_all


def _trace(state: QAState) -> TraceRecorder:
    recorder = state.get("_trace_recorder")  # type: ignore
    if recorder is None:
        recorder = TraceRecorder()
        state["_trace_recorder"] = recorder  # type: ignore
    return recorder


@traceable(name="load_schema")
def load_schema(state: QAState) -> dict[str, Any]:
    recorder = _trace(state)
    schema = get_schema_description()
    recorder.add("load_schema", {"question": state["question"]}, {"schema": schema})
    return {"schema": schema, "attempts": state.get("attempts", 0)}


@traceable(name="generate_sql")
def generate_sql(state: QAState) -> dict[str, Any]:
    recorder = _trace(state)
    llm = get_llm()

    if llm:
        messages = [
            SystemMessage(content=SQL_SYSTEM_PROMPT.format(schema=state["schema"])),
            HumanMessage(content=state["question"]),
        ]
        sql = llm.invoke(messages).content.strip()
    else:
        sql = generate_fallback_sql(state["question"])

    sql = sql.replace("```sql", "").replace("```", "").strip()
    recorder.add("generate_sql", {"question": state["question"]}, {"sql": sql})
    return {"sql": sql}


@traceable(name="validate_sql")
def validate_sql(state: QAState) -> dict[str, Any]:
    recorder = _trace(state)

    try:
        safe_sql = validate_read_only_sql(state["sql"])
        recorder.add("validate_sql", {"sql": state["sql"]}, {"sql": safe_sql})
        return {"sql": safe_sql, "error": ""}
    except Exception as exc:
        recorder.add("validate_sql", {"sql": state.get("sql")}, None, str(exc))
        return {
            "error": str(exc),
            "attempts": state.get("attempts", 0) + 1,
        }


@traceable(name="execute_sql")
def execute_sql(state: QAState) -> dict[str, Any]:
    recorder = _trace(state)

    try:
        rows = fetch_all(state["sql"])
        recorder.add(
            "execute_sql",
            {"sql": state["sql"]},
            {"row_count": len(rows), "preview": rows[:5]},
        )
        return {"rows": rows, "error": ""}
    except Exception as exc:
        recorder.add("execute_sql", {"sql": state.get("sql")}, None, str(exc))
        return {
            "error": str(exc),
            "attempts": state.get("attempts", 0) + 1,
        }


@traceable(name="formulate_answer")
def formulate_answer(state: QAState) -> dict[str, Any]:
    recorder = _trace(state)
    llm = get_llm(temperature=0.1)

    if llm:
        content = (
            f"Question: {state['question']}\n"
            f"SQL: {state['sql']}\n"
            f"Rows: {state.get('rows', [])}"
        )
        answer = llm.invoke(
            [
                SystemMessage(content=ANSWER_SYSTEM_PROMPT),
                HumanMessage(content=content),
            ]
        ).content
    else:
        rows = state.get("rows", [])
        answer = (
            "No matching records were found."
            if not rows
            else f"Found {len(rows)} result(s). Preview: {rows[:5]}"
        )

    recorder.add("formulate_answer", {"rows": state.get("rows", [])[:5]}, {"answer": answer})
    return {"answer": answer, "trace": recorder.as_dict()}


@traceable(name="handle_error")
def handle_error(state: QAState) -> dict[str, Any]:
    recorder = _trace(state)
    answer = f"I could not safely answer this question. Error: {state.get('error', 'unknown error')}"
    recorder.add("handle_error", {"error": state.get("error")}, {"answer": answer})
    return {"answer": answer, "trace": recorder.as_dict()}


def route_after_validation(state: QAState) -> str:
    if not state.get("error"):
        return "execute_sql"

    if state.get("attempts", 0) >= settings.max_sql_retries:
        return "handle_error"

    return "generate_sql"


def route_after_execution(state: QAState) -> str:
    if state.get("error") and state.get("attempts", 0) >= settings.max_sql_retries:
        return "handle_error"

    if state.get("error"):
        return "generate_sql"

    return "formulate_answer"


def build_graph():
    graph = StateGraph(QAState)

    graph.add_node("load_schema", load_schema)
    graph.add_node("generate_sql", generate_sql)
    graph.add_node("validate_sql", validate_sql)
    graph.add_node("execute_sql", execute_sql)
    graph.add_node("formulate_answer", formulate_answer)
    graph.add_node("handle_error", handle_error)

    graph.set_entry_point("load_schema")

    graph.add_edge("load_schema", "generate_sql")
    graph.add_edge("generate_sql", "validate_sql")
    graph.add_conditional_edges("validate_sql", route_after_validation)
    graph.add_conditional_edges("execute_sql", route_after_execution)
    graph.add_edge("formulate_answer", END)
    graph.add_edge("handle_error", END)

    return graph.compile()


qa_graph = build_graph()