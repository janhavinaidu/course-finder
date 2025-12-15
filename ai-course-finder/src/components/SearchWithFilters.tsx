import { useState } from "react";
import { Search, Sparkles, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SearchFilters } from "@/lib/api";

interface SearchWithFiltersProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  isLoading: boolean;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export const SearchWithFilters = ({
  onSearch,
  isLoading,
  filters,
  onFiltersChange,
}: SearchWithFiltersProps) => {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), filters);
    }
  };

  const toggleInArray = (arr: string[] | undefined, value: string) => {
    const list = arr || [];
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  };

  const handleLevelToggle = (level: string) => {
    onFiltersChange({
      ...filters,
      levels: toggleInArray(filters.levels, level),
    });
  };

  const handlePricingToggle = (pricing: string) => {
    onFiltersChange({
      ...filters,
      pricings: toggleInArray(filters.pricings, pricing),
    });
  };

  const handleProviderChange = (provider: string) => {
    onFiltersChange({
      ...filters,
      providers: toggleInArray(filters.providers, provider),
    });
  };

  const handleDurationChange = (duration: string) => {
    onFiltersChange({
      ...filters,
      durations: toggleInArray(filters.durations, duration),
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    (filters.levels?.length || 0) +
    (filters.pricings?.length || 0) +
    (filters.providers?.length || 0) +
    (filters.durations?.length || 0) >
    0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Search Section */}
      <section className="relative w-full">
        {/* Decorative background glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl blur-2xl opacity-60" />
        
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search any topic (ex: GenAI, MLOps, Web3)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-14 pr-6"
              />
            </div>
            <Button
              type="submit"
              variant="hero"
              size="lg"
              disabled={isLoading || !query.trim()}
              className="sm:w-auto w-full"
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
          </div>
        </form>
      </section>

      {/* Filters Section */}
      {showFilters && (
        <Card className="glass-strong">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters (Applied during search)
              </CardTitle>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 px-2 text-xs"
                  >
                    Clear All
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-8 px-2 text-xs"
                >
                  {showFilters ? "Hide" : "Show"} Filters
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Select filters before searching to get more targeted results
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Level Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Level</Label>
              <div className="space-y-2">
                {["beginner", "intermediate", "advanced"].map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={`filter-level-${level}`}
                      checked={filters.levels?.includes(level) || false}
                      onCheckedChange={() => handleLevelToggle(level)}
                    />
                    <Label
                      htmlFor={`filter-level-${level}`}
                      className="text-sm font-normal cursor-pointer capitalize"
                    >
                      {level}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Price</Label>
              <div className="space-y-2">
                {["free", "paid"].map((price) => (
                  <div key={price} className="flex items-center space-x-2">
                    <Checkbox
                      id={`filter-price-${price}`}
                      checked={filters.pricings?.includes(price) || false}
                      onCheckedChange={() => handlePricingToggle(price)}
                    />
                    <Label
                      htmlFor={`filter-price-${price}`}
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
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {["Coursera", "edX", "Udemy", "Khan Academy", "Udacity"].map((provider) => (
                  <div key={provider} className="flex items-center space-x-2">
                    <Checkbox
                      id={`filter-provider-${provider}`}
                      checked={filters.providers?.includes(provider) || false}
                      onCheckedChange={() => handleProviderChange(provider)}
                    />
                    <Label
                      htmlFor={`filter-provider-${provider}`}
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
                {["Short (< 4 weeks)", "Medium (4-12 weeks)", "Long (> 12 weeks)"].map((duration) => (
                  <div key={duration} className="flex items-center space-x-2">
                    <Checkbox
                      id={`filter-duration-${duration}`}
                      checked={filters.durations?.includes(duration) || false}
                      onCheckedChange={() => handleDurationChange(duration)}
                    />
                    <Label
                      htmlFor={`filter-duration-${duration}`}
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
      )}
    </div>
  );
};

