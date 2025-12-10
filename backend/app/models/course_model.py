from fastapi import APIRouter, Query, HTTPException, status
from typing import List
import asyncio
import logging
from pydantic import HttpUrl

# Configure logging
logger = logging.getLogger(__name__)

# Import the agent function
from app.utils.llm_agent import run_cohere_agent_for_recommendations
from app.config import settings
from .schemas import CourseDetails, RecommendationResponse

# Initialize the router
router = APIRouter()

@router.get(
    "/recommend",
    response_model=RecommendationResponse, 
    summary="Get structured course recommendations for a given topic using the Groq Agent"
)
async def recommend_courses(
    topic: str = Query(..., description="The learning topic to search for, e.g., 'GenAI'"),
):
    """
    1. Executes the Groq ReAct Agent to search the web via Google CSE.
    2. Parses the results into the structured CourseDetails schema.
    3. Returns a clean, ready-to-use JSON list of recommendations.
    """
    
    # Check for missing API keys
    if settings.IS_GROQ_MOCK or settings.IS_SEARCH_MOCK:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Backend API keys (GROQ or GOOGLE) are missing. Agent is disabled."
        )

    try:
        # The entire process is now handled by the agent function
        structured_results: List[CourseDetails] = await run_cohere_agent_for_recommendations(topic)

        if not structured_results:
            # If the agent runs but finds no courses, return an empty list with a 200 OK
            return RecommendationResponse(
                topic=topic,
                results=[],
            )

        # Return final structured response
        return RecommendationResponse(
            topic=topic,
            results=structured_results
        )

    except RuntimeError as e:
        # Catch errors related to uninitialized agent or core setup issues
        logger.error(f"Agent Runtime Error for topic '{topic}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent setup failed or external API error occurred: {str(e)}"
        )
    except Exception as e:
        # Catch all other unexpected errors during the API call or parsing
        logger.error(f"Unexpected Error during recommendation for '{topic}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing the request."
        )