import { Rocket, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Course } from "@/lib/api";

interface LearningStep {
  step: number;
  title: string;
  description: string;
  courseName: string;
  courseUrl: string;
  details: string[];
}

interface LearningPathProps {
  searchQuery: string;
  show: boolean;
  courses?: Course[];
}

const getLearningPath = (query: string, courses: Course[] = []): LearningStep[] => {
  // Use actual courses if available, otherwise use mock data
  if (courses.length >= 3) {
    return [
      {
        step: 1,
        title: "Foundations",
        description: "Build your core understanding",
        courseName: courses[0].name,
        courseUrl: courses[0].url,
        details: [
          "Core concepts and terminology",
          "Industry overview and use cases",
          "Basic hands-on exercises",
        ],
      },
      {
        step: 2,
        title: "Hands-on Practice",
        description: "Apply your knowledge with real projects",
        courseName: courses[1].name,
        courseUrl: courses[1].url,
        details: [
          "Step-by-step project tutorial",
          "Real-world application building",
          "Best practices and patterns",
        ],
      },
      {
        step: 3,
        title: "Advanced Mastery",
        description: "Take your skills to the next level",
        courseName: courses[2].name,
        courseUrl: courses[2].url,
        details: [
          "Advanced optimization strategies",
          "Production-ready implementations",
          "Industry certifications prep",
        ],
      },
    ];
  }

  // Fallback to mock data
  return [
    {
      step: 1,
      title: "Foundations",
      description: "Build your core understanding",
      courseName: `Introduction to ${query}`,
      courseUrl: "#",
      details: [
        "Core concepts and terminology",
        "Industry overview and use cases",
        "Basic hands-on exercises",
      ],
    },
    {
      step: 2,
      title: "Hands-on Practice",
      description: "Apply your knowledge with real projects",
      courseName: `Build a ${query} Project`,
      courseUrl: "#",
      details: [
        "Step-by-step project tutorial",
        "Real-world application building",
        "Best practices and patterns",
      ],
    },
    {
      step: 3,
      title: "Advanced Mastery",
      description: "Take your skills to the next level",
      courseName: `Advanced ${query} Techniques`,
      courseUrl: "#",
      details: [
        "Advanced optimization strategies",
        "Production-ready implementations",
        "Industry certifications prep",
      ],
    },
  ];
};


export const LearningPath = ({ searchQuery, show, courses = [] }: LearningPathProps) => {
  if (!show) return null;

  const learningPath = getLearningPath(searchQuery, courses);

  return (
    <section className="w-full max-w-6xl mx-auto mt-16">
      {/* Section header */}
      <div className="text-center mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-3">
          <Rocket className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">Personalized for you</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          Recommended Learning Path
        </h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Follow this structured roadmap to master {searchQuery} from beginner to advanced
        </p>
      </div>

      {/* Vertical roadmap */}
      <div className="relative">
        <div className="space-y-4">
          {learningPath.map((step, index) => {
            return (
              <div
                key={step.step}
                className={cn(
                  "relative opacity-0 animate-fade-in-up",
                )}
                style={{ animationDelay: `${300 + index * 150}ms`, animationFillMode: "forwards" }}
              >
                {/* Step card */}
                <div className="glass-strong rounded-xl p-4 sm:p-5 shadow-card hover:shadow-card-hover transition-all duration-300 group">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5 inline-block">
                        Step {step.step}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                        {step.description}
                      </p>

                      {/* Learning points */}
                      <ul className="space-y-1.5">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Course recommendation */}
                    <div className="sm:w-56 p-3 rounded-lg bg-secondary/50 border border-border/50 flex-shrink-0">
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">Recommended Course</p>
                      <p className="font-semibold text-foreground mb-2.5 text-xs sm:text-sm line-clamp-2">{step.courseName}</p>
                      <Button 
                        variant="glass" 
                        size="sm" 
                        className="w-full text-xs h-8 sm:h-9"
                        onClick={() => step.courseUrl && step.courseUrl !== "#" && window.open(step.courseUrl, "_blank")}
                        disabled={!step.courseUrl || step.courseUrl === "#"}
                      >
                        <span>View Course</span>
                        <ExternalLink className="w-3 h-3 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
