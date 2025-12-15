import { useEffect, useState } from "react";
// FIX: Import XCircle (the correct name for XCircleIcon)
import { ArrowRight, Loader2, XCircle, ExternalLink } from "lucide-react"; 
import { cn } from "@/lib/utils";
import { Course } from "@/lib/api";

interface Recommendation {
  id: number;
  title: string;
  description: string;
  url?: string;
  type: "topic" | "project" | "course";
}

interface NextRecommendationsProps {
  searchQuery: string;
  show: boolean;
  courses?: Course[];
}

// Helper function to map API courses to our recommendation format
const mapCoursesToRecommendations = (courses: Course[]): Recommendation[] => {
  return courses.slice(0, 3).map((course, index) => ({
    id: course.id || index,
    title: course.name || `Course ${index + 1}`,
    description: course.description || "Check out this course to enhance your skills",
    url: course.url,
    type: "course" as const,
  }));
};

// Fallback recommendations in case API fails
const getFallbackRecommendations = (): Recommendation[] => [
  {
    id: 1,
    title: "Explore Related Topics",
    description: "Discover adjacent skills to complement your learning",
    type: "topic",
  },
  {
    id: 2,
    title: "Join a Community",
    description: "Connect with learners and experts in the field",
    type: "course",
  },
  {
    id: 3,
    title: "Start a Side Project",
    description: "Apply your new skills to build something real",
    type: "project",
  },
];

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

export const NextRecommendations = ({ searchQuery, show, courses = [] }: NextRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    if (!show) return;
    
    if (courses.length > 0) {
      // Use provided courses
      const mapped = mapCoursesToRecommendations(courses);
      setRecommendations(mapped);
    } else {
      // Use fallback recommendations
      setRecommendations(getFallbackRecommendations());
    }
  }, [searchQuery, show, courses]);

  if (!show) return null;

  return (
    <section className="w-full max-w-6xl mx-auto mt-16">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "600ms" }}>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">
            Next Recommendations
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Continue your learning journey with these suggestions
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
      </div>

      {/* Recommendations grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {recommendations.map((rec, index) => {
          return (
            <div
              key={rec.id}
              className={cn(
                "group relative overflow-hidden rounded-xl p-4 cursor-pointer border backdrop-blur-sm",
                typeColors[rec.type],
                "hover:scale-[1.02] hover:shadow-lg transition-all duration-300 opacity-0 animate-fade-in-up"
              )}
              style={{ animationDelay: `${700 + index * 100}ms`, animationFillMode: "forwards" }}
              onClick={() => {
                if (rec.url) {
                  window.open(rec.url, "_blank");
                }
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && rec.url) {
                  e.preventDefault();
                  window.open(rec.url, "_blank");
                }
              }}
            >
              <span className="inline-block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                {typeLabels[rec.type]}
              </span>

              {/* Content */}
              <h3 className="font-semibold text-sm text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
                {rec.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                {rec.description}
              </p>

              {/* Hover arrow */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                <span className="text-xs text-primary font-medium">View</span>
                <ExternalLink className="w-3 h-3 text-primary" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};