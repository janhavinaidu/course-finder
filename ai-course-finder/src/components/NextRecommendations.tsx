import { useEffect, useState } from "react";
// FIX: Import XCircle (the correct name for XCircleIcon)
import { ArrowRight, Lightbulb, TrendingUp, Boxes, Sparkles, Loader2, XCircle } from "lucide-react"; 
import { cn } from "@/lib/utils";
import { getRecommendations } from "@/lib/api";

interface Recommendation {
  id: number;
  title: string;
  description: string;
  type: "topic" | "project" | "course";
  icon: "lightbulb" | "trending" | "boxes" | "sparkles";
}

interface NextRecommendationsProps {
  searchQuery: string;
  show: boolean;
}

// Helper function to map API courses to our recommendation format
const mapCoursesToRecommendations = (courses: any[]): Recommendation[] => {
  return courses.map((course, index) => ({
    id: course.id || index,
    title: course.name || `Course ${index + 1}`,
    description: course.description || "Check out this course to enhance your skills",
    type: "course" as const,
    icon: ["lightbulb", "trending", "boxes", "sparkles"][index % 4] as "lightbulb" | "trending" | "boxes" | "sparkles",
  }));
};

// Fallback recommendations in case API fails
const getFallbackRecommendations = (): Recommendation[] => [
  {
    id: 1,
    title: "Explore Related Topics",
    description: "Discover adjacent skills to complement your learning",
    type: "topic",
    icon: "lightbulb",
  },
  {
    id: 2,
    title: "Join a Community",
    description: "Connect with learners and experts in the field",
    type: "course",
    icon: "trending",
  },
  {
    id: 3,
    title: "Start a Side Project",
    description: "Apply your new skills to build something real",
    type: "project",
    icon: "boxes",
  },
];

const iconMap = {
  lightbulb: Lightbulb,
  trending: TrendingUp,
  boxes: Boxes,
  sparkles: Sparkles,
};

const typeColors = {
  topic: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  project: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
  course: "from-violet-500/20 to-purple-500/20 border-violet-500/30",
};

const typeLabels = {
  topic: "Topic",
  project: "Project",
  course: "Course",
};

export const NextRecommendations = ({ searchQuery, show }: NextRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!show || !searchQuery.trim()) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const courses = await getRecommendations(searchQuery);
        // getRecommendations returns Course[] directly, not { results: Course[] }
        const mapped = mapCoursesToRecommendations(courses);
        setRecommendations(mapped);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load recommendations';
        setError(`${errorMessage}. Using fallback data.`);
        setRecommendations(getFallbackRecommendations());
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [searchQuery, show]);

  if (!show) return null;

  return (
    <section className="w-full max-w-5xl mx-auto mt-20">
      {/* Section header */}
      <div className="flex items-center justify-between mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "600ms" }}>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
            Next Recommendations
          </h2>
          <p className="text-sm text-muted-foreground">
            Continue your learning journey with these suggestions
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground hidden sm:block" />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Loading recommendations...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-500" /> {/* FIX APPLIED HERE: Changed to XCircle */}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading recommendations</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <p className="mt-1">Trying fallback recommendations instead.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((rec, index) => {
          const Icon = iconMap[rec.icon];
          return (
            <div
              key={rec.id}
              className={cn(
                "group relative overflow-hidden rounded-2xl p-5 cursor-pointer",
                "bg-gradient-to-br border backdrop-blur-sm",
                typeColors[rec.type],
                "hover:scale-[1.02] hover:shadow-lg transition-all duration-300",
                "opacity-0 animate-fade-in-up"
              )}
              style={{ animationDelay: `${700 + index * 100}ms`, animationFillMode: "forwards" }}
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-card/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-5 h-5 text-primary" />
              </div>

              {/* Type badge */}
              <span className="inline-block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {typeLabels[rec.type]}
              </span>

              {/* Content */}
              <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {rec.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {rec.description}
              </p>

              {/* Hover arrow */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};