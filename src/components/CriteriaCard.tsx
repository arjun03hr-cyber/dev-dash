import { type LucideIcon } from "lucide-react";

interface CriteriaCardProps {
  title: string;
  marks: number;
  description: string;
  icon: LucideIcon;
  index: number;
}

const CriteriaCard = ({ title, marks, description, icon: Icon, index }: CriteriaCardProps) => (
  <div
    className="group glass rounded-xl p-4 transition-all duration-300 hover:glow-neon hover:border-neon-blue/30 hover:bg-[hsla(0,0%,100%,0.08)] animate-fade-in-up"
    style={{ animationDelay: `${index * 80}ms`, animationFillMode: "backwards" }}
  >
    <div className="flex items-start gap-3">
      <div className="shrink-0 h-9 w-9 rounded-lg bg-gradient-neon/10 border border-neon-blue/20 flex items-center justify-center group-hover:border-neon-blue/40 transition-colors">
        <Icon className="h-4 w-4 text-neon-blue" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold text-foreground truncate">{title}</h3>
          <span className="shrink-0 text-xs font-bold text-neon-cyan bg-neon-cyan/10 px-2 py-0.5 rounded-full">
            {marks}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
);

export default CriteriaCard;
