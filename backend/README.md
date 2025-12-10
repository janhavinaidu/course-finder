# AI Learning Course Advisor - Backend

A FastAPI-based backend service that provides intelligent course recommendations using Groq LLM and Google Custom Search Engine. The system uses LangChain agents to search for and recommend online courses based on user queries.

## 🚀 Features

- **AI-Powered Recommendations**: Uses Groq's Llama model to intelligently search and recommend courses
- **Real-time Web Search**: Integrates with Google Custom Search API to find current course offerings
- **Structured Responses**: Returns well-formatted course data with details like title, URL, provider, duration, level, and ratings
- **RESTful API**: Clean FastAPI endpoints with automatic OpenAPI documentation
- **CORS Enabled**: Configured for frontend integration
- **Error Handling**: Comprehensive error handling and logging

## 📋 Prerequisites

- Python 3.10 or higher
- Groq API Key ([Get one here](https://console.groq.com/))
- Google Custom Search API Key ([Get one here](https://console.cloud.google.com/))
- Google Custom Search Engine ID ([Create one here](https://programmablesearchengine.google.com/))

## 🛠️ Installation

### 1. Clone the Repository

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux/Mac
python -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CSE_ID=your_google_cse_id_here
```

## 🏃 Running the Server

### Development Mode

```bash
uvicorn app.main:app --reload
```

The server will start on `http://localhost:8000`

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 📚 API Documentation

Once the server is running, you can access:

- **Interactive API Docs (Swagger UI)**: http://localhost:8000/docs
- **Alternative API Docs (ReDoc)**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## 🔌 API Endpoints

### Health Check

```
GET /
```

Returns server status and service information.

**Response:**
```json
{
  "status": "ok",
  "service": "AI Learning Course Advisor Backend (Groq/Google)"
}
```

### Get Course Recommendations

```
GET /api/recommend?topic={topic}
```

Get AI-powered course recommendations for a given topic.

**Parameters:**
- `topic` (required, query string): The learning topic to search for (e.g., "Python programming", "Machine Learning")

**Response:**
```json
{
  "topic": "Python programming",
  "results": [
    {
      "title": "Introduction to Python",
      "url": "https://example.com/course",
      "provider": "Coursera",
      "description": "Learn Python fundamentals...",
      "duration": "8 weeks",
      "level": "Beginner",
      "rating": 4.8
    }
  ]
}
```

**Error Responses:**

- `503 Service Unavailable`: API keys are missing or invalid
- `500 Internal Server Error`: Server error or API limits exceeded

**Example:**
```bash
curl "http://localhost:8000/api/recommend?topic=Python%20programming"
```

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration and settings
│   ├── models/
│   │   ├── course_model.py   # Course data models
│   │   └── schemas.py        # Pydantic schemas
│   ├── routers/
│   │   └── recommend.py     # Recommendation API routes
│   ├── services/
│   │   └── search_service.py # Search service (legacy)
│   └── utils/
│       └── llm_agent.py     # LLM agent implementation
├── venv/                    # Virtual environment
├── .env                     # Environment variables (create this)
├── requirements.txt         # Python dependencies
├── test_agent.py            # Agent testing script
├── README.md                # This file
├── TESTING.md               # Testing guide
├── TROUBLESHOOTING.md       # Troubleshooting guide
└── INTEGRATION.md           # Frontend integration guide
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Your Groq API key for LLM access | Yes |
| `GOOGLE_API_KEY` | Google Custom Search API key | Yes |
| `GOOGLE_CSE_ID` | Google Custom Search Engine ID | Yes |

### CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`

To add more origins, edit `app/main.py`:

```python
origins = [
    "http://localhost:3000",
    "http://your-frontend-domain.com",
]
```

## 🧪 Testing

### Run Comprehensive Tests

```bash
python test_agent.py
```

This will test:
- Environment configuration
- Search tool initialization
- Agent initialization
- Direct agent execution
- Full recommendation function
- API endpoint (if server is running)

### Test Individual Components

```bash
# Test the agent directly
python -m app.utils.llm_agent

# Test via API (requires server running)
curl "http://localhost:8000/api/recommend?topic=Python"
```

For detailed testing instructions, see [TESTING.md](./TESTING.md).

## 🏛️ Architecture

### Components

1. **FastAPI Application** (`app/main.py`)
   - Main application setup
   - CORS middleware configuration
   - Route registration

2. **LLM Agent** (`app/utils/llm_agent.py`)
   - Groq LLM integration using LangChain
   - Custom Google Search tool
   - Agent orchestration and execution
   - Response parsing

3. **API Router** (`app/routers/recommend.py`)
   - Request handling
   - Input validation
   - Error handling
   - Response formatting

4. **Data Models** (`app/models/`)
   - Pydantic schemas for request/response validation
   - Course data structures

### How It Works

1. User sends a search query to `/api/recommend?topic={topic}`
2. Backend validates the request and checks API keys
3. LLM agent is invoked with the search query
4. Agent uses Google Search tool to find relevant courses
5. Agent processes and formats the results
6. Results are parsed and validated against the schema
7. Structured course data is returned to the client

## 📦 Dependencies

### Core Dependencies

- **FastAPI**: Modern web framework for building APIs
- **Uvicorn**: ASGI server for running FastAPI
- **Pydantic**: Data validation using Python type annotations
- **LangChain**: Framework for building LLM applications
- **LangChain Groq**: Groq LLM integration
- **Google API Client**: Google Custom Search API integration

See `requirements.txt` for the complete list.

## 🐛 Troubleshooting

### Common Issues

1. **API Keys Missing**
   - Error: `503 Service Unavailable`
   - Solution: Check `.env` file and ensure all keys are set

2. **Backend Not Starting**
   - Check Python version: `python --version` (need 3.10+)
   - Verify virtual environment is activated
   - Check if port 8000 is available

3. **CORS Errors**
   - Verify frontend URL is in CORS origins list
   - Check browser console for specific CORS errors

4. **Agent Not Responding**
   - Check backend logs for errors
   - Verify API keys are valid
   - Check API rate limits

For detailed troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

## 📖 Additional Documentation

- [TESTING.md](./TESTING.md) - Comprehensive testing guide
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Troubleshooting common issues
- [INTEGRATION.md](./INTEGRATION.md) - Frontend integration guide

## 🔒 Security Notes

- Never commit `.env` file to version control
- Keep API keys secure and rotate them regularly
- Use environment variables for production deployments
- Consider implementing rate limiting for production

## 🚀 Deployment

### Production Considerations

1. **Use Production WSGI Server**
   ```bash
   pip install gunicorn
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. **Set Environment Variables**
   - Use secure secret management (e.g., AWS Secrets Manager, Azure Key Vault)
   - Never hardcode API keys

3. **Configure CORS**
   - Update CORS origins to match your production frontend domain
   - Remove development URLs

4. **Enable Logging**
   - Configure proper logging levels
   - Set up log aggregation

5. **Rate Limiting**
   - Implement rate limiting to prevent abuse
   - Consider using FastAPI rate limiting middleware

## 📝 License

This project is part of the AI Learning Course Advisor application.

## 🤝 Contributing

1. Follow Python PEP 8 style guidelines
2. Add tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

## 📧 Support

For issues and questions:
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review backend logs
3. Check API documentation at `/docs` endpoint

---

**Note**: This backend requires valid API keys for Groq and Google Custom Search to function properly. Make sure to set up your API keys before running the server.

