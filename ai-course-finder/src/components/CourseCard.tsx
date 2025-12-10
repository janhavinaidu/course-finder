import { ExternalLink, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Course } from "@/lib/api";

interface CourseCardProps {
  course: Course;
  index: number;
}

const levelConfig = {
  beginner: { label: "Beginner", className: "badge-beginner" },
  intermediate: { label: "Intermediate", className: "badge-intermediate" },
  advanced: { label: "Advanced", className: "badge-advanced" },
};

const pricingConfig = {
  free: { label: "Free", className: "badge-free" },
  paid: { label: "Paid", className: "badge-paid" },
};

export const CourseCard = ({ course, index }: CourseCardProps) => {
  const levelInfo = levelConfig[course.level];
  const pricingInfo = pricingConfig[course.pricing];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl glass-strong shadow-card p-6",
        "hover:shadow-card-hover hover:-translate-y-1",
        "transition-all duration-500 ease-out",
        "opacity-0 animate-fade-in-up"
      )}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      </div>

      <div className="relative z-10">
        {/* Header with badges */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors duration-300">
            {course.name}
          </h3>
          <div className="flex gap-2 flex-shrink-0">
            <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", pricingInfo.className)}>
              {pricingInfo.label}
            </span>
          </div>
        </div>

        {/* Provider and Level */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">
            {course.provider}
          </span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", levelInfo.className)}>
            {levelInfo.label}
          </span>
          {course.duration && (
            <>
              <span className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{course.duration}</span>
              </div>
            </>
          )}
          {course.rating && (
            <>
              <span className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{course.rating.toFixed(1)}</span>
              </div>
            </>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-2">
          {course.description}
        </p>

        {/* CTA Button */}
        <Button
          variant="glass"
          size="sm"
          className="w-full group/btn"
          onClick={() => window.open(course.url, "_blank")}
        >
          <span>Open Course</span>
          <ExternalLink className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </Button>
      </div>
    </div>
  );
};
