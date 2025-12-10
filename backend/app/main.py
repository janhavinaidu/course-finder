import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
# NOTE: The path logic here is slightly complex but correct for standard setups.
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# FIX: Import settings here to ensure env vars are loaded before config use
from app.config import settings 
# FIX: Router import is correct
from app.routers import recommend

app = FastAPI(
    # FIX: Update the title and description to reflect the Groq/Google CSE architecture
    title="AI Learning Course Advisor Backend (Groq Agent)",
    description="Backend service using **Groq** and **Google CSE** for stable, free course recommendations.",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:5173",
    "https://your-react-frontend.com"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the main router
app.include_router(router=recommend.router, prefix="/api", tags=["recommendations"])

# --- HEALTH CHECK ---
@app.get("/")
def health_check():
    """Simple health check endpoint."""
    # FIX: Update the service name in the health check
    return {"status": "ok", "service": "AI Learning Course Advisor Backend (Groq/Google)"}