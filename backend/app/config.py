import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Configured for Groq (LLM) and Google Custom Search (Tool).
    """
    # Keys for the new free architecture
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

    # Google CSE Keys
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    GOOGLE_CSE_ID: str = os.getenv("GOOGLE_CSE_ID", "")


    # --- MOCK & Fallback Configuration ---
    @property
    def IS_GROQ_MOCK(self) -> bool:
        return not self.GROQ_API_KEY

    @property
    def IS_SEARCH_MOCK(self) -> bool:
        return not (self.GOOGLE_API_KEY and self.GOOGLE_CSE_ID)
    
settings = Settings()

if settings.IS_GROQ_MOCK:
    print("⚠️ GROQ_API_KEY not found. LLM agent will be disabled or mocked.")
if settings.IS_SEARCH_MOCK:
    print("⚠️ GOOGLE_API_KEY or CSE_ID missing. Search tool will be disabled or mocked.")