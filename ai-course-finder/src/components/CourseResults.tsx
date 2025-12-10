import { CourseCard } from "./CourseCard";
import { GraduationCap } from "lucide-react";
import { Course } from "@/lib/api";

interface CourseResultsProps {
  courses: Course[];
  searchQuery: string;
}

export const CourseResults = ({ courses, searchQuery }: CourseResultsProps) => {
  if (courses.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-5xl mx-auto mt-16">
      {/* Results header */}
      <div className="flex items-center gap-3 mb-8 opacity-0 animate-fade-in">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <GraduationCap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Found {courses.length} courses for "{searchQuery}"
          </h2>
          <p className="text-sm text-muted-foreground">
            Explore curated learning paths from top providers
          </p>
        </div>
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course, index) => (
          <CourseCard key={course.id} course={course} index={index} />
        ))}
      </div>
    </section>
  );
};
