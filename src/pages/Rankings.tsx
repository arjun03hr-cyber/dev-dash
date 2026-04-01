import { Trophy, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTeamData } from "@/hooks/useTeamData";
import DashboardHeader from "@/components/DashboardHeader";

const Rankings = () => {
  const { getLeaderboard, loading } = useTeamData();
  const leaderboard = getLeaderboard();

  return (
    <div className="min-h-screen bg-background grid-bg flex flex-col">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-neon-blue/[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-purple/[0.03] blur-[120px] rounded-full pointer-events-none" />

      <DashboardHeader />

      <main className="relative flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Final Rankings</h1>
            <p className="text-sm text-muted-foreground mt-1">Live scoreboard for all teams</p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors glass px-4 py-2 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Scoring
          </Link>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="h-10 w-10 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading rankings...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="glass-strong rounded-2xl p-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No teams found.</p>
          </div>
        ) : (
          <div className="glass-strong rounded-2xl p-6 md:p-8 space-y-4 shadow-2xl shadow-background/50">
            {leaderboard.map((entry, i) => (
              <div
                key={entry.team}
                className={`relative flex items-center justify-between p-4 rounded-xl border transition-all hover:scale-[1.01] ${
                  i === 0
                    ? "bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border-neon-blue/30 shadow-[0_0_20px_-5px_var(--neon-blue)]"
                    : i === 1 || i === 2
                    ? "bg-muted/40 border-border/50"
                    : "bg-muted/10 border-transparent hover:bg-muted/20"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    i === 0 ? "bg-neon-blue text-foreground"
                    : i === 1 ? "bg-slate-300 text-slate-800"
                    : i === 2 ? "bg-amber-600 text-white"
                    : "bg-muted text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${i === 0 ? "text-lg text-foreground" : "text-base text-foreground/90"}`}>
                      {entry.team}
                    </h3>
                    {!entry.hasScores && (
                      <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                        Not evaluated yet
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-2xl font-black tracking-tight ${
                    i === 0 ? "text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-cyan" : "text-foreground"
                  }`}>
                    {entry.total}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">/100</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Rankings;
