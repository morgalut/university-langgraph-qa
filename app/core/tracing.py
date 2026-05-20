from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

class TraceRecorder:
    def __init__(self):
        self.run_id = str(uuid4())
        self.events: list[dict[str, Any]] = []

    def add(self, node: str, input_data: Any = None, output_data: Any = None, error: str | None = None):
        self.events.append({
            "time": datetime.now(timezone.utc).isoformat(),
            "node": node,
            "input": input_data,
            "output": output_data,
            "error": error,
        })

    def as_dict(self) -> dict[str, Any]:
        return {"run_id": self.run_id, "events": self.events}
