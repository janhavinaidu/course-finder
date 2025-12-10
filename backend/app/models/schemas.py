from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional

class CourseDetails(BaseModel):
    """Structured details for a single course recommendation."""
    title: str = Field(..., description="The title of the course")
    url: HttpUrl = Field(..., description="URL to access the course")
    provider: str = Field(..., description="Platform or institution offering the course")
    description: str = Field(..., description="Brief description of the course content")
    duration: Optional[str] = Field(None, description="Estimated duration of the course")
    level: Optional[str] = Field(None, description="Difficulty level (e.g., Beginner, Intermediate, Advanced)")
    rating: Optional[float] = Field(None, description="Average rating if available")

class RecommendationResponse(BaseModel):
    """Response model for course recommendations."""
    topic: str = Field(..., description="The topic that was searched for")
    results: List[CourseDetails] = Field(..., description="List of recommended courses")

class SearchResult(BaseModel):
    """Model for search results from the search service."""
    title: str
    link: str
    snippet: str
