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
                description = re.search(r'Description:\s*(.+)', block, re.DOTALL)
                
                if title and url:  # At minimum, we need title and URL
                    # Safely parse rating
                    rating_value = None
                    if rating:
                        try:
                            rating_value = float(rating.group(1).strip())
                        except (ValueError, AttributeError):
                            rating_value = None
                    
                    course = CourseDetails(
                        title=title.group(1).strip(),
                        url=url.group(1).strip(),
                        provider=provider.group(1).strip() if provider else "",
                        duration=duration.group(1).strip() if duration else None,
                        level=level.group(1).strip() if level else None,
                        rating=rating_value,
                        description=description.group(1).strip() if description else ""
                    )
                    courses.append(course)
            except Exception as e:
                logger.warning(f"Failed to parse course block: {e}")
                continue
                
    except Exception as e:
        logger.error(f"Error parsing course data: {e}")
        
    return courses

async def run_cohere_agent_for_recommendations(topic: str) -> List[CourseDetails]:
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
            
        logger.info(f"Starting course search for topic: {topic}")
        
        # Create a detailed query
        query = f"""
        Find 5 high-quality online courses about: {topic}
        
        For each course, please provide:
        1. Title
        2. URL (direct link to the course)
        3. Provider (e.g., Coursera, edX, Udemy)
        4. Duration (if available)
        5. Level (Beginner/Intermediate/Advanced)
        6. Rating (if available, as a number)
        7. Description (1-2 sentences)
        
        Format each course like this:
        Title: [Course Title]
        URL: [Course URL]
        Provider: [Provider Name]
        Duration: [Duration or leave blank]
        Level: [Beginner/Intermediate/Advanced]
        Rating: [Rating number or leave blank]
        Description: [1-2 sentence description]
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
            logger.info(f"Successfully parsed {len(courses)} courses")
            
            return courses

        except Exception as e:
            logger.error(f"Error executing agent: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return []
            
    except Exception as e:
        logger.error(f"Error in run_cohere_agent_for_recommendations: {e}")
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