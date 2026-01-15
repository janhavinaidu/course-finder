import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Filter, ChevronLeft, ChevronRight, Search, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterState {
  levels: string[];
  pricing: string[];
  providers: string[];
  durations: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
  // Search-related props
  onSearch: (query: string, filters: FilterState) => void;
  isLoading: boolean;
  searchQuery?: string;
}

export const FilterSidebar = ({
  filters,
  onFiltersChange,
  onClearFilters,
  isOpen,
  onToggle,
  onSearch,
  isLoading,
  searchQuery: initialSearchQuery = "",
}: FilterSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  // Static filter options (predefined, not extracted from courses)
  const filterOptions = {
    levels: ["beginner", "intermediate", "advanced"],
    pricing: ["free", "paid"],
    providers: ["Coursera", "edX", "Udemy", "Khan Academy", "Udacity"],
    durations: ["Short (< 4 weeks)", "Medium (4-12 weeks)", "Long (> 12 weeks)"],
  };

  const handleLevelToggle = (level: string) => {
    const newLevels = filters.levels.includes(level)
      ? filters.levels.filter((l) => l !== level)
      : [...filters.levels, level];
    onFiltersChange({ ...filters, levels: newLevels });
  };

  const handlePricingToggle = (price: string) => {
    const newPricing = filters.pricing.includes(price)
      ? filters.pricing.filter((p) => p !== price)
      : [...filters.pricing, price];
    onFiltersChange({ ...filters, pricing: newPricing });
  };

  const handleProviderToggle = (provider: string) => {
    const newProviders = filters.providers.includes(provider)
      ? filters.providers.filter((p) => p !== provider)
      : [...filters.providers, provider];
    onFiltersChange({ ...filters, providers: newProviders });
  };

  const handleDurationToggle = (duration: string) => {
    const newDurations = filters.durations.includes(duration)
      ? filters.durations.filter((d) => d !== duration)
      : [...filters.durations, duration];
    onFiltersChange({ ...filters, durations: newDurations });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim(), filters);
    }
  };

  const hasActiveFilters =
    filters.levels.length > 0 ||
    filters.pricing.length > 0 ||
    filters.providers.length > 0 ||
    filters.durations.length > 0;

  return (
    <div className="relative">
      {/* Backdrop overlay for mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Toggle Button - Only visible on mobile/tablet */}
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className={cn(
          "fixed top-24 z-50 transition-all duration-300 shadow-lg lg:hidden",
          isOpen ? "left-4" : "left-4"
        )}
      >
        {isOpen ? (
          <>
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Hide Filters</span>
            <span className="sm:hidden">Hide</span>
          </>
        ) : (
          <>
            <Filter className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Show Filters</span>
            <span className="sm:hidden">Filters</span>
          </>
        )}
      </Button>

      {/* Sidebar - Always visible on desktop, toggleable on mobile */}
      <div
        className={cn(
          "fixed left-0 top-0 h-screen transition-transform duration-300 z-40 p-6 flex flex-col bg-background/50 lg:bg-transparent",
          "w-full sm:w-80 lg:w-72",
          // On mobile/tablet: slide in/out based on isOpen
          // On desktop (lg+): always visible
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Section - Now above the sidebar card */}
        <div className="flex items-center gap-3 mb-8 px-1">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl gradient-button shadow-lg shadow-primary/20">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-bold leading-tight">AI Learning</h2>
            <p className="text-[10px] font-medium text-primary uppercase tracking-wider">Course Advisor</p>
          </div>
        </div>

        <Card className="glass-strong flex-1 overflow-hidden flex flex-col">
          <CardHeader className="pb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Search & Filters
              </CardTitle>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="h-8 px-2 text-xs"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 overflow-y-auto flex-1">
            {/* Search Section */}
            <div className="space-y-3 pb-4 border-b">
              <Label className="text-sm font-medium">Search Topic</Label>
              <form onSubmit={handleSearch} className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="e.g., GenAI, MLOps, Web3"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  type="submit"
                  variant="hero"
                  size="sm"
                  disabled={isLoading || !searchQuery.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Find Courses</span>
                    </>
                  )}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground">
                Select filters below to refine your search
              </p>
            </div>

            {/* Level Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Level</Label>
              <div className="space-y-2">
                {filterOptions.levels.map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={`level-${level}`}
                      checked={filters.levels.includes(level)}
                      onCheckedChange={() => handleLevelToggle(level)}
                    />
                    <Label
                      htmlFor={`level-${level}`}
                      className="text-sm font-normal cursor-pointer capitalize"
                    >
                      {level}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price/Cost Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Price</Label>
              <div className="space-y-2">
                {filterOptions.pricing.map((price) => (
                  <div key={price} className="flex items-center space-x-2">
                    <Checkbox
                      id={`price-${price}`}
                      checked={filters.pricing.includes(price)}
                      onCheckedChange={() => handlePricingToggle(price)}
                    />
                    <Label
                      htmlFor={`price-${price}`}
                      className="text-sm font-normal cursor-pointer capitalize"
                    >
                      {price}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Provider Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Provider</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filterOptions.providers.map((provider) => (
                  <div key={provider} className="flex items-center space-x-2">
                    <Checkbox
                      id={`provider-${provider}`}
                      checked={filters.providers.includes(provider)}
                      onCheckedChange={() => handleProviderToggle(provider)}
                    />
                    <Label
                      htmlFor={`provider-${provider}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {provider}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Duration Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Duration</Label>
              <div className="space-y-2">
                {filterOptions.durations.map((duration) => (
                  <div key={duration} className="flex items-center space-x-2">
                    <Checkbox
                      id={`duration-${duration}`}
                      checked={filters.durations.includes(duration)}
                      onCheckedChange={() => handleDurationToggle(duration)}
                    />
                    <Label
                      htmlFor={`duration-${duration}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {duration}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
