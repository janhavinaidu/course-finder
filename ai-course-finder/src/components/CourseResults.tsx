import { useState, useMemo, useEffect } from "react";
import { CourseCard } from "./CourseCard";
import { CourseComparisonModal } from "./CourseComparisonModal";
import { GraduationCap } from "lucide-react";
import { Course } from "@/lib/api";

export interface FilterState {
  levels: string[];
  pricing: string[];
  providers: string[];
  durations: string[];
}

interface CourseResultsProps {
  courses: Course[];
  searchQuery: string;
  onCoursesUpdate?: (courses: Course[]) => void;
  filters: FilterState;
}

export const CourseResults = ({ courses, searchQuery, onCoursesUpdate, filters }: CourseResultsProps) => {
  const [selectedForCompare, setSelectedForCompare] = useState<Course[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [displayedCourses, setDisplayedCourses] = useState<Course[]>(courses);

  // Update displayed courses when courses prop changes
  useEffect(() => {
    setDisplayedCourses(courses);
  }, [courses]);

  // Apply filters to courses
  const filteredCourses = useMemo(() => {
    let result = displayedCourses;

    // Apply level filter
    if (filters.levels.length > 0) {
      result = result.filter((course) =>
        filters.levels.includes(course.level || "")
      );
    }

    // Apply pricing filter
    if (filters.pricing.length > 0) {
      result = result.filter((course) =>
        filters.pricing.includes(course.pricing || "")
      );
    }

    // Apply provider filter
    if (filters.providers.length > 0) {
      result = result.filter((course) =>
        filters.providers.includes(course.provider || "")
      );
    }

    // Apply duration filter
    if (filters.durations.length > 0) {
      result = result.filter((course) => {
        if (!course.duration) return false;
        const duration = course.duration.toLowerCase();

        // Categorize duration
        let category = "";
        if (duration.includes("week")) {
          const weeks = parseInt(duration.match(/\d+/)?.[0] || "0");
          if (weeks < 4) category = "Short (< 4 weeks)";
          else if (weeks <= 12) category = "Medium (4-12 weeks)";
          else category = "Long (> 12 weeks)";
        } else if (duration.includes("hour")) {
          const hours = parseInt(duration.match(/\d+/)?.[0] || "0");
          if (hours < 20) category = "Short (< 4 weeks)";
          else if (hours < 60) category = "Medium (4-12 weeks)";
          else category = "Long (> 12 weeks)";
        } else if (duration.includes("month")) {
          category = "Long (> 12 weeks)";
        } else {
          category = "Medium (4-12 weeks)";
        }

        return filters.durations.includes(category);
      });
    }

    return result;
  }, [displayedCourses, filters]);

  const handleCompareToggle = (course: Course) => {
    setSelectedForCompare((prev) => {
      const isSelected = prev.some((c) => c.id === course.id);
      if (isSelected) {
        const newSelection = prev.filter((c) => c.id !== course.id);
        if (newSelection.length === 0) {
          setIsComparisonOpen(false);
        }
        return newSelection;
      } else {
        if (prev.length >= 3) {
          return prev;
        }
        const newSelection = [...prev, course];
        if (newSelection.length > 0) {
          setIsComparisonOpen(true);
        }
        return newSelection;
      }
    });
  };

  const handleRemoveFromCompare = (courseId: number) => {
    setSelectedForCompare((prev) => {
      const newSelection = prev.filter((c) => c.id !== courseId);
      if (newSelection.length === 0) {
        setIsComparisonOpen(false);
      }
      return newSelection;
    });
  };

  if (displayedCourses.length === 0) {
    return null;
  }

  return (
    <>
      <section className="w-full max-w-7xl mx-auto mt-16">
        {/* Results header */}
        <div className="flex items-center gap-3 mb-8 opacity-0 animate-fade-in">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Found {filteredCourses.length} courses for "{searchQuery}"
            </h2>
            <p className="text-sm text-muted-foreground">
              Explore curated learning paths from top providers
            </p>
          </div>
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              index={index}
              onCompare={handleCompareToggle}
              isSelectedForCompare={selectedForCompare.some((c) => c.id === course.id)}
            />
          ))}
        </div>

        {/* Comparison Modal */}
        <CourseComparisonModal
          courses={selectedForCompare}
          open={isComparisonOpen}
          onOpenChange={setIsComparisonOpen}
          onRemoveCourse={handleRemoveFromCompare}
        />
      </section>
    </>
  );
};
