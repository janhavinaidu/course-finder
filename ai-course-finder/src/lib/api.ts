const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Backend CourseDetails schema
export interface BackendCourseDetails {
  title: string;
  url: string;
  provider: string;
  description: string;
  duration: string | null;
  level: string | null;
  rating: number | null;
}

export interface BackendRecommendationResponse {
  topic: string;
  results: BackendCourseDetails[];
}

// Frontend Course interface (for UI components)
export interface Course {
  id: number;
  name: string;
  provider: string;
  level: "beginner" | "intermediate" | "advanced";
  pricing: "free" | "paid";
  description: string;
  url: string;
  duration?: string | null;
  rating?: number | null;
}

/**
 * Maps backend CourseDetails to frontend Course format
 */
function mapBackendToFrontendCourse(
  backendCourse: BackendCourseDetails,
  index: number
): Course {
  // Normalize level to match frontend expectations
  const normalizeLevel = (level: string | null): "beginner" | "intermediate" | "advanced" => {
    if (!level) return "beginner";
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes("beginner") || lowerLevel.includes("intro")) {
      return "beginner";
    }
    if (lowerLevel.includes("advanced") || lowerLevel.includes("expert")) {
      return "advanced";
    }
    return "intermediate";
  };

  // Determine pricing (default to "free" if not specified)
  // You can enhance this logic based on your needs
  const pricing: "free" | "paid" = "free"; // Default assumption

  return {
    id: index + 1,
    name: backendCourse.title,
    provider: backendCourse.provider || "Unknown",
    level: normalizeLevel(backendCourse.level),
    pricing,
    description: backendCourse.description || "",
    url: backendCourse.url,
    duration: backendCourse.duration,
    rating: backendCourse.rating,
  };
}

/**
 * Fetches course recommendations from the backend API
 */
export const getRecommendations = async (topic: string): Promise<Course[]> => {
  const url = `${API_BASE_URL}/recommend?topic=${encodeURIComponent(topic)}`;
  
  try {
    console.log(`[API] Fetching recommendations for: ${topic}`);
    console.log(`[API] URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`[API] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      console.error(`[API] Error response:`, errorMessage);
      throw new Error(errorMessage);
    }

    const data: BackendRecommendationResponse = await response.json();
    console.log(`[API] Received ${data.results.length} courses`);
    
    // Map backend courses to frontend format
    const mappedCourses = data.results.map((course, index) => 
      mapBackendToFrontendCourse(course, index)
    );
    
    return mappedCourses;
  } catch (error) {
    // Enhanced error logging
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('[API] Network error - is the backend running?', error);
      throw new Error('Cannot connect to backend. Make sure the backend server is running on http://localhost:8000');
    }
    
    console.error('[API] Error fetching recommendations:', error);
    throw error;
  }
};