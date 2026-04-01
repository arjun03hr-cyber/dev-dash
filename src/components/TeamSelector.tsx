import { ChevronDown, Users } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface TeamSelectorProps {
  teams: string[];
  selected: string;
  onSelect: (team: string) => void;
}

const TeamSelector = ({ teams, selected, onSelect }: TeamSelectorProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full glass-strong rounded-xl px-4 py-3 flex items-center justify-between gap-3 transition-all hover:border-neon-blue/30 focus:outline-none focus:ring-1 focus:ring-neon-blue/40"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-neon/10 border border-neon-blue/20 flex items-center justify-center">
            <Users className="h-4 w-4 text-neon-blue" />
          </div>
          <div className="text-left">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Select Team</p>
            <p className="text-sm font-semibold text-foreground">
              {selected || "Choose a team..."}
            </p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 glass-strong rounded-xl overflow-hidden shadow-2xl shadow-background/80 max-h-64 overflow-y-auto animate-scale-in">
          {teams.map((team) => (
            <button
              key={team}
              onClick={() => { onSelect(team); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                team === selected
                  ? "bg-neon-blue/10 text-neon-blue font-medium"
                  : "text-foreground/80 hover:bg-muted/50"
              }`}
            >
              {team}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamSelector;
