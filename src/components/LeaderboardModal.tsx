import { Trophy, X, Medal } from "lucide-react";

interface LeaderboardEntry {
  team: string;
  total: number;
  hasScores: boolean;
}

interface LeaderboardModalProps {
  entries: LeaderboardEntry[];
  onClose: () => void;
}

const LeaderboardModal = ({ entries, onClose }: LeaderboardModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
    <div
      className="relative glass-strong rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-scale-in"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-neon-cyan" />
          <h2 className="text-base font-bold text-foreground">Leaderboard</h2>
        </div>
        <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-y-auto max-h-[60vh]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30">
              <th className="px-5 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-10">#</th>
              <th className="px-2 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Team</th>
              <th className="px-5 py-2.5 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Score</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => {
              const rank = i + 1;
              const medalColor = rank === 1 ? "text-amber-400" : rank === 2 ? "text-gray-300" : rank === 3 ? "text-amber-600" : null;
              return (
                <tr
                  key={entry.team}
                  className={`border-b border-border/20 transition-colors hover:bg-muted/30 ${
                    rank <= 3 && entry.hasScores ? "bg-neon-blue/[0.03]" : ""
                  }`}
                >
                  <td className="px-5 py-2.5">
                    {medalColor && entry.hasScores ? (
                      <Medal className={`h-4 w-4 ${medalColor}`} />
                    ) : (
                      <span className="text-xs text-muted-foreground">{rank}</span>
                    )}
                  </td>
                  <td className="px-2 py-2.5">
                    <span className={`text-sm font-medium ${entry.hasScores ? "text-foreground" : "text-muted-foreground/50"}`}>
                      {entry.team}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    {entry.hasScores ? (
                      <span className="text-sm font-bold text-neon-cyan">{entry.total}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground/40">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default LeaderboardModal;
