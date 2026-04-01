import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Lock, Minus, Plus } from "lucide-react";
import type { TeamData } from "@/hooks/useTeamData";

const CRITERIA = [
  { key: "idea", label: "Idea & Understanding", max: 15 },
  { key: "demo", label: "Working Demo", max: 10 },
  { key: "ui", label: "UI / Design", max: 25 },
  { key: "features", label: "Features", max: 10 },
  { key: "deployment", label: "Deployment", max: 10 },
  { key: "presentation", label: "Presentation", max: 20 },
  { key: "creativity", label: "Creativity & Future Scope", max: 10 },
];

const AnimatedScore = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>();

  useEffect(() => {
    const start = display;
    const diff = value - start;
    const duration = 400;
    const t0 = performance.now();
    const animate = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      setDisplay(Math.round(start + diff * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [value]);

  return <span>{display}</span>;
};

interface ScoringPanelProps {
  teamName: string;
  data: TeamData;
  onSetScore: (criterion: string, value: number) => void;
  onClearScore: (criterion: string) => void;
  onSetNotes: (notes: string) => void;
  isAdmin: boolean;
}

const ScoringPanel = ({ teamName, data, onSetScore, onClearScore, onSetNotes, isAdmin }: ScoringPanelProps) => {
  const total = Object.values(data.scores).reduce((a, b) => a + b, 0);

  const handleScore = (key: string, value: string, max: number) => {
    if (value === "") { onClearScore(key); return; }
    const num = Math.min(Math.max(0, parseInt(value) || 0), max);
    onSetScore(key, num);
  };

  const getScoreColor = () => {
    if (total >= 80) return "from-emerald-400 to-emerald-500";
    if (total >= 50) return "from-neon-blue to-neon-purple";
    if (total > 0) return "from-amber-400 to-orange-500";
    return "from-muted-foreground to-muted-foreground";
  };

  if (!teamName) {
    return (
      <div className="glass-strong rounded-2xl p-8 text-center">
        <p className="text-muted-foreground text-sm">Select a team to start scoring</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Read-only badge for users */}
      {!isAdmin && (
        <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2 border border-amber-500/20 bg-amber-500/[0.05]">
          <Lock className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-medium text-amber-400/90">View Only — Admin access required to edit</span>
        </div>
      )}

      {/* Score Display */}
      <div className="glass-strong rounded-2xl p-5 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5" />
        <div className="relative">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1">
            {teamName}
          </p>
          <div className="flex items-baseline justify-center gap-1">
            <span className={`text-5xl font-black bg-gradient-to-r ${getScoreColor()} bg-clip-text text-transparent`}>
              <AnimatedScore value={total} />
            </span>
            <span className="text-base text-muted-foreground font-medium">/100</span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getScoreColor()} transition-all duration-500 ease-out`}
              style={{ width: `${total}%` }}
            />
          </div>
        </div>
      </div>

      {/* Score Inputs */}
      <div className="glass rounded-xl p-4 space-y-2">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
          Criteria Scores
        </label>
        {CRITERIA.map((c) => {
          const val = data.scores[c.key];
          const pct = val != null ? (val / c.max) * 100 : 0;
          return (
            <div key={c.key} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium text-foreground/80 truncate">{c.label}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">/{c.max}</span>
                </div>
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 bg-muted/30 border border-border/50 rounded-lg p-0.5 focus-within:border-neon-blue/50 focus-within:ring-1 focus-within:ring-neon-blue/20 transition-all">
                {isAdmin && (
                  <button
                    onClick={() => handleScore(c.key, String((val || 0) - 1), c.max)}
                    disabled={!val || val <= 0}
                    className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted/80 hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                )}
                <Input
                  type="number"
                  min={0}
                  max={c.max}
                  value={val ?? ""}
                  onChange={(e) => handleScore(c.key, e.target.value, c.max)}
                  placeholder={isAdmin ? "0" : "—"}
                  disabled={!isAdmin}
                  className={`w-10 text-center text-sm font-semibold border-0 focus-visible:ring-0 p-0 h-7 bg-transparent no-spin-buttons ${
                    !isAdmin ? "opacity-90 disabled:cursor-auto text-foreground font-bold" : ""
                  }`}
                />
                {isAdmin && (
                  <button
                    onClick={() => handleScore(c.key, String((val || 0) + 1), c.max)}
                    disabled={val != null && val >= c.max}
                    className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted/80 hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes */}
      <div className="glass rounded-xl p-4">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
          Judge Notes
        </label>
        <Textarea
          placeholder={isAdmin ? "Feedback for this team..." : "Notes are read-only for viewers"}
          rows={3}
          value={data.notes}
          onChange={(e) => onSetNotes(e.target.value)}
          disabled={!isAdmin}
          className={`bg-muted/50 border-border/50 focus:border-neon-blue/50 focus:ring-neon-blue/20 resize-none text-sm ${
            !isAdmin ? "opacity-60 cursor-not-allowed" : ""
          }`}
        />
      </div>

      <p className="text-[10px] text-muted-foreground/50 text-center">
        {isAdmin ? "Scores auto-save per team" : "Viewing scores in read-only mode"}
      </p>
    </div>
  );
};

export default ScoringPanel;
