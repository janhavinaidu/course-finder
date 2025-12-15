import os
import logging
from typing import List, Dict, Any, Optional
import asyncio
from urllib.parse import urlparse
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))


# LangChain 0.2.x imports
from langchain.agents import create_agent
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from langchain_core.tools import BaseTool
from googleapiclient.discovery import build


from app.models.schemas import CourseDetails
from app.config import settings


class GoogleSearchTool(BaseTool):
    """Custom Google Search tool that avoids langchain_community import issues."""
    
    name: str = "web_search"
    description: str = (
        "Search the internet for current information. "
        "Use this tool to find online courses and their details. "
        "Input should be a search query string."
    )
    google_api_key: str
    google_cse_id: str
    
    def _run(self, query: str) -> str:
        """Execute the Google search."""
        try:
            service = build("customsearch", "v1", developerKey=self.google_api_key)
            result = service.cse().list(
                q=query,
                cx=self.google_cse_id,
                num=10
            ).execute()
            
            # Format results as a readable string
            items = result.get("items", [])
            if not items:
                return "No search results found."
            
            formatted_results = []
            for item in items:
                title = item.get("title", "")
                link = item.get("link", "")
                snippet = item.get("snippet", "")
                formatted_results.append(f"Title: {title}\nURL: {link}\nDescription: {snippet}\n")
            
            return "\n".join(formatted_results)
        except Exception as e:
            logger.error(f"Google Search API error: {e}")
            return f"Error performing search: {str(e)}"
    
    async def _arun(self, query: str) -> str:
        """Async version of the search."""
        return self._run(query)


