import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";
import { Course } from "@/lib/api";
import { cn } from "@/lib/utils";

export interface FilterState {
  levels: string[];
  pricing: string[];
  providers: string[];
  durations: string[];
}

interface FilterSidebarProps {
  courses: Course[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export const FilterSidebar = ({
  courses,
  filters,
  onFiltersChange,
  onClearFilters,
}: FilterSidebarProps) => {
  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const levels = new Set<string>();
    const pricing = new Set<string>();
    const providers = new Set<string>();
    const durations = new Set<string>();

    courses.forEach((course) => {
      if (course.level) levels.add(course.level);
      if (course.pricing) pricing.add(course.pricing);
      if (course.provider) providers.add(course.provider);
      if (course.duration) {
        const duration = course.duration.toLowerCase();
        // Categorize durations
        if (duration.includes("week")) {
          const weeks = parseInt(duration.match(/\d+/)?.[0] || "0");
          if (weeks < 4) durations.add("Short (< 4 weeks)");
          else if (weeks <= 12) durations.add("Medium (4-12 weeks)");
          else durations.add("Long (> 12 weeks)");
        } else if (duration.includes("hour")) {
          const hours = parseInt(duration.match(/\d+/)?.[0] || "0");
          if (hours < 20) durations.add("Short (< 4 weeks)");
          else if (hours < 60) durations.add("Medium (4-12 weeks)");
          else durations.add("Long (> 12 weeks)");
        } else if (duration.includes("month")) {
          durations.add("Long (> 12 weeks)");
        } else {
          durations.add("Medium (4-12 weeks)");
        }
      }
    });

    return {
      levels: Array.from(levels).sort(),
      pricing: Array.from(pricing).sort(),
      providers: Array.from(providers).sort(),
      durations: Array.from(durations).sort(),
    };
  }, [courses]);

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

  const hasActiveFilters =
    filters.levels.length > 0 ||
    filters.pricing.length > 0 ||
    filters.providers.length > 0 ||
    filters.durations.length > 0;

  return (
    <Card className="glass-strong sticky top-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
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
      <CardContent className="space-y-6">
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
  );
};

