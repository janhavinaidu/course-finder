import { BookOpen, Code, Rocket, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
}

const getMockLearningPath = (query: string): LearningStep[] => {
  const basePath: LearningStep[] = [
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

  return basePath;
};

const stepIcons = [BookOpen, Code, Rocket];

export const LearningPath = ({ searchQuery, show }: LearningPathProps) => {
  if (!show) return null;

  const learningPath = getMockLearningPath(searchQuery);

  return (
    <section className="w-full max-w-4xl mx-auto mt-20">
      {/* Section header */}
      <div className="text-center mb-12 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
          <Rocket className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Personalized for you</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Recommended Learning Path
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Follow this structured roadmap to master {searchQuery} from beginner to advanced
        </p>
      </div>

      {/* Vertical roadmap */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/30 to-primary/10 hidden sm:block" />

        <div className="space-y-6">
          {learningPath.map((step, index) => {
            const Icon = stepIcons[index];
            return (
              <div
                key={step.step}
                className={cn(
                  "relative opacity-0 animate-fade-in-up",
                )}
                style={{ animationDelay: `${300 + index * 150}ms`, animationFillMode: "forwards" }}
              >
                {/* Step card */}
                <div className="sm:ml-16 glass-strong rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-500 group">
                  {/* Step indicator (mobile) */}
                  <div className="sm:hidden flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg gradient-button flex items-center justify-center shadow-md shadow-primary/20">
                      <Icon className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Step {step.step}
                    </span>
                  </div>

                  {/* Step indicator (desktop) */}
                  <div className="absolute left-0 top-6 hidden sm:flex items-center">
                    <div className="w-11 h-11 rounded-xl gradient-button flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <span className="hidden sm:inline-block text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                        Step {step.step}
                      </span>
                      <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {step.description}
                      </p>

                      {/* Learning points */}
                      <ul className="space-y-2">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Course recommendation */}
                    <div className="lg:w-64 p-4 rounded-xl bg-secondary/50 border border-border/50">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Recommended Course</p>
                      <p className="font-semibold text-foreground mb-3 text-sm">{step.courseName}</p>
                      <Button variant="glass" size="sm" className="w-full">
                        View Course
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
