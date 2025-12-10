"""
Comprehensive test script for the LLM Agent system.

This script tests:
1. Environment configuration
2. Search tool initialization
3. Agent initialization
4. Direct agent execution
5. Full recommendation function
6. API endpoint (if server is running)
"""

import sys
import os
import asyncio
from pathlib import Path

# Add project root to Python path
sys.path.insert(0, str(Path(__file__).parent))

# Import after setting path
from app.config import settings
from app.utils.llm_agent import (
    initialize_search_tool,
    initialize_agent_executor,
    agent_executor,
    run_cohere_agent_for_recommendations,
    GoogleSearchTool
)
from langchain_core.messages import HumanMessage


def test_environment():
    """Test if environment variables are set."""
    print("=" * 60)
    print("TEST 1: Environment Configuration")
    print("=" * 60)
    
    groq_set = bool(settings.GROQ_API_KEY)
    google_key_set = bool(settings.GOOGLE_API_KEY)
    google_cse_set = bool(settings.GOOGLE_CSE_ID)
    
    print(f"✓ GROQ_API_KEY: {'✓ Set' if groq_set else '✗ Missing'}")
    print(f"✓ GOOGLE_API_KEY: {'✓ Set' if google_key_set else '✗ Missing'}")
    print(f"✓ GOOGLE_CSE_ID: {'✓ Set' if google_cse_set else '✗ Missing'}")
    
    if not groq_set:
        print("\n⚠️  WARNING: GROQ_API_KEY is missing. Agent will not work.")
    if not google_key_set or not google_cse_set:
        print("\n⚠️  WARNING: Google API keys are missing. Search tool will not work.")
    
    return groq_set and google_key_set and google_cse_set


