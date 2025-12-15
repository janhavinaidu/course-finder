import { useState, useMemo } from "react";
import { CourseCard } from "./CourseCard";
import { CourseComparisonModal } from "./CourseComparisonModal";
import { RefinementInput } from "./RefinementInput";
import { GraduationCap } from "lucide-react";
import { Course } from "@/lib/api";

interface CourseResultsProps {
  courses: Course[];
  searchQuery: string;
  onCoursesUpdate?: (courses: Course[]) => void;
}

export const CourseResults = ({ courses, searchQuery, onCoursesUpdate }: CourseResultsProps) => {
  const [selectedForCompare, setSelectedForCompare] = useState<Course[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [displayedCourses, setDisplayedCourses] = useState<Course[]>(courses);

  // Update displayed courses when courses prop changes
  useMemo(() => {
    setDisplayedCourses(courses);
  }, [courses]);

  const handleRefine = (refinedCourses: Course[]) => {
    setDisplayedCourses(refinedCourses);
    if (onCoursesUpdate) {
      onCoursesUpdate(refinedCourses);
    }
    // Clear comparison when refining
    setSelectedForCompare([]);
    setIsComparisonOpen(false);
  };

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
    <section className="w-full max-w-7xl mx-auto mt-16">
      {/* Results header */}
      <div className="flex items-center gap-3 mb-8 opacity-0 animate-fade-in">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <GraduationCap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Found {displayedCourses.length} courses for "{searchQuery}"
          </h2>
          <p className="text-sm text-muted-foreground">
            Explore curated learning paths from top providers
          </p>
        </div>
      </div>

      {/* Refinement Input */}
      <RefinementInput courses={displayedCourses} onRefine={handleRefine} />

      {/* Course grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedCourses.map((course, index) => (
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
  );
};
