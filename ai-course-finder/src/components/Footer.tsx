import { Sparkles } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-auto pt-20 pb-8">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4 text-primary/60" />
          <span>Powered by AI. Live data coming soon.</span>
        </div>
        <div className="w-16 h-0.5 rounded-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    </footer>
  );
};
