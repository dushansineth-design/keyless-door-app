import { useState } from "react";
import { Lock, Unlock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const LockControl = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleLock = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLocked(!isLocked);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 px-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Front Door</h2>
        <p className="text-muted-foreground">
          {isLocked ? "Secured" : "Unlocked"}
        </p>
      </div>

      <div className="relative">
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-2xl transition-all duration-500",
            isLocked ? "bg-success/30" : "bg-warning/30"
          )}
        />
        <Button
          size="lg"
          onClick={toggleLock}
          disabled={isAnimating}
          className={cn(
            "relative h-48 w-48 rounded-full text-xl font-semibold transition-all duration-300",
            "hover:scale-105 active:scale-95",
            isLocked
              ? "bg-gradient-success shadow-success hover:shadow-success/80"
              : "bg-gradient-warning shadow-warning hover:shadow-warning/80"
          )}
        >
          <div className="flex flex-col items-center gap-3">
            {isLocked ? (
              <Lock className={cn("h-16 w-16", isAnimating && "animate-pulse")} />
            ) : (
              <Unlock className={cn("h-16 w-16", isAnimating && "animate-pulse")} />
            )}
            <span>{isLocked ? "Locked" : "Unlocked"}</span>
          </div>
        </Button>
      </div>

      <div className="w-full max-w-md space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span className="text-sm font-medium">Recent Activity</span>
        </div>
        <Card className="bg-card border-border">
          <div className="divide-y divide-border">
            <ActivityItem
              action="Locked"
              time="2 minutes ago"
              user="You"
              isLocked={true}
            />
            <ActivityItem
              action="Unlocked"
              time="1 hour ago"
              user="You"
              isLocked={false}
            />
            <ActivityItem
              action="Locked"
              time="3 hours ago"
              user="You"
              isLocked={true}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

const ActivityItem = ({
  action,
  time,
  user,
  isLocked,
}: {
  action: string;
  time: string;
  user: string;
  isLocked: boolean;
}) => {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center",
            isLocked ? "bg-success/20" : "bg-warning/20"
          )}
        >
          {isLocked ? (
            <Lock className={cn("h-5 w-5", "text-success")} />
          ) : (
            <Unlock className={cn("h-5 w-5", "text-warning")} />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{action}</p>
          <p className="text-xs text-muted-foreground">by {user}</p>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">{time}</span>
    </div>
  );
};
