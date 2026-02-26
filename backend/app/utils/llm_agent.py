import os
import logging
from typing import List, Dict, Any, Optional
import asyncio
from urllib.parse import urlparse
import json
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# LangChain imports
from langchain.agents import initialize_agent, AgentType
from langchain_groq import ChatGroq

from app.models.schemas import CourseDetails
from app.config import settings


# ================= INIT =================

def initialize_agent_executor():
    try:
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not set.")

        llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model="llama-3.1-8b-instant",
            temperature=0
        )

        # 🔥 NO TOOLS (important fix)
        agent_executor = initialize_agent(
            tools=[],
            llm=llm,
            agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
            verbose=True,
            handle_parsing_errors=True,
            max_iterations=3,
        )

        logger.info("Agent initialized successfully (no external tools)")
        return agent_executor

    except Exception as e:
        logger.error(f"Failed to initialize agent: {e}")
        return None


agent_executor = initialize_agent_executor()


# ================= HELPERS =================

def extract_provider_from_url(url: str) -> str:
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()

        if domain.startswith("www."):
            domain = domain[4:]

        return domain.split(".")[0].capitalize()

    except:
        return "Unknown"


# ================= MAIN FUNCTION =================

async def run_cohere_agent_for_recommendations(
    topic: str,
    filters: Optional[Dict[str, Any]] = None
) -> List[CourseDetails]:

    if not agent_executor:
        logger.error("Agent not initialized.")
        return []

    try:
        topic = topic.strip()
        if not topic:
            return []

        logger.info(f"Searching courses for: {topic}")

        # 🔥 STRICT JSON PROMPT
        query = f"""
        Find 5 high-quality online courses about {topic}.

        Return ONLY valid JSON.
        Do NOT include explanation.
        Do NOT include markdown.

        Format:
        [
          {{
            "title": "...",
            "url": "...",
            "provider": "...",
            "duration": "...",
            "level": "...",
            "rating": 4.5,
            "price": "...",
            "description": "..."
          }}
        ]
        """

        result = await asyncio.to_thread(agent_executor.invoke, {"input": query})

        result_text = result.get("output", "")

        logger.error(f"\n===== RAW LLM OUTPUT =====\n{result_text}\n=========================\n")

        # 🔥 EXTRACT JSON SAFELY
        try:
            json_match = re.search(r'\[.*\]', result_text, re.DOTALL)

            if not json_match:
                logger.error("No JSON found in LLM output")
                return []

            json_str = json_match.group(0)

            data = json.loads(json_str)

        except Exception as e:
            logger.error(f"JSON parsing failed: {e}")
            return []

        # 🔥 CONVERT TO OBJECTS
        courses: List[CourseDetails] = []

        for item in data:
            try:
                course = CourseDetails(
                    title=item.get("title"),
                    url=item.get("url"),
                    provider=extract_provider_from_url(item.get("url", "")),
                    duration=item.get("duration"),
                    level=item.get("level"),
                    rating=float(item["rating"]) if item.get("rating") else None,
                    price=item.get("price"),
                    description=item.get("description", "")
                )
                courses.append(course)
            except Exception as e:
                logger.warning(f"Skipping invalid course: {e}")

        logger.info(f"Parsed {len(courses)} courses")

        return courses

    except Exception as e:
        logger.error(f"Error in recommendations: {e}")
        return []


# ================= REFINE FUNCTION (UNCHANGED) =================

async def refine_recommendations(
    courses: List[CourseDetails],
    refinement_query: str
) -> List[CourseDetails]:

    if not agent_executor:
        return []

    if not courses:
        return []

    try:
        courses_text = "\n\n".join([
            f"""Course:
Title: {c.title}
URL: {c.url}
Provider: {c.provider}
Duration: {c.duration}
Level: {c.level}
Rating: {c.rating}
Price: {c.price}
Description: {c.description}"""
            for c in courses
        ])

        query = f"""
        From these courses, apply this filter: {refinement_query}

        Return matching courses in same format.
        """

        result = await asyncio.to_thread(agent_executor.invoke, {"input": query})

        result_text = result.get("output", "")

        # reuse JSON extraction
        json_match = re.search(r'\[.*\]', result_text, re.DOTALL)

        if not json_match:
            return []

        data = json.loads(json_match.group(0))

        return data

    except Exception as e:
        logger.error(f"Refinement error: {e}")
        return []
