import { useState, useEffect } from "react";
import { X, History, Clock, ArrowRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ScoreHistoryEntry } from "@/hooks/useTeamData";
import { useAuth } from "@/components/AuthProvider";

const CRITERIA_LABELS: Record<string, string> = {
  idea: "Idea & Understanding",
  demo: "Working Demo",
  ui: "UI / Design",
  features: "Features",
  deployment: "Deployment",
  presentation: "Presentation",
  creativity: "Creativity & Future Scope",
};

interface ScoreHistoryModalProps {
  history: ScoreHistoryEntry[];
  loading: boolean;
  teams: string[];
  selectedTeam: string;
  onFetchHistory: (teamName?: string) => Promise<void>;
  onClearHistory: () => Promise<boolean>;
  onClose: () => void;
}

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const timeStr = d.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' });
  const dateStr = d.toLocaleDateString("en-IN", { month: 'short', day: 'numeric' });
  return `${dateStr}, ${timeStr}`;
};

const ScoreHistoryModal = ({ history, loading, teams, selectedTeam, onFetchHistory, onClearHistory, onClose }: ScoreHistoryModalProps) => {
  const [filterTeam, setFilterTeam] = useState(selectedTeam || "");
  const { isAdmin } = useAuth();
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    onFetchHistory(filterTeam || undefined);
  }, [filterTeam, onFetchHistory]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-strong rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[80vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center">
              <History className="h-4 w-4 text-neon-purple" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Score History</h3>
              <p className="text-[10px] text-muted-foreground">Recent score changes</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="flex-1 bg-muted/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-neon-blue/50"
          >
            <option value="">All Teams</option>
            {teams.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="h-6 w-6 border-2 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No score changes yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Changes will appear here when admins update scores</p>
            </div>
          ) : (
            history.map((entry) => (
              <div key={entry.id} className="glass rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neon-blue">{entry.team_name}</span>
                  <span className="text-[10px] text-muted-foreground">{formatTime(entry.changed_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-foreground/80">
                    {CRITERIA_LABELS[entry.criterion] || entry.criterion}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`font-mono px-1.5 py-0.5 rounded ${
                    entry.old_value != null
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {entry.old_value ?? "—"}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className={`font-mono px-1.5 py-0.5 rounded ${
                    entry.new_value != null
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {entry.new_value ?? "—"}
                  </span>
                  <span className="text-muted-foreground/60 ml-auto text-[10px] truncate max-w-[120px]">
                    by {entry.changed_by}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center">
          <p className="text-[10px] text-muted-foreground/50">{history.length} entries</p>
          <div className="flex gap-2">
            {isAdmin && history.length > 0 && (
              <Button
                onClick={async () => {
                  if (window.confirm("Are you sure you want to completely erase the score history log? This cannot be undone.")) {
                    setClearing(true);
                    await onClearHistory();
                    setClearing(false);
                  }
                }}
                disabled={clearing}
                variant="outline"
                size="sm"
                className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                {clearing ? "Clearing..." : "Clear History"}
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreHistoryModal;
