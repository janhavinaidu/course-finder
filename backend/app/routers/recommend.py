from fastapi import APIRouter, Query, HTTPException, status
from typing import List
import logging
import asyncio # Keep asyncio import for compatibility

# Configure logging (important for debugging issues in production/deployment)
logger = logging.getLogger(__name__)

# Project imports
from app.models.schemas import RecommendationResponse, CourseDetails
# Import the agent function which now runs Groq + Google CSE
from app.utils.llm_agent import run_cohere_agent_for_recommendations, refine_recommendations
from app.config import settings
from pydantic import BaseModel

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
    level: List[str] = Query(None, description="Filter by level: beginner, intermediate, or advanced"),
    pricing: List[str] = Query(None, description="Filter by pricing: free or paid"),
    provider: List[str] = Query(None, description="Filter by provider name (e.g., Coursera, edX)"),
    duration: List[str] = Query(None, description="Filter by duration: Short (< 4 weeks), Medium (4-12 weeks), or Long (> 12 weeks)"),
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
        # Build filter criteria
        filters = {
            "level": level or [],
            "pricing": pricing or [],
            "provider": provider or [],
            "duration": duration or [],
        }
        
        # The entire process is now handled by the agent function (which is Groq)
        # NOTE: The function name 'run_cohere_agent_for_recommendations' is preserved 
        # but internally it calls the Groq agent.
        structured_results: List[CourseDetails] = await run_cohere_agent_for_recommendations(topic, filters)

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


class RefinementRequest(BaseModel):
    """Request model for course recommendation refinement."""
    courses: List[CourseDetails]
    query: str


@router.post(
    "/refine",
    response_model=RecommendationResponse,
    summary="Refine course recommendations using conversational queries"
)
async def refine_courses(request: RefinementRequest):
    """
    Refines course recommendations based on a conversational query.
    
    Example queries:
    - "Show me the cheapest one"
    - "Best rated courses"
    - "Only free courses"
    - "Intermediate level courses from Coursera"
    
    The agent processes the original results and returns filtered/modified recommendations.
    """
    
    # Check for missing API keys
    if settings.IS_GROQ_MOCK or settings.IS_SEARCH_MOCK:
        logger.error("API keys (GROQ or GOOGLE) are missing. Agent is disabled.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Backend API keys (GROQ or GOOGLE) are missing. Agent is disabled and cannot serve requests."
        )

    try:
        if not request.courses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No courses provided for refinement"
            )
        
        if not request.query or not request.query.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refinement query is required"
            )
        
        # Refine the recommendations using the agent
        refined_results: List[CourseDetails] = await refine_recommendations(
            request.courses,
            request.query.strip()
        )

        # Return refined results
        return RecommendationResponse(
            topic=f"Refined: {request.query}",
            results=refined_results
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected Error during refinement: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing the refinement request."
        )