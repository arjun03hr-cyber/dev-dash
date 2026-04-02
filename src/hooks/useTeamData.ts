import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface TeamScores {
  [criterion: string]: number;
}

export interface TeamData {
  scores: TeamScores;
  notes: string;
}

export interface ScoreHistoryEntry {
  id: string;
  team_name: string;
  criterion: string;
  old_value: number | null;
  new_value: number | null;
  changed_by: string;
  changed_at: string;
}

export type AllTeamData = Record<string, TeamData>;

export function useTeamData() {
  const [teams, setTeams] = useState<string[]>([]);
  const [allData, setAllData] = useState<AllTeamData>({});
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<ScoreHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [syncing, setSyncing] = useState(false);

  // Fetch teams from Supabase
  const fetchTeams = useCallback(async () => {
    const { data, error } = await supabase
      .from("teams")
      .select("name")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to fetch teams from server.");
    } else if (data) {
      setTeams(data.map((t) => t.name));
    }
  }, []);

  // Fetch all evaluations from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchTeams();

      const { data, error } = await supabase
        .from("evaluations")
        .select("team_name, scores, notes");

      if (error) {
        console.error("Error fetching evaluations:", error);
        toast.error("Failed to load evaluations");
      } else if (data) {
        const mapped: AllTeamData = {};
        data.forEach((row) => {
          mapped[row.team_name] = {
            scores: (row.scores as TeamScores) || {},
            notes: row.notes || "",
          };
        });
        setAllData(mapped);
      }
      setLoading(false);
    };

    fetchData();

    // Subscribe to real-time changes for evaluations
    const evalChannel = supabase
      .channel("evaluations-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "evaluations" },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const row = payload.new as { team_name: string; scores: TeamScores; notes: string };
            // Avoid over-writing local state if we are currently syncing
            setAllData((prev) => ({
              ...prev,
              [row.team_name]: {
                scores: row.scores || {},
                notes: row.notes || "",
              },
            }));
          } else if (payload.eventType === "DELETE") {
            const row = payload.old as { team_name: string };
            setAllData((prev) => {
              const copy = { ...prev };
              delete copy[row.team_name];
              return copy;
            });
          }
        }
      )
      .subscribe();

    // Subscribe to real-time changes for teams
    const teamsChannel = supabase
      .channel("teams-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teams" },
        () => {
          fetchTeams();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(evalChannel);
      supabase.removeChannel(teamsChannel);
    };
  }, [fetchTeams]);

  const currentData: TeamData = selectedTeam
    ? allData[selectedTeam] || { scores: {}, notes: "" }
    : { scores: {}, notes: "" };

  // Upsert a team's evaluation to Supabase
  const upsertTeam = useCallback(async (teamName: string, teamData: TeamData) => {
    setSyncing(true);
    const { error } = await supabase
      .from("evaluations")
      .upsert(
        {
          team_name: teamName,
          scores: teamData.scores,
          notes: teamData.notes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "team_name" }
      );

    setSyncing(false);
    if (error) {
      console.error("Error saving evaluation:", error);
      if (error.code === "42501" || error.message?.includes("policy")) {
        toast.error("Permission denied — only admins can edit scores");
      } else {
        toast.error("Cloud Sync Failed - Check Connection");
      }
      return false;
    }
    return true;
  }, []);

  // Log score change to history
  const logScoreChange = useCallback(async (
    teamName: string,
    criterion: string,
    oldValue: number | null,
    newValue: number | null,
    changedBy: string
  ) => {
    const { error } = await supabase.from("score_history").insert({
      team_name: teamName,
      criterion,
      old_value: oldValue,
      new_value: newValue,
      changed_by: changedBy,
    });
    if (error) {
      console.error("Error logging score change:", error);
    }
  }, []);

  const setScore = useCallback(
    async (criterion: string, value: number, changedBy?: string) => {
      if (!selectedTeam) return;
      
      const teamData = allData[selectedTeam] || { scores: {}, notes: "" };
      const oldValue = teamData.scores[criterion] ?? null;
      
      // Optimistic Update
      const updated: TeamData = {
        ...teamData,
        scores: { ...teamData.scores, [criterion]: value },
      };
      
      setAllData((prev) => ({ ...prev, [selectedTeam]: updated }));
      
      const success = await upsertTeam(selectedTeam, updated);
      
      if (success && changedBy) {
        logScoreChange(selectedTeam, criterion, oldValue, value, changedBy);
      } else if (!success) {
        // Rollback on failure
        setAllData((prev) => ({ ...prev, [selectedTeam]: teamData }));
      }
    },
    [selectedTeam, allData, upsertTeam, logScoreChange]
  );

  const clearScore = useCallback(
    async (criterion: string, changedBy?: string) => {
      if (!selectedTeam) return;
      
      const teamData = allData[selectedTeam] || { scores: {}, notes: "" };
      const oldValue = teamData.scores[criterion] ?? null;
      const newScores = { ...teamData.scores };
      delete newScores[criterion];
      
      // Optimistic Update
      const updated: TeamData = { ...teamData, scores: newScores };
      setAllData((prev) => ({ ...prev, [selectedTeam]: updated }));
      
      const success = await upsertTeam(selectedTeam, updated);
      
      if (success && changedBy) {
        logScoreChange(selectedTeam, criterion, oldValue, null, changedBy);
      } else if (!success) {
        // Rollback on failure
        setAllData((prev) => ({ ...prev, [selectedTeam]: teamData }));
      }
    },
    [selectedTeam, allData, upsertTeam, logScoreChange]
  );

  const setNotes = useCallback(
    async (notes: string) => {
      if (!selectedTeam) return;
      const teamData = allData[selectedTeam] || { scores: {}, notes: "" };
      const updated: TeamData = { ...teamData, notes };
      
      // Optimistic update
      setAllData((prev) => ({ ...prev, [selectedTeam]: updated }));
      const success = await upsertTeam(selectedTeam, updated);
      
      if (!success) {
        setAllData((prev) => ({ ...prev, [selectedTeam]: teamData }));
      }
    },
    [selectedTeam, allData, upsertTeam]
  );

  const getTotal = useCallback(
    (team: string) => {
      const data = allData[team];
      if (!data) return 0;
      return Object.values(data.scores).reduce((a, b) => a + b, 0);
    },
    [allData]
  );

  const getLeaderboard = useCallback(() => {
    return teams
      .map((team) => ({
        team,
        total: getTotal(team),
        hasScores: !!allData[team] && Object.keys(allData[team].scores).length > 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [teams, allData, getTotal]);

  // Add a new team
  const addTeam = useCallback(async (teamName: string) => {
    const trimmed = teamName.trim();
    if (!trimmed) {
      toast.error("Team name cannot be empty");
      return false;
    }
    if (teams.includes(trimmed)) {
      toast.error("Team already exists");
      return false;
    }

    const { error } = await supabase.from("teams").insert({ name: trimmed });
    if (error) {
      console.error("Error adding team:", error);
      if (error.code === "42501" || error.message?.includes("policy")) {
        toast.error("Permission denied — only admins can add teams");
      } else if (error.code === "23505") {
        toast.error("Team already exists");
      } else {
        toast.error("Failed to add team");
      }
      return false;
    }
    toast.success(`Team "${trimmed}" added!`);
    return true;
  }, [teams]);

  // Delete a team
  const deleteTeam = useCallback(async (teamName: string) => {
    const { error } = await supabase.from("teams").delete().eq("name", teamName);
    if (error) {
      console.error("Error deleting team:", error);
      toast.error("Failed to delete team");
      return false;
    }
    // Also delete evaluations for this team
    await supabase.from("evaluations").delete().eq("team_name", teamName);
    if (selectedTeam === teamName) setSelectedTeam("");
    toast.success(`Team "${teamName}" removed`);
    return true;
  }, [selectedTeam]);

  // Fetch score history for a specific team
  const fetchHistory = useCallback(async (teamName?: string) => {
    setHistoryLoading(true);
    let query = supabase
      .from("score_history")
      .select("*")
      .order("changed_at", { ascending: false })
      .limit(50);

    if (teamName) {
      query = query.eq("team_name", teamName);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching history:", error);
      setHistory([]);
    } else {
      setHistory((data as ScoreHistoryEntry[]) || []);
    }
    setHistoryLoading(false);
  }, []);

  // Clear score history
  const clearHistory = useCallback(async () => {
    const { error } = await supabase.from("score_history").delete().not("id", "is", null);
    if (error) {
      console.error("Error clearing history:", error);
      toast.error("Failed to clear history");
      return false;
    }
    setHistory([]);
    toast.success("History cleared");
    return true;
  }, []);

  return {
    teams,
    selectedTeam,
    setSelectedTeam,
    currentData,
    setScore,
    clearScore,
    setNotes,
    getTotal,
    getLeaderboard,
    allData,
    loading,
    syncing,
    addTeam,
    deleteTeam,
    history,
    historyLoading,
    fetchHistory,
    clearHistory,
  };
}
