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

// Helper function to map API courses to our recommendation format with real analysis
const analyzeAndMapCourses = (allCourses: Course[], query: string): Recommendation[] => {
  const recommendations: Recommendation[] = [];

  // 1. Identify unique courses (skip first 3 used in Learning Path)
  const remainingCourses = [...allCourses].slice(3);

  if (remainingCourses.length > 0) {
    // Sort by difficulty (Advanced/Intermediate first)
    const sorted = remainingCourses.sort((a, b) => {
      const levelScore = { advanced: 3, intermediate: 2, beginner: 1 };
      const aScore = a.level ? levelScore[a.level as keyof typeof levelScore] || 1 : 1;
      const bScore = b.level ? levelScore[b.level as keyof typeof levelScore] || 1 : 1;
      return bScore - aScore;
    });

    // Take up to 3 real courses
    sorted.slice(0, 3).forEach((course, index) => {
      const desc = course.description.toLowerCase();
      let type: "topic" | "project" | "course" = "course";

      if (desc.includes("project") || desc.includes("build") || desc.includes("capstone") || desc.includes("portfolio")) {
        type = "project";
      } else if (desc.includes("specialization") || desc.includes("series") || desc.includes("professional certificate")) {
        type = "topic";
      }

      recommendations.push({
        id: course.id || index + 100,
        title: course.name,
        description: course.description || "Advance your skills with this deeper dive into the subject.",
        url: course.url,
        type
      });
    });
  }

  // 2. Fill remaining slots to guarantee exactly 3 items with real site links
  const portalLinks = [
    {
      title: `Explore Advanced ${query} on Coursera`,
      description: "Find professional specializations and master's level content.",
      url: `https://www.coursera.org/search?query=${encodeURIComponent(query + ' advanced')}`,
      type: "topic" as const
    },
    {
      title: `${query} Projects on Udemy`,
      description: "Hands-on implementation courses and real-world project tutorials.",
      url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(query + ' project')}`,
      type: "project" as const
    },
    {
      title: `Academic Mastery on edX`,
      description: "University-grade courses to achieve expert-level proficiency.",
      url: `https://www.edx.org/search?q=${encodeURIComponent(query + ' advanced')}`,
      type: "course" as const
    }
  ];

  while (recommendations.length < 3) {
    const fallback = portalLinks[recommendations.length];
    recommendations.push({
      id: 500 + recommendations.length,
      ...fallback
    });
  }

  return recommendations;
};

const typeColors = {
  topic: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  project: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
  course: "from-violet-500/20 to-purple-500/20 border-violet-500/30",
};

const typeLabels = {
  topic: "Specialization",
  project: "Implementation",
  course: "Advanced Study",
};

export const NextRecommendations = ({ searchQuery, show, courses = [] }: NextRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    if (!show) return;

    // Perform real analysis on available courses to provide exactly 3 suggestions with links
    const analyzed = analyzeAndMapCourses(courses, searchQuery);
    setRecommendations(analyzed);
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