def test_search_tool():
    """Test the Google Search tool directly."""
    print("\n" + "=" * 60)
    print("TEST 2: Search Tool Initialization")
    print("=" * 60)
    
    try:
        search_tool = initialize_search_tool()
        if search_tool is None:
            print("✗ Search tool initialization failed (check API keys)")
            return False
        
        print("✓ Search tool initialized successfully")
        
        # Test a simple search
        print("\nTesting search tool with query: 'Python programming course'")
        try:
            result = search_tool._run("Python programming course")
            print(f"✓ Search executed successfully")
            print(f"  Result length: {len(result)} characters")
            print(f"  First 200 chars: {result[:200]}...")
            return True
        except Exception as e:
            print(f"✗ Search execution failed: {e}")
            return False
            
    except Exception as e:
        print(f"✗ Search tool initialization error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_agent_initialization():
    """Test agent initialization."""
    print("\n" + "=" * 60)
    print("TEST 3: Agent Initialization")
    print("=" * 60)
    
    try:
        if agent_executor is None:
            print("✗ Agent executor is None (check initialization logs)")
            return False
        
        print("✓ Agent executor initialized successfully")
        print(f"  Type: {type(agent_executor)}")
        return True
        
    except Exception as e:
        print(f"✗ Agent initialization error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_agent_execution():
    """Test direct agent execution."""
    print("\n" + "=" * 60)
    print("TEST 4: Direct Agent Execution")
    print("=" * 60)
    
    if agent_executor is None:
        print("✗ Agent executor not available. Skipping test.")
        return False
    
    try:
        query = "Find 3 online courses about Python programming"
        print(f"Query: {query}")
        print("Executing agent... (this may take 30-60 seconds)")
        
        result = agent_executor.invoke({
            "messages": [HumanMessage(content=query)]
        })
        
        print("✓ Agent executed successfully")
        
        # Extract messages
        messages = result.get("messages", [])
        print(f"  Total messages: {len(messages)}")
        
        if messages:
            final_message = messages[-1]
            content = final_message.content if hasattr(final_message, 'content') else str(final_message)
            print(f"  Final response length: {len(content)} characters")
            print(f"\n  First 500 chars of response:")
            print(f"  {content[:500]}...")
        
        return True
        
    except Exception as e:
        print(f"✗ Agent execution error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_recommendation_function():
    """Test the full recommendation function."""
    print("\n" + "=" * 60)
    print("TEST 5: Full Recommendation Function")
    print("=" * 60)
    
    try:
        topic = "machine learning"
        print(f"Topic: {topic}")
        print("Running recommendation function... (this may take 30-60 seconds)")
        
        courses = await run_cohere_agent_for_recommendations(topic)
        
        print(f"\n✓ Recommendation function completed")
        print(f"  Found {len(courses)} courses")
        
        if len(courses) == 0:
            print("  ⚠️  No courses found. This might be normal if parsing failed.")
            return False
        
        # Display courses
        for i, course in enumerate(courses, 1):
            print(f"\n  Course {i}:")
            print(f"    Title: {course.title}")
            print(f"    URL: {course.url}")
            print(f"    Provider: {course.provider}")
            print(f"    Duration: {course.duration or 'N/A'}")
            print(f"    Level: {course.level or 'N/A'}")
            print(f"    Rating: {course.rating or 'N/A'}")
            print(f"    Description: {course.description[:100] if course.description else 'N/A'}...")
        
        return len(courses) > 0
        
    except Exception as e:
        print(f"✗ Recommendation function error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_api_endpoint():
    """Test the API endpoint (requires server to be running)."""
    print("\n" + "=" * 60)
    print("TEST 6: API Endpoint (Optional)")
    print("=" * 60)
    
    try:
        import httpx
        
        url = "http://localhost:8000/api/recommend"
        params = {"topic": "Python programming"}
        
        print(f"Testing API endpoint: {url}")
        print(f"Parameters: {params}")
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                print("✓ API endpoint responded successfully")
                print(f"  Topic: {data.get('topic')}")
                print(f"  Results: {len(data.get('results', []))} courses")
                return True
            else:
                print(f"✗ API endpoint returned status {response.status_code}")
                print(f"  Response: {response.text}")
                return False
                
    except httpx.ConnectError:
        print("⚠️  Server not running. Start with: uvicorn app.main:app --reload")
        print("   Skipping API endpoint test.")
        return None
    except Exception as e:
        print(f"✗ API endpoint test error: {e}")
        return False


async def run_all_tests():
    """Run all tests."""
    print("\n" + "=" * 60)
    print("LLM AGENT TEST SUITE")
    print("=" * 60)
    
    results = {}
    
    # Test 1: Environment
    results['environment'] = test_environment()
    
    # Test 2: Search Tool
    if results['environment']:
        results['search_tool'] = test_search_tool()
    else:
        print("\n⚠️  Skipping search tool test (missing API keys)")
        results['search_tool'] = None
    
    # Test 3: Agent Initialization
    results['agent_init'] = test_agent_initialization()
    
    # Test 4: Agent Execution
    if results['agent_init']:
        results['agent_exec'] = await test_agent_execution()
    else:
        print("\n⚠️  Skipping agent execution test (agent not initialized)")
        results['agent_exec'] = None
    
    # Test 5: Recommendation Function
    if results['agent_init']:
        results['recommendation'] = await test_recommendation_function()
    else:
        print("\n⚠️  Skipping recommendation test (agent not initialized)")
        results['recommendation'] = None
    
    # Test 6: API Endpoint (optional)
    results['api_endpoint'] = await test_api_endpoint()
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    for test_name, result in results.items():
        if result is None:
            status = "SKIPPED"
        elif result:
            status = "✓ PASSED"
        else:
            status = "✗ FAILED"
        print(f"  {test_name.replace('_', ' ').title()}: {status}")
    
    passed = sum(1 for r in results.values() if r is True)
    total = sum(1 for r in results.values() if r is not None)
    
    print(f"\n  Total: {passed}/{total} tests passed")
    
    if passed == total and total > 0:
        print("\n🎉 All tests passed!")
    elif passed > 0:
        print("\n⚠️  Some tests failed. Check the output above for details.")
    else:
        print("\n❌ All tests failed. Check your API keys and configuration.")


if __name__ == "__main__":
    print("\nStarting LLM Agent Tests...")
    print("Note: Some tests may take 30-60 seconds to complete.\n")
    
    asyncio.run(run_all_tests())
