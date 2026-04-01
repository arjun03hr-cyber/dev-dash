import { Zap } from "lucide-react";

const DashboardHeader = () => (
  <header className="relative overflow-hidden border-b border-border/50">
    <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-neon-purple/5 to-neon-cyan/5" />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-neon-blue/10 blur-[80px] rounded-full" />

    <div className="relative max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-neon flex items-center justify-center glow-blue">
          <Zap className="h-5 w-5 text-foreground" fill="currentColor" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-gradient">DEV DASH 2K26</span>
          </h1>
          <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
            Evaluation Dashboard
          </p>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-3">
        <div className="glass rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-neon-cyan mr-2 animate-pulse-glow" />
          Live Session
        </div>
      </div>
    </div>
  </header>
);

export default DashboardHeader;
