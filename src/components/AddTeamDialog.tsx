import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface AddTeamDialogProps {
  teams: string[];
  onAddTeam: (name: string) => Promise<boolean>;
  onDeleteTeam: (name: string) => Promise<boolean>;
}

const AddTeamDialog = ({ teams, onAddTeam, onDeleteTeam }: AddTeamDialogProps) => {
  const [open, setOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newTeamName.trim()) {
      toast.error("Enter a team name");
      return;
    }
    setAdding(true);
    const success = await onAddTeam(newTeamName);
    if (success) setNewTeamName("");
    setAdding(false);
  };

  const handleDelete = async (name: string) => {
    await onDeleteTeam(name);
    setConfirmDelete(null);
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className="border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10 hover:text-neon-blue text-xs h-9"
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Manage Teams
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-strong rounded-2xl p-6 w-full max-w-md mx-4 max-h-[80vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Manage Teams</h3>
          <button
            onClick={() => { setOpen(false); setConfirmDelete(null); }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Add new team */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="New team name..."
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="bg-muted/50 border-border/50 focus:border-neon-blue/50 focus:ring-neon-blue/20 h-10 text-sm"
          />
          <Button
            onClick={handleAdd}
            disabled={adding || !newTeamName.trim()}
            className="bg-gradient-neon hover:opacity-90 glow-blue font-semibold h-10 px-4 shrink-0"
          >
            {adding ? (
              <div className="h-4 w-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </>
            )}
          </Button>
        </div>

        {/* Team list */}
        <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {teams.length} Teams
          </p>
          {teams.map((team) => (
            <div
              key={team}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30 group transition-colors"
            >
              <span className="text-sm text-foreground/80 truncate">{team}</span>
              {confirmDelete === team ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-destructive font-medium">Delete?</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => handleDelete(team)}
                  >
                    Yes
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => setConfirmDelete(null)}
                  >
                    No
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(team)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddTeamDialog;
