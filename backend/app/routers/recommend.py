from fastapi import APIRouter, Query, HTTPException, status
from typing import List
import logging
import asyncio # Keep asyncio import for compatibility

# Configure logging (important for debugging issues in production/deployment)
logger = logging.getLogger(__name__)

# Project imports
from app.models.course_model import RecommendationResponse, CourseDetails
# Import the agent function which now runs Groq + Google CSE
from app.utils.llm_agent import run_cohere_agent_for_recommendations 
from app.config import settings

# Initialize the router
router = APIRouter()

@router.get(
    "/recommend",
    response_model=RecommendationResponse,
    # FIX: Update summary to reflect the Groq agent
    summary="Get structured course recommendations for a given topic using the Groq ReAct Agent"
)
async def recommend_courses(
    topic: str = Query(..., description="The learning topic to search for, e.g., 'GenAI'"),
):
    """
    1. Runs the Groq ReAct Agent (Tool Use) to search the web via Google CSE.
    2. Enforces the final JSON schema using Pydantic validation on the agent output.
    3. Returns a clean, structured JSON list of recommendations.
    """
    
    # Check for missing API keys BEFORE calling the agent (best practice)
    if settings.IS_GROQ_MOCK or settings.IS_SEARCH_MOCK:
        logger.error("API keys (GROQ or GOOGLE) are missing. Agent is disabled.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Backend API keys (GROQ or GOOGLE) are missing. Agent is disabled and cannot serve requests."
        )

    try:
        # The entire process is now handled by the agent function (which is Groq)
        # NOTE: The function name 'run_cohere_agent_for_recommendations' is preserved 
        # but internally it calls the Groq agent.
        structured_results: List[CourseDetails] = await run_cohere_agent_for_recommendations(topic)

        if not structured_results:
            # If the agent runs but finds no courses, return an empty list with a 200 OK
            logger.info(f"Agent found no results for topic: {topic}. Returning empty list.")
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
            detail=f"Agent setup failed or external API error occurred: {str(e)}. Check backend logs."
        )
    except Exception as e:
        # Catch all other unexpected errors during the API call or parsing
        logger.error(f"Unexpected Error during recommendation for '{topic}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing the request. Check API usage limits."
        )