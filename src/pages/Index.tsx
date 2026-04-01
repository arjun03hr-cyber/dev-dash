import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import TeamSelector from "@/components/TeamSelector";
import CriteriaCard from "@/components/CriteriaCard";
import ScoringPanel from "@/components/ScoringPanel";
import JudgeGuidelines from "@/components/JudgeGuidelines";
import AddTeamDialog from "@/components/AddTeamDialog";
import ScoreHistoryModal from "@/components/ScoreHistoryModal";
import { useTeamData } from "@/hooks/useTeamData";
import { useAuth } from "@/components/AuthProvider";
import { Trophy, Lightbulb, Play, Palette, Puzzle, Globe, Presentation, Sparkles, LogOut, LogIn, Shield, Eye, History } from "lucide-react";
import { Button } from "@/components/ui/button";

const criteriaData = [
  { title: "Idea & Understanding", marks: 15, description: "Problem clarity, logical approach, and domain understanding", icon: Lightbulb },
  { title: "Working Demo", marks: 10, description: "Basic functionality works as intended during live demo", icon: Play },
  { title: "UI / Design", marks: 25, description: "Visual layout, user experience, and design consistency", icon: Palette },
  { title: "Features", marks: 10, description: "Useful and well-implemented feature set", icon: Puzzle },
  { title: "Deployment", marks: 10, description: "Live website availability and accessibility", icon: Globe },
  { title: "Presentation", marks: 20, description: "Clear explanation, confidence, and team coordination", icon: Presentation },
  { title: "Creativity & Future Scope", marks: 10, description: "Innovation, uniqueness, and growth potential", icon: Sparkles },
];

const Index = () => {
  const {
    teams, selectedTeam, setSelectedTeam,
    currentData, setScore, clearScore, setNotes,
    getLeaderboard, loading,
    addTeam, deleteTeam,
    history, historyLoading, fetchHistory, clearHistory,
  } = useTeamData();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);

  const isLoggedIn = !!user;

  // Wrap setScore/clearScore to include user email for history
  const handleSetScore = (criterion: string, value: number) => {
    setScore(criterion, value, user?.email || "unknown");
  };

  const handleClearScore = (criterion: string) => {
    clearScore(criterion, user?.email || "unknown");
  };

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-neon-blue/[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-purple/[0.03] blur-[120px] rounded-full pointer-events-none" />

      <DashboardHeader />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* User bar */}
        <div className="flex items-center justify-between glass rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isAdmin
                    ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20"
                    : "bg-neon-purple/10 text-neon-purple border border-neon-purple/20"
                }`}>
                  {isAdmin ? <Shield className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {isAdmin ? "Admin" : "Viewer"}
                </div>
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {user?.email}
                </span>
              </>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted/50 text-muted-foreground border border-border/50">
                <Eye className="h-3 w-3" />
                Public View
              </div>
            )}
          </div>

          {isLoggedIn ? (
            <Button
              onClick={signOut}
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Sign Out
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-neon-blue"
            >
              <LogIn className="h-3.5 w-3.5 mr-1.5" />
              Admin Login
            </Button>
          )}
        </div>

        {/* Top bar: team selector + actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1">
            <TeamSelector teams={teams} selected={selectedTeam} onSelect={setSelectedTeam} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {isAdmin && (
              <AddTeamDialog teams={teams} onAddTeam={addTeam} onDeleteTeam={deleteTeam} />
            )}
            <Button
              onClick={() => setShowHistory(true)}
              variant="outline"
              className="border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10 hover:text-neon-purple text-xs h-9"
            >
              <History className="h-3.5 w-3.5 mr-1.5" />
              History
            </Button>
            <Button
              onClick={() => navigate("/rankings")}
              className="bg-gradient-neon hover:opacity-90 transition-opacity glow-blue font-semibold h-9 px-4 text-xs"
            >
              <Trophy className="h-3.5 w-3.5 mr-1.5" />
              Final Rankings
            </Button>
          </div>
        </div>

        {/* Loading state */}
        {(loading || authLoading) && (
          <div className="text-center py-12">
            <div className="h-8 w-8 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading evaluations...</p>
          </div>
        )}

        {/* Main grid */}
        {!loading && !authLoading && (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            {/* Left — Criteria */}
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                  Evaluation Criteria
                </h2>
                <p className="text-xs text-muted-foreground/60">7 criteria · 100 total marks</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {criteriaData.map((c, i) => (
                  <CriteriaCard key={c.title} {...c} index={i} />
                ))}
              </div>
              <JudgeGuidelines />
            </div>

            {/* Right — Scoring */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                {isAdmin ? "Live Scoring" : "Score Viewer"}
              </h2>
              <ScoringPanel
                teamName={selectedTeam}
                data={currentData}
                onSetScore={handleSetScore}
                onClearScore={handleClearScore}
                onSetNotes={setNotes}
                isAdmin={isAdmin}
              />
            </div>
          </div>
        )}
      </main>

      {showHistory && (
        <ScoreHistoryModal
          history={history}
          loading={historyLoading}
          teams={teams}
          selectedTeam={selectedTeam}
          onFetchHistory={fetchHistory}
          onClearHistory={clearHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};

export default Index;
