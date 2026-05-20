from fastapi import FastAPI
from app.api.routes import router
from dotenv import load_dotenv
import os

print(f"Contents of .env file: {open('.env').read()}")

load_dotenv()
app = FastAPI(
    title="University LangGraph QA Agent",
    description="Natural-language QA over a PostgreSQL university database using LangGraph.",
    version="0.1.0",
)
app.include_router(router)
