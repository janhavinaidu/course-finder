# Testing Guide for LLM Agent

This guide explains how to test the LLM agent system to ensure it's working properly.

## Prerequisites

1. **API Keys**: Make sure you have the following API keys set in your `.env` file:
   - `GROQ_API_KEY` - Your Groq API key
   - `GOOGLE_API_KEY` - Your Google Custom Search API key
   - `GOOGLE_CSE_ID` - Your Google Custom Search Engine ID

2. **Dependencies**: Ensure all dependencies are installed:
   ```bash
   pip install -r requirements.txt
   ```

## Testing Methods

### Method 1: Run the Comprehensive Test Suite (Recommended)

The easiest way to test everything is to run the test script:

```bash
cd backend
python test_agent.py
```

This will run all tests:
1. ✅ Environment configuration check
2. ✅ Search tool initialization and test
3. ✅ Agent initialization check
4. ✅ Direct agent execution test
5. ✅ Full recommendation function test
6. ✅ API endpoint test (if server is running)

### Method 2: Test Individual Components

#### Test 1: Quick Agent Test (Built-in)

The `llm_agent.py` file has a built-in test that you can run:

```bash
cd backend
python -m app.utils.llm_agent
```

This will test the agent with a "machine learning" query.

#### Test 2: Test via Python REPL

```python
# Start Python in the backend directory
cd backend
python

# Then run:
import asyncio
from app.utils.llm_agent import run_cohere_agent_for_recommendations

# Test the function
courses = asyncio.run(run_cohere_agent_for_recommendations("Python programming"))
print(f"Found {len(courses)} courses")
for course in courses:
    print(f"- {course.title}: {course.url}")
```

#### Test 3: Test via API Endpoint

1. **Start the FastAPI server**:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Test the endpoint** using curl:
   ```bash
   curl "http://localhost:8000/api/recommend?topic=Python%20programming"
   ```

   Or using Python:
   ```python
   import requests
   response = requests.get("http://localhost:8000/api/recommend", params={"topic": "Python programming"})
   print(response.json())
   ```

3. **Or use the interactive API docs**:
   - Open your browser and go to: `http://localhost:8000/docs`
   - Click on the `/api/recommend` endpoint
   - Click "Try it out"
   - Enter a topic (e.g., "machine learning")
   - Click "Execute"

### Method 4: Test Search Tool Directly

```python
from app.utils.llm_agent import initialize_search_tool

# Initialize the tool
search_tool = initialize_search_tool()

# Test it
if search_tool:
    result = search_tool._run("Python programming course")
    print(result)
else:
    print("Search tool not initialized (check API keys)")
```

## Expected Results

### Successful Test Output

When everything is working, you should see:

1. **Environment Test**: All API keys are set ✓
2. **Search Tool Test**: Tool initializes and returns search results ✓
3. **Agent Test**: Agent executes and returns formatted course recommendations ✓
4. **Recommendation Function**: Returns a list of `CourseDetails` objects ✓

### Example Successful Output

```
Found 5 courses:

Course 1:
Title: Introduction to Machine Learning
URL: https://www.coursera.org/learn/machine-learning
Provider: Coursera
Duration: 11 weeks
Level: Beginner
Rating: 4.9
Description: A comprehensive introduction to machine learning...
```

## Troubleshooting

### Issue: "Agent not initialized"

**Solution**: Check your `GROQ_API_KEY` in the `.env` file

### Issue: "Search tool not available"

**Solution**: Check your `GOOGLE_API_KEY` and `GOOGLE_CSE_ID` in the `.env` file

### Issue: "No courses found"

**Possible causes**:
1. The agent couldn't find courses for the topic
2. The parsing failed (check logs for details)
3. API rate limits exceeded

**Solution**: Try a different topic or check the raw agent response in logs

### Issue: Import Errors

**Solution**: Make sure you're in the correct directory and have activated your virtual environment:
```bash
cd backend
# On Windows:
.\venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate
```

### Issue: API Timeout

**Solution**: The agent may take 30-60 seconds to complete. This is normal. If it times out:
- Check your internet connection
- Verify API keys are valid
- Check API rate limits

## Performance Notes

- **First run**: May take longer due to initialization
- **Typical execution time**: 30-60 seconds per query
- **Search tool**: Usually responds in 1-3 seconds
- **Agent processing**: Usually takes 20-50 seconds

## Next Steps

Once testing is successful:
1. ✅ Your agent is ready to use
2. ✅ You can integrate it with your frontend
3. ✅ Monitor API usage and rate limits
4. ✅ Consider adding caching for frequently searched topics

