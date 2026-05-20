from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from app.core.config import settings

engine: Engine = create_engine(settings.database_url, pool_pre_ping=True)

def fetch_all(sql: str, params: dict | None = None) -> list[dict]:
    with engine.connect() as conn:
        result = conn.execute(text(sql), params or {})
        return [dict(row._mapping) for row in result.fetchall()]

def execute_scalar(sql: str, params: dict | None = None):
    with engine.connect() as conn:
        return conn.execute(text(sql), params or {}).scalar()
