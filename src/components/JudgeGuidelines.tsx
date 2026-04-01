import { AlertCircle } from "lucide-react";

const guidelines = [
  "Each team gets 3–5 minutes for their demo",
  "Small bugs should not heavily affect scoring",
  "Reward effort and creativity generously",
  "Be fair and consistent across all teams",
];

const JudgeGuidelines = () => (
  <div className="glass rounded-xl p-4 animate-fade-in" style={{ animationDelay: "600ms", animationFillMode: "backwards" }}>
    <div className="flex items-center gap-2 mb-3">
      <AlertCircle className="h-3.5 w-3.5 text-neon-purple" />
      <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        Guidelines
      </h3>
    </div>
    <ul className="space-y-2">
      {guidelines.map((g, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
          <span className="mt-1.5 h-1 w-1 rounded-full bg-neon-purple/60 shrink-0" />
          {g}
        </li>
      ))}
    </ul>
  </div>
);

export default JudgeGuidelines;
