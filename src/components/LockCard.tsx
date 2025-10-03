import { Lock, Unlock, Battery } from "lucide-react";
import { cn } from "@/lib/utils";

interface LockCardProps {
  name: string;
  isLocked: boolean;
  battery: number;
  onClick: () => void;
}

export const LockCard = ({ name, isLocked, battery, onClick }: LockCardProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full glass rounded-2xl p-6 shadow-glass hover:bg-white/10 transition-all group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center transition-all",
              isLocked
                ? "bg-success/20 group-hover:bg-success/30"
                : "bg-warning/20 group-hover:bg-warning/30"
            )}
          >
            {isLocked ? (
              <Lock className="h-6 w-6 text-success" />
            ) : (
              <Unlock className="h-6 w-6 text-warning" />
            )}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-xs text-muted-foreground">
              {isLocked ? "Locked" : "Unlocked"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Battery
            className={cn(
              "h-4 w-4",
              battery < 20 ? "text-destructive" : battery < 50 ? "text-warning" : "text-success"
            )}
          />
          <span className="text-sm font-medium">{battery}%</span>
        </div>
      </div>
      
      <div className="h-2 glass rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500 rounded-full",
            battery < 20
              ? "bg-destructive"
              : battery < 50
              ? "bg-warning"
              : "bg-success"
          )}
          style={{ width: `${battery}%` }}
        />
      </div>
    </button>
  );
};
