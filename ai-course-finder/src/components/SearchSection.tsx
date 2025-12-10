import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchSectionProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const SearchSection = ({ onSearch, isLoading }: SearchSectionProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <section className="relative w-full max-w-2xl mx-auto">
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
  );
};
