import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { FilterSidebar, FilterState } from "@/components/FilterSidebar";
import { CourseResults } from "@/components/CourseResults";
import { LearningPath } from "@/components/LearningPath";
import { NextRecommendations } from "@/components/NextRecommendations";
import { Footer } from "@/components/Footer";
import { getRecommendations, Course, SearchFilters } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Index = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    levels: [],
    pricing: [],
    providers: [],
    durations: [],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(true); // Always open on desktop, toggleable on mobile

  const handleSearch = async (query: string, filtersToUse: SearchFilters) => {
    setIsLoading(true);
    setSearchQuery(query);
    setError(null);

    try {
      const results = await getRecommendations(query, filtersToUse);
      setCourses(results);
      setHasSearched(true);

      if (results.length === 0) {
        toast.info("No courses found", {
          description: "Try searching with a different topic or check your search query.",
        });
      } else {
        toast.success(`Found ${results.length} courses`, {
          description: `Results for "${query}"`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch courses";
      setError(errorMessage);
      setCourses([]);
      setHasSearched(true);

      toast.error("Error fetching courses", {
        description: errorMessage,
      });
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      levels: [],
      pricing: [],
      providers: [],
      durations: [],
    });
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-primary/4 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Filter Sidebar */}
      <FilterSidebar
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
        isOpen={isFilterOpen}
        onToggle={() => setIsFilterOpen(!isFilterOpen)}
        onSearch={handleSearch}
        isLoading={isLoading}
        searchQuery={searchQuery}
      />

      {/* Main content */}
      <main className={cn(
        "relative flex-1 flex flex-col px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 transition-all duration-300",
        "lg:ml-72" // Always shift on desktop since sidebar is always visible
      )}>
        <div className="w-full max-w-7xl mx-auto">
          <HeroSection />

          {error && (
            <div className="mt-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Compute courses for main results section */}
          {/* If we have 6+ courses, skip the first 3 (used in Learning Path) to avoid duplicates */}
          {/* Otherwise, show all courses */}
          {(() => {
            // Only skip first 3 courses if we have at least 6 courses total
            // This ensures both Learning Path (first 3) and Main Results (rest) have content
            const mainResultsCourses = courses.length >= 6 ? courses.slice(3) : courses;
            return (
              <CourseResults
                courses={mainResultsCourses}
                searchQuery={searchQuery}
                onCoursesUpdate={setCourses}
                filters={filters}
              />
            );
          })()}
          <LearningPath searchQuery={searchQuery} show={hasSearched && courses.length > 0} courses={courses} />
          <NextRecommendations searchQuery={searchQuery} show={hasSearched && courses.length > 0} courses={courses} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