def initialize_search_tool():
    try:
        if not settings.GOOGLE_API_KEY or not settings.GOOGLE_CSE_ID:
            logger.warning("Google API Key or CSE ID not set. Search tool will not be available.")
            return None

        search_tool = GoogleSearchTool(
            google_api_key=settings.GOOGLE_API_KEY,
            google_cse_id=settings.GOOGLE_CSE_ID
        )

        logger.info("Google Custom Search tool initialized successfully")
        return search_tool

    except Exception as e:
        logger.error(f"Failed to initialize search tool: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return None


def initialize_agent_executor(tools: list):
    try:
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not set.")

        llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model="llama-3.1-8b-instant",
            temperature=0
        )

        # Create agent using LangChain 0.2.x API
        agent_graph = create_agent(
            model=llm,
            tools=tools,
            debug=True,  # Equivalent to verbose=True
        )

        logger.info("Groq agent initialized successfully")
        return agent_graph

    except Exception as e:
        logger.error(f"Failed to initialize agent: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return None


tools = []
agent_executor = None

try:
    search_tool = initialize_search_tool()
    if search_tool:
        tools = [search_tool]

    agent_executor = initialize_agent_executor(tools)

except Exception as e:
    logger.error(f"Global initialization failed. Some features may not work. Error: {e}")

def extract_provider_from_url(url: str) -> str:
    """Extract provider name from URL domain."""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        
        # Remove www. prefix
        if domain.startswith('www.'):
            domain = domain[4:]
        
        # Extract main domain (e.g., coursera.org -> coursera)
        domain_parts = domain.split('.')
        if len(domain_parts) >= 2:
            main_domain = domain_parts[-2]  # Get second-to-last part (e.g., 'coursera' from 'coursera.org')
        else:
            main_domain = domain_parts[0] if domain_parts else domain
        
        # Map common domains to provider names
        provider_map = {
            'coursera': 'Coursera',
            'edx': 'edX',
            'udemy': 'Udemy',
            'khan': 'Khan Academy',
            'khanacademy': 'Khan Academy',
            'udacity': 'Udacity',
            'pluralsight': 'Pluralsight',
            'linkedin': 'LinkedIn Learning',
            'linkedinlearning': 'LinkedIn Learning',
            'skillshare': 'Skillshare',
            'codecademy': 'Codecademy',
            'freecodecamp': 'freeCodeCamp',
            'mit': 'MIT OpenCourseWare',
            'youtube': 'YouTube',
            'youtu': 'YouTube',
        }
        
        # Check if domain matches any known provider
        for key, value in provider_map.items():
            if key in main_domain:
                return value
        
        # If no match, capitalize the main domain
        return main_domain.capitalize()
    except Exception as e:
        logger.warning(f"Error extracting provider from URL {url}: {e}")
        return "Unknown"


def normalize_url(url: str) -> str:
    """Normalize URL for deduplication (lowercase host, strip trailing slash)."""
    try:
        parsed = urlparse(url)
        netloc = parsed.netloc.lower()
        path = parsed.path.rstrip("/")
        normalized = parsed._replace(netloc=netloc, path=path).geturl()
        return normalized
    except Exception:
        return url

def duration_bucket(duration: Optional[str]) -> Optional[str]:
    """Roughly bucket duration into Short / Medium / Long."""
    if not duration:
        return None
    d = duration.lower()
    # weeks
    import re
    num_match = re.search(r"(\d+)", d)
    num = int(num_match.group(1)) if num_match else None
    if "week" in d:
        if num is not None:
            if num < 4:
                return "Short (< 4 weeks)"
            if num <= 12:
                return "Medium (4-12 weeks)"
            return "Long (> 12 weeks)"
    if "month" in d:
        return "Long (> 12 weeks)"
    if "hour" in d or "hr" in d:
        if num is not None:
            if num < 20:
                return "Short (< 4 weeks)"
            if num < 60:
                return "Medium (4-12 weeks)"
            return "Long (> 12 weeks)"
    return None

def filter_courses_by_constraints(courses: List[CourseDetails], filters: Optional[Dict[str, Any]]) -> List[CourseDetails]:
    """Apply strict server-side filtering on the structured courses."""
    if not filters:
        return courses
    level_filters = set(filters.get("level") or [])
    pricing_filters = set(filters.get("pricing") or [])
    provider_filters = set([p.lower() for p in (filters.get("provider") or [])])
    duration_filters = set(filters.get("duration") or [])

    filtered: List[CourseDetails] = []
    for course in courses:
        # Level
        if level_filters and course.level:
            if course.level.lower() not in level_filters:
                continue
        # Pricing (free/paid)
        if pricing_filters:
            label = "free"
            if course.price and "free" not in course.price.lower():
                label = "paid"
            if label not in pricing_filters:
                continue
        # Provider
        if provider_filters:
            prov = (course.provider or "").lower()
            if prov not in provider_filters:
                continue
        # Duration
        if duration_filters:
            bucket = duration_bucket(course.duration)
            if bucket not in duration_filters:
                continue
        filtered.append(course)
    return filtered


def parse_course_data(raw_text: str) -> List[CourseDetails]:
    """Parse raw text response into CourseDetails objects."""
    courses = []
    try:
        # This is a simple parser - you might need to adjust based on the actual response format
        import re
        course_blocks = re.split(r'\n\s*\n', raw_text.strip())
        
        for block in course_blocks:
            try:
                # Extract course details using regex
                title = re.search(r'Title:\s*(.+)', block)
                url = re.search(r'URL:\s*(.+)', block)
                provider = re.search(r'Provider:\s*(.+)', block)
                duration = re.search(r'Duration:\s*(.+)', block)
                level = re.search(r'Level:\s*(.+)', block)
                rating = re.search(r'Rating:\s*(.+)', block)
                price = re.search(r'Price:\s*(.+)', block)
                description = re.search(r'Description:\s*(.+)', block, re.DOTALL)
                
                if title and url:  # At minimum, we need title and URL
                    # Safely parse rating
                    rating_value = None
                    if rating:
                        try:
                            rating_value = float(rating.group(1).strip())
                        except (ValueError, AttributeError):
                            rating_value = None
                    
                    # Extract provider from URL as fallback/validation
                    url_str = url.group(1).strip()
                    extracted_provider = extract_provider_from_url(url_str)
                    
                    # Use extracted provider from URL if agent-provided provider seems incorrect
                    # or if no provider was provided
                    agent_provider = provider.group(1).strip() if provider else ""
                    
                    # Validate: if agent provider doesn't match URL domain, use URL-based provider
                    if agent_provider:
                        agent_provider_lower = agent_provider.lower()
                        extracted_provider_lower = extracted_provider.lower()
                        # Check if agent provider is in the extracted provider or vice versa
                        if (extracted_provider_lower not in agent_provider_lower and 
                            agent_provider_lower not in extracted_provider_lower and
                            extracted_provider != "Unknown"):
                            # Provider mismatch - use URL-based provider
                            logger.info(f"Provider mismatch for {url_str}: agent said '{agent_provider}', URL suggests '{extracted_provider}'. Using URL-based provider.")
                            final_provider = extracted_provider
                        else:
                            final_provider = agent_provider
                    else:
                        final_provider = extracted_provider
                    
                    course = CourseDetails(
                        title=title.group(1).strip(),
                        url=url_str,
                        provider=final_provider,
                        duration=duration.group(1).strip() if duration else None,
                        level=level.group(1).strip() if level else None,
                        rating=rating_value,
                        price=price.group(1).strip() if price else None,
                        description=description.group(1).strip() if description else ""
                    )
                    courses.append(course)
            except Exception as e:
                logger.warning(f"Failed to parse course block: {e}")
                continue
                
    except Exception as e:
        logger.error(f"Error parsing course data: {e}")
        
    return courses

async def run_cohere_agent_for_recommendations(
    topic: str,
    filters: Optional[Dict[str, Any]] = None
) -> List[CourseDetails]:
    """Get course recommendations for a given topic."""
    if not agent_executor:
        logger.error("Agent not initialized. Check the logs for errors.")
        return []
    
    try:
        # Clean and validate the topic
        topic = topic.strip()
        if not topic:
            logger.warning("Empty topic provided")
            return []
            
        logger.info(f"Starting course search for topic: {topic} with filters: {filters}")
        
        # Build filter constraints for the query
        filter_constraints = []
        if filters:
            for level in filters.get("level", []):
                level_filter = level.lower()
                filter_constraints.append(f"Level: {level_filter.capitalize()}")
            for pricing in filters.get("pricing", []):
                pricing_filter = pricing.lower()
                if pricing_filter == "free":
                    filter_constraints.append("Price: Free (no cost required)")
                elif pricing_filter == "paid":
                    filter_constraints.append("Price: Paid (requires payment)")
            for prov in filters.get("provider", []):
                filter_constraints.append(f"Provider: {prov}")
            for duration_filter in filters.get("duration", []):
                if "Short" in duration_filter:
                    filter_constraints.append("Duration: Less than 4 weeks or short duration courses")
                elif "Medium" in duration_filter:
                    filter_constraints.append("Duration: 4-12 weeks or medium duration courses")
                elif "Long" in duration_filter:
                    filter_constraints.append("Duration: More than 12 weeks or long duration courses")
        
        filter_text = ""
        if filter_constraints:
            filter_text = f"\n\nIMPORTANT FILTER REQUIREMENTS (you MUST only return courses that match ALL of these):\n" + "\n".join(f"- {constraint}" for constraint in filter_constraints)
        
        # Create a detailed query that explicitly requests all required fields
        query = f"""
        Find 5 high-quality online courses about: {topic}{filter_text}
        
        For each course, you MUST provide ALL of the following information:
        1. Title - The full course title
        2. URL - Direct link to the course page
        3. Provider - The platform or institution name (e.g., Coursera, edX, Udemy, Khan Academy, MIT OpenCourseWare)
           CRITICAL: The Provider MUST match the domain of the URL. For example:
           - If URL is coursera.org/... then Provider must be "Coursera"
           - If URL is edx.org/... then Provider must be "edX"
           - If URL is udemy.com/... then Provider must be "Udemy"
           - Extract the provider name from the URL domain, not from the page title or description
        4. Duration - Estimated time to complete (e.g., "8 weeks", "40 hours", "6 months")
        5. Level - Difficulty level: Beginner, Intermediate, or Advanced
        6. Rating - Average rating as a number (e.g., 4.5, 4.8) if available
        7. Price - Cost information (e.g., "Free", "$49.99", "$199", "Paid", "Subscription required")
        8. Description - Brief 1-2 sentence description of what the course covers
        
        Format each course EXACTLY like this:
        Title: [Course Title]
        URL: [Course URL]
        Provider: [Provider Name - MUST match the URL domain]
        Duration: [Duration or "Not specified"]
        Level: [Beginner/Intermediate/Advanced]
        Rating: [Rating number or "Not available"]
        Price: [Price information]
        Description: [1-2 sentence description]
        
        IMPORTANT: 
        - The Provider field MUST be extracted from the URL domain, not guessed from the course title or description
        - Make sure to extract and include Provider, Duration, Level, Rating, and Price for every course
        - If information is not available, use "Not specified" or "Not available" as appropriate
        """
        
        logger.debug(f"Executing agent with query: {query[:100]}...")
        
        try:
            # Execute the agent using LangChain 0.2.x API
            result = agent_executor.invoke({
                "messages": [HumanMessage(content=query)]
            })
            
            # Extract the final message content from the result
            # The result is a dict with "messages" key containing the conversation
            messages = result.get("messages", [])
            if messages:
                # Get the last AI message which contains the final answer
                final_message = messages[-1]
                result_text = final_message.content if hasattr(final_message, 'content') else str(final_message)
            else:
                result_text = str(result)
            
            logger.debug(f"Raw agent response: {result_text[:500]}...")
            
            # Parse the response
            courses = parse_course_data(result_text)

            # Post-process: deduplicate, fix providers, normalize price labels
            cleaned_courses: List[CourseDetails] = []
            seen_urls = set()
            for course in courses:
                norm_url = normalize_url(str(course.url))
                if norm_url in seen_urls:
                    continue
                seen_urls.add(norm_url)

                # Ensure provider matches URL domain
                provider_from_url = extract_provider_from_url(str(course.url))
                if provider_from_url and provider_from_url != "Unknown":
                    course.provider = provider_from_url

                # Normalize price labeling for "Free"
                if course.price:
                    price_lower = course.price.lower()
                    if "free" in price_lower:
                        course.price = "Free"

                cleaned_courses.append(course)

            # Enforce filters server-side
            filtered_courses = filter_courses_by_constraints(cleaned_courses, filters)

            logger.info(f"Successfully parsed {len(filtered_courses)} courses after filtering")
            
            return filtered_courses

        except Exception as e:
            logger.error(f"Error executing agent: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return []
            
    except Exception as e:
        logger.error(f"Error in run_cohere_agent_for_recommendations: {e}")
        return []


async def refine_recommendations(
    courses: List[CourseDetails],
    refinement_query: str
) -> List[CourseDetails]:
    """
    Refine course recommendations based on a user query.
    The agent receives the original search results and processes the refinement request.
    """
    if not agent_executor:
        logger.error("Agent not initialized. Check the logs for errors.")
        return []
    
    if not courses:
        logger.warning("No courses provided for refinement")
        return []
    
    try:
        # Format the courses as a readable list for the agent
        courses_text = "\n\n".join([
            f"""Course {i+1}:
Title: {course.title}
URL: {course.url}
Provider: {course.provider}
Duration: {course.duration or "Not specified"}
Level: {course.level or "Not specified"}
Rating: {course.rating or "Not available"}
Price: {course.price or "Not specified"}
Description: {course.description}"""
            for i, course in enumerate(courses)
        ])
        
        # Create a refinement query
        query = f"""
        You have been given a list of {len(courses)} online courses. The user has requested: "{refinement_query}"
        
        Based on this request, analyze the courses and return ONLY the courses that match the user's criteria.
        If the user asks for "the cheapest one" or "cheapest", return the course(s) with the lowest price.
        If the user asks for "the best rated" or "highest rating", return the course(s) with the highest rating.
        If the user asks for a specific provider, level, or other criteria, filter accordingly.
        
        Here are the courses:
        {courses_text}
        
        Please return the matching course(s) in the same format:
        Title: [Course Title]
        URL: [Course URL]
        Provider: [Provider Name]
        Duration: [Duration or "Not specified"]
        Level: [Beginner/Intermediate/Advanced]
        Rating: [Rating number or "Not available"]
        Price: [Price information]
        Description: [Description]
        
        If no courses match, return an empty response.
        """
        
        logger.info(f"Refining recommendations with query: {refinement_query}")
        logger.debug(f"Executing agent with refinement query: {query[:200]}...")
        
        try:
            # Execute the agent
            result = agent_executor.invoke({
                "messages": [HumanMessage(content=query)]
            })
            
            # Extract the final message content
            messages = result.get("messages", [])
            if messages:
                final_message = messages[-1]
                result_text = final_message.content if hasattr(final_message, 'content') else str(final_message)
            else:
                result_text = str(result)
            
            logger.debug(f"Raw refinement response: {result_text[:500]}...")
            
            # Parse the response
            refined_courses = parse_course_data(result_text)
            logger.info(f"Successfully refined to {len(refined_courses)} courses")
            
            return refined_courses

        except Exception as e:
            logger.error(f"Error executing refinement agent: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return []
            
    except Exception as e:
        logger.error(f"Error in refine_recommendations: {e}")
        return []

# This allows running the agent directly for testing
if __name__ == "__main__":
    async def test():
        courses = await run_cohere_agent_for_recommendations("machine learning")
        print(f"Found {len(courses)} courses:")
        for i, course in enumerate(courses, 1):
            print(f"\nCourse {i}:")
            print(f"Title: {course.title}")
            print(f"URL: {course.url}")
            print(f"Provider: {course.provider}")
            print(f"Duration: {course.duration}")
            print(f"Level: {course.level}")
            print(f"Rating: {course.rating}")
            print(f"Description: {course.description}")
    
    asyncio.run(test())