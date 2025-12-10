# Debugging Guide

## Quick Checks

### 1. Is Backend Running?

Open a new terminal and run:
```bash
curl http://localhost:8000/
```

Expected response:
```json
{"status":"ok","service":"AI Learning Course Advisor Backend (Groq/Google)"}
```

If you get an error, start the backend:
```bash
cd backend
.\venv\Scripts\activate  # Windows
uvicorn app.main:app --reload
```

### 2. Check Browser Console

1. Open your browser DevTools (F12)
2. Go to Console tab
3. Look for errors starting with `[API]`
4. Check Network tab for failed requests

### 3. Common Error Messages

#### "Cannot connect to backend"
- **Cause**: Backend not running
- **Fix**: Start backend server

#### "Backend API keys (GROQ or GOOGLE) are missing"
- **Cause**: Missing API keys in `.env` file
- **Fix**: Add keys to `backend/.env` and restart backend

#### "Failed to load recommendations. Using fallback data."
- **Cause**: `NextRecommendations` component failed
- **Note**: This doesn't affect main search - check if main search works
- **Fix**: Check browser console for specific error

#### CORS Error
- **Cause**: Backend CORS not configured for your frontend URL
- **Fix**: Update `backend/app/main.py` CORS origins

### 4. Test API Directly

```bash
# Test health endpoint
curl http://localhost:8000/

# Test recommendations endpoint
curl "http://localhost:8000/api/recommend?topic=Python"
```

### 5. Check Environment Variables

In backend directory:
```bash
python -c "from app.config import settings; print('GROQ:', bool(settings.GROQ_API_KEY)); print('GOOGLE:', bool(settings.GOOGLE_API_KEY)); print('CSE_ID:', bool(settings.GOOGLE_CSE_ID))"
```

All should print `True`.

### 6. Enable Verbose Logging

The API client now logs to console:
- `[API] Fetching recommendations for: <topic>`
- `[API] URL: <url>`
- `[API] Response status: <status>`
- `[API] Received <count> courses`

Check browser console for these messages.

## Still Having Issues?

1. Check `backend/TROUBLESHOOTING.md` for detailed solutions
2. Check backend terminal logs for errors
3. Verify all dependencies are installed
4. Try restarting both frontend and backend

