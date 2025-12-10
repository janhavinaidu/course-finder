# Frontend-Backend Integration Guide

This guide explains how the frontend and backend are integrated and how to run the full application.

## Architecture Overview

- **Frontend**: React + TypeScript + Vite (runs on port 3000)
- **Backend**: FastAPI + Python (runs on port 8000)
- **Communication**: REST API over HTTP/JSON

## Data Flow

1. User enters a search query in the frontend
2. Frontend calls `/api/recommend?topic=<query>` endpoint
3. Backend processes the query using Groq LLM + Google Search
4. Backend returns structured course data
5. Frontend maps backend data to UI format and displays results

## Data Mapping

### Backend Schema (`CourseDetails`)
```python
{
  "title": str,
  "url": HttpUrl,
  "provider": str,
  "description": str,
  "duration": Optional[str],
  "level": Optional[str],
  "rating": Optional[float]
}
```

### Frontend Schema (`Course`)
```typescript
{
  id: number,
  name: string,           // mapped from title
  provider: string,
  level: "beginner" | "intermediate" | "advanced",  // normalized from level
  pricing: "free" | "paid",  // defaulted to "free"
  description: string,
  url: string,
  duration?: string | null,
  rating?: number | null
}
```

The mapping is handled automatically in `src/lib/api.ts`.

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create .env file with:
GROQ_API_KEY=your_groq_api_key
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CSE_ID=your_google_cse_id

# Start the backend server
uvicorn app.main:app --reload
```

The backend will run on `http://localhost:8000`

### 2. Frontend Setup

```bash
cd ai-course-finder

# Install dependencies
npm install
# or
bun install

# (Optional) Configure API URL
# Create .env file with:
VITE_API_BASE_URL=http://localhost:8000/api

# Start the frontend development server
npm run dev
# or
bun run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### GET `/api/recommend`

Get course recommendations for a topic.

**Query Parameters:**
- `topic` (required): The learning topic to search for

**Response:**
```json
{
  "topic": "machine learning",
  "results": [
    {
      "title": "Introduction to Machine Learning",
      "url": "https://example.com/course",
      "provider": "Coursera",
      "description": "Learn the fundamentals...",
      "duration": "11 weeks",
      "level": "Beginner",
      "rating": 4.9
    }
  ]
}
```

**Error Responses:**
- `503`: API keys missing
- `500`: Server error or API limits exceeded

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (Vite default)
- `http://localhost:5173` (Vite alternative port)
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`

To add more origins, edit `backend/app/main.py`:

```python
origins = [
    "http://localhost:3000",
    "http://your-custom-domain.com",
    # Add more origins here
]
```

## Testing the Integration

1. **Start both servers** (backend and frontend)
2. **Open the frontend** in your browser: `http://localhost:3000`
3. **Enter a search query** (e.g., "Python programming")
4. **Wait for results** (may take 30-60 seconds)
5. **Verify courses are displayed** with correct information

### Troubleshooting

**Issue: CORS errors**
- Check that backend CORS includes your frontend URL
- Verify backend is running on port 8000
- Check browser console for specific CORS error messages

**Issue: API not responding**
- Verify backend is running: `curl http://localhost:8000/`
- Check backend logs for errors
- Verify API keys are set in `.env` file

**Issue: No courses returned**
- Check backend logs for agent execution errors
- Verify API keys are valid
- Try a different search query
- Check API rate limits

**Issue: Frontend shows error**
- Check browser console for error messages
- Verify API URL is correct in `.env`
- Check network tab for failed requests

## Development Tips

1. **Backend Logs**: Monitor backend terminal for agent execution details
2. **Frontend Console**: Check browser DevTools console for API errors
3. **Network Tab**: Use browser DevTools Network tab to inspect API requests/responses
4. **API Testing**: Use the backend docs at `http://localhost:8000/docs` to test endpoints directly

## Production Deployment

For production:

1. **Backend**:
   - Set `CORS_ORIGINS` environment variable
   - Use production WSGI server (e.g., Gunicorn)
   - Set up proper logging
   - Configure API rate limiting

2. **Frontend**:
   - Set `VITE_API_BASE_URL` to production backend URL
   - Build with `npm run build`
   - Serve static files with a web server (e.g., Nginx)

3. **Environment Variables**:
   - Never commit `.env` files
   - Use secure secret management in production
   - Set up proper API key rotation

## Next Steps

- [ ] Add request caching to reduce API calls
- [ ] Implement error retry logic
- [ ] Add loading states and progress indicators
- [ ] Implement request timeout handling
- [ ] Add API response validation
- [ ] Set up monitoring and analytics

