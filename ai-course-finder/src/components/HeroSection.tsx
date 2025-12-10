import { BookOpen, Sparkles, Zap } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative text-center mb-12">
      {/* Floating decorative elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute top-10 right-1/4 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      
      <div className="relative">
        {/* Icon badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl gradient-button shadow-lg shadow-primary/20 animate-fade-in">
          <BookOpen className="w-8 h-8 text-primary-foreground" />
        </div>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
          AI Learning{" "}
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
              Course Advisor
            </span>
            <span className="absolute bottom-2 left-0 right-0 h-3 bg-primary/10 rounded-full -z-0" />
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-2 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
          Discover the best online courses instantly
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            AI-Powered Recommendations
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-muted-foreground">
            <Zap className="w-4 h-4 text-primary" />
            Instant Results
          </div>
        </div>
      </div>
    </section>
  );
};
