# Quick Start Guide - Course Recommender

## 🚀 Getting Started

### Prerequisites
- Python 3.10+ (for backend)
- Node.js 18+ or Bun (for frontend)
- API Keys:
  - Groq API Key: https://console.groq.com/
  - Google Custom Search API Key & CSE ID: https://console.cloud.google.com/

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# Copy and fill in your API keys:
GROQ_API_KEY=your_groq_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CSE_ID=your_google_cse_id_here

# Start backend server
uvicorn app.main:app --reload
```

Backend will run on: **http://localhost:8000**

### Step 2: Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd ai-course-finder

# Install dependencies
npm install
# or if using Bun:
bun install

# (Optional) Create .env file to customize API URL
# VITE_API_BASE_URL=http://localhost:8000/api

# Start frontend development server
npm run dev
# or
bun run dev
```

Frontend will run on: **http://localhost:3000**

### Step 3: Test the Integration

1. Open your browser to `http://localhost:3000`
2. Enter a search query (e.g., "Python programming", "Machine Learning")
3. Click "Find Courses"
4. Wait 30-60 seconds for results
5. Courses should appear with details!

## 📋 What Was Integrated

### Backend Changes
- ✅ Updated CORS to allow frontend requests (ports 3000 and 5173)
- ✅ API endpoint: `/api/recommend?topic=<query>`
- ✅ Returns structured course data

### Frontend Changes
- ✅ Updated API client to call real backend
- ✅ Created data mapping from backend to frontend format
- ✅ Added error handling and toast notifications
- ✅ Enhanced CourseCard to show duration and rating
- ✅ Updated all components to use shared Course type

## 🔍 API Endpoint

**GET** `/api/recommend?topic=<query>`

**Example:**
```bash
curl "http://localhost:8000/api/recommend?topic=Python%20programming"
```

**Response:**
```json
{
  "topic": "Python programming",
  "results": [
    {
      "title": "Introduction to Python",
      "url": "https://example.com/course",
      "provider": "Coursera",
      "description": "Learn Python basics...",
      "duration": "8 weeks",
      "level": "Beginner",
      "rating": 4.8
    }
  ]
}
```

## 🐛 Troubleshooting

### Backend not starting?
- Check Python version: `python --version` (need 3.10+)
- Verify virtual environment is activated
- Check API keys are set in `.env` file
- Check port 8000 is not in use

### Frontend not connecting?
- Verify backend is running on port 8000
- Check browser console for CORS errors
- Verify API URL in frontend `.env` (if set)
- Check network tab for failed requests

### No courses returned?
- Check backend terminal logs for errors
- Verify API keys are valid
- Try a different search query
- Check API rate limits

### CORS errors?
- Backend CORS includes `http://localhost:3000` and `http://localhost:5173`
- If using a different port, update `backend/app/main.py`

## 📚 Documentation

- **Backend API Docs**: http://localhost:8000/docs (when backend is running)
- **Integration Guide**: See `backend/INTEGRATION.md`
- **Testing Guide**: See `backend/TESTING.md`

## 🎯 Next Steps

1. Test with different search queries
2. Customize the UI components
3. Add more features (favorites, filters, etc.)
4. Deploy to production

## 💡 Tips

- Backend logs show detailed agent execution info
- Frontend shows toast notifications for success/errors
- API calls may take 30-60 seconds (normal for LLM processing)
- Use browser DevTools Network tab to debug API calls

