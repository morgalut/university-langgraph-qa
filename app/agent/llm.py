from langchain_openai import ChatOpenAI
from app.core.config import settings


def get_llm(temperature: float = 0):
    if not settings.openai_api_key:
        return None

    return ChatOpenAI(
        model=settings.llm_model,
        temperature=temperature,
        api_key=settings.openai_api_key,
    )