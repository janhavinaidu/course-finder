'''from typing import List
from app.models.course_model import SearchResult
import logging

logger = logging.getLogger(__name__)

# --- MOCK DATA ---
# This data is now only used as a last resort fallback if the LLM agent fails completely 
# and needs a guaranteed return value (though we handle fallbacks in llm_agent.py)
MOCK_SEARCH_RESULTS: List[SearchResult] = [
    SearchResult(
        title="GenAI Basics - Groq/Google Fallback",
        snippet="Fallback: Core concepts of Generative AI, for beginners. (Check API Keys)",
        link="https://www.mock-fallback-course.com"
    ),
]

# NOTE: The entire SearchService class is OBSOLETE in the Groq Agent architecture.
# The agent itself now directly uses the GoogleSearchTool (via LangChain).
# The class definition below is commented out to prevent accidental use.

# class SearchService:
#     def __init__(self):
#         logger.warning("SearchService is OBSOLETE and should not be used. Use the Groq Agent.")
#         pass

#     async def search_courses(self, topic: str) -> List[SearchResult]:
#         # This function is obsolete as the agent handles search
#         return MOCK_SEARCH_RESULTS'''