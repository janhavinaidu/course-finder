import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Course } from "@/lib/api";

interface RefinementInputProps {
  courses: Course[];
  onRefine: (refinedCourses: Course[]) => void;
  isLoading?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const RefinementInput = ({ courses, onRefine, isLoading = false }: RefinementInputProps) => {
  const [query, setQuery] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  const handleRefine = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || courses.length === 0) return;

    setIsRefining(true);
    try {
      // Map frontend courses to backend format
      const backendCourses = courses.map((course) => ({
        title: course.name,
        url: course.url,
        provider: course.provider,
        description: course.description,
        duration: course.duration,
        level: course.level,
        rating: course.rating,
        price: course.price,
      }));

      const response = await fetch(`${API_BASE_URL}/refine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courses: backendCourses,
          query: query.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refine recommendations');
      }

      const data = await response.json();
      
      // Map backend courses back to frontend format
      const refinedCourses = data.results.map((course: any, index: number) => ({
        id: index + 1,
        name: course.title,
        provider: course.provider || "Unknown",
        level: course.level?.toLowerCase().includes("beginner") ? "beginner" :
              course.level?.toLowerCase().includes("advanced") ? "advanced" : "intermediate",
        pricing: course.price?.toLowerCase().includes("free") ? "free" : "paid",
        description: course.description || "",
        url: course.url,
        duration: course.duration,
        rating: course.rating,
        price: course.price,
      }));

      onRefine(refinedCourses);
      setQuery("");
    } catch (error) {
      console.error("Error refining recommendations:", error);
      alert("Failed to refine recommendations. Please try again.");
    } finally {
      setIsRefining(false);
    }
  };

  if (courses.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <form onSubmit={handleRefine} className="relative">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder='Try: "Show me the cheapest one", "Best rated courses", "Only free courses"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-11 pr-6"
              disabled={isRefining || isLoading}
            />
          </div>
          <Button
            type="button"
            variant="glass"
            size="lg"
            disabled={isRefining || isLoading || !query.trim()}
            className="sm:w-auto w-full"
            onClick={() => handleRefine()}
          >
            {isRefining ? (
              <>
                <span className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                <span>Refining...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Refine</span>
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 ml-1">
          💡 Ask the AI to filter or modify your results (e.g., "cheapest", "best rated", "free only")
        </p>
      </form>
    </div>
  );
};

