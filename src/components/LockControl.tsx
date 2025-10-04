import { useState } from "react";
import { Lock, Unlock, Activity, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PinEntry } from "./PinEntry";

interface LockControlProps {
  lockName: string;
  lockId: string;
  isLocked: boolean;
  pinCode: string;
  onToggle: () => void;
  onBack: () => void;
}

export const LockControl = ({ 
  lockName, 
  lockId,
  isLocked, 
  pinCode,
  onToggle,
  onBack 
}: LockControlProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPinEntry, setShowPinEntry] = useState(false);

  const toggleLock = () => {
    if (isLocked) {
      // Unlocking requires PIN
      setShowPinEntry(true);
    } else {
      // Locking is immediate
      performLock();
    }
  };

  const performUnlock = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onToggle();
      setIsAnimating(false);
      setShowPinEntry(false);
    }, 300);
  };

  const performLock = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onToggle();
      setIsAnimating(false);
    }, 300);
  };

  return (
    <>
      {showPinEntry && (
        <PinEntry
          correctPin={pinCode}
          onSuccess={performUnlock}
          onCancel={() => setShowPinEntry(false)}
        />
      )}

      <div className="flex flex-col items-center justify-center gap-8 px-6">
        <div className="text-center space-y-2">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back
          </Button>
          <h2 className="text-2xl font-bold text-foreground">{lockName}</h2>
          <p className="text-muted-foreground">
            {isLocked ? "Secured" : "Unlocked"}
          </p>
        </div>

        <div className="relative">
          <div
            className={cn(
              "absolute inset-0 rounded-full blur-3xl transition-all duration-500",
              isLocked ? "bg-success/30" : "bg-warning/30"
            )}
          />
          <Button
            size="lg"
            onClick={toggleLock}
            disabled={isAnimating}
            className={cn(
              "relative h-48 w-48 rounded-full text-xl font-semibold transition-all duration-300",
              "hover:scale-105 active:scale-95 glass-strong",
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
              <span>{isLocked ? "Tap to Unlock" : "Tap to Lock"}</span>
              {isLocked && (
                <KeyRound className="h-4 w-4 text-foreground/60" />
              )}
            </div>
          </Button>
        </div>

        <div className="w-full max-w-md space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span className="text-sm font-medium">Recent Activity</span>
          </div>
          <div className="glass rounded-2xl shadow-glass overflow-hidden">
            <div className="divide-y divide-white/10">
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
          </div>
        </div>
      </div>
    </>
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
    <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center glass",
            isLocked ? "bg-success/20" : "bg-warning/20"
          )}
        >
          {isLocked ? (
            <Lock className="h-5 w-5 text-success" />
          ) : (
            <Unlock className="h-5 w-5 text-warning" />
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
