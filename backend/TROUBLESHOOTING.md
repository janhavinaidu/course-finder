# Troubleshooting Guide

## Common Issues and Solutions

### Issue: "Failed to load recommendations" Error

This error can occur for several reasons:

#### 1. Backend Not Running

**Symptoms:**
- Error message: "Failed to fetch courses" or "Network error"
- Browser console shows: `Failed to fetch` or `CORS error`

**Solution:**
```bash
# Check if backend is running
curl http://localhost:8000/

# If not running, start it:
cd backend
.\venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/Mac

uvicorn app.main:app --reload
```

#### 2. API Keys Missing or Invalid

**Symptoms:**
- Error: "Backend API keys (GROQ or GOOGLE) are missing"
- Status code: 503

**Solution:**
1. Check your `.env` file in the `backend` directory:
   ```
   GROQ_API_KEY=your_key_here
   GOOGLE_API_KEY=your_key_here
   GOOGLE_CSE_ID=your_cse_id_here
   ```

2. Verify keys are valid:
   - Groq: https://console.groq.com/
   - Google: https://console.cloud.google.com/

3. Restart the backend server after adding keys

#### 3. CORS Errors

**Symptoms:**
- Browser console: "CORS policy" error
- Network tab shows CORS preflight failure

**Solution:**
1. Check `backend/app/main.py` includes your frontend URL:
   ```python
   origins = [
       "http://localhost:3000",  # Your frontend port
       "http://localhost:5173",  # Vite alternative port
   ]
   ```

2. Restart backend after changes

#### 4. Backend API Timeout

**Symptoms:**
- Request takes too long (>60 seconds)
- Frontend shows timeout error

**Solution:**
- This is normal! The LLM agent can take 30-60 seconds
- Increase timeout in frontend if needed:
  ```typescript
  // In api.ts, add timeout option
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes
  
  fetch(url, {
    signal: controller.signal,
    // ... other options
  })
  ```

#### 5. Empty Results Returned

**Symptoms:**
- API call succeeds but returns empty array
- No courses displayed

**Possible Causes:**
- Agent couldn't find courses for the topic
- Parsing failed (check backend logs)
- API rate limits exceeded

**Solution:**
1. Check backend terminal logs for details
2. Try a different search query
3. Check API rate limits
4. Verify Google Search API is working

### Issue: Frontend Shows Fallback Data

**Cause:** The `NextRecommendations` component failed to fetch data

**Solution:**
1. Check browser console for errors
2. Verify backend is running
3. Check network tab for failed requests
4. The main search should still work even if NextRecommendations fails

### Debugging Steps

1. **Check Backend Status:**
   ```bash
   curl http://localhost:8000/
   # Should return: {"status":"ok","service":"..."}
   ```

2. **Test API Endpoint Directly:**
   ```bash
   curl "http://localhost:8000/api/recommend?topic=Python"
   ```

3. **Check Backend Logs:**
   - Look at the terminal where backend is running
   - Check for error messages or stack traces

4. **Check Frontend Console:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

5. **Verify Environment Variables:**
   ```bash
   # In backend directory
   python -c "from app.config import settings; print('GROQ:', bool(settings.GROQ_API_KEY)); print('GOOGLE:', bool(settings.GOOGLE_API_KEY))"
   ```

### Quick Diagnostic Script

Run this in your backend directory:

```python
# test_connection.py
import asyncio
from app.utils.llm_agent import run_cohere_agent_for_recommendations
from app.config import settings

async def test():
    print("Checking configuration...")
    print(f"GROQ_API_KEY set: {bool(settings.GROQ_API_KEY)}")
    print(f"GOOGLE_API_KEY set: {bool(settings.GOOGLE_API_KEY)}")
    print(f"GOOGLE_CSE_ID set: {bool(settings.GOOGLE_CSE_ID)}")
    
    if not settings.GROQ_API_KEY:
        print("ERROR: GROQ_API_KEY not set!")
        return
    
    print("\nTesting agent...")
    try:
        courses = await run_cohere_agent_for_recommendations("Python")
        print(f"Success! Found {len(courses)} courses")
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

asyncio.run(test())
```

Run with:
```bash
python test_connection.py
```

### Still Having Issues?

1. Check the backend logs for detailed error messages
2. Verify all dependencies are installed: `pip install -r requirements.txt`
3. Try restarting both frontend and backend
4. Clear browser cache and try again
5. Check if ports 3000 and 8000 are available

