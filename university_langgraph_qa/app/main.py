from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from dotenv import load_dotenv
import os

load_dotenv()

# Comma-separated origins from env, or sensible defaults for local dev.
# Example: CORS_ORIGINS="http://localhost:5173,https://app.example.com"
DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
cors_env = os.getenv("CORS_ORIGINS", "")
allow_origins = (
    [o.strip() for o in cors_env.split(",") if o.strip()]
    if cors_env
    else DEFAULT_ORIGINS
)

app = FastAPI(
    title="University LangGraph QA Agent",
    description="Natural-language QA over a PostgreSQL university database using LangGraph.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)