import { useState } from "react";
import { Settings, Wifi, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LockControl } from "@/components/LockControl";
import { LockCard } from "@/components/LockCard";

interface Lock {
  id: string;
  name: string;
  isLocked: boolean;
  battery: number;
}

const Index = () => {
  const [selectedLock, setSelectedLock] = useState<string | null>(null);
  const [locks, setLocks] = useState<Lock[]>([
    { id: "1", name: "Front Door", isLocked: true, battery: 87 },
    { id: "2", name: "Back Door", isLocked: false, battery: 45 },
    { id: "3", name: "Garage", isLocked: true, battery: 92 },
  ]);

  const currentLock = locks.find(lock => lock.id === selectedLock);

  if (currentLock) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center justify-between p-6 glass border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <div className="h-4 w-4 border-2 border-primary-foreground rounded" />
            </div>
            <h1 className="text-xl font-bold text-foreground">SecureLock</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-success">
              <Wifi className="h-4 w-4" />
              <span className="text-xs font-medium">Connected</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center py-12">
          <LockControl 
            lockName={currentLock.name} 
            onBack={() => setSelectedLock(null)} 
          />
        </main>

        <footer className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            All activity is encrypted and logged
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6 glass border-b border-white/10 sticky top-0 z-10 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <div className="h-4 w-4 border-2 border-primary-foreground rounded" />
          </div>
          <h1 className="text-xl font-bold text-foreground">SecureLock</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-success">
            <Wifi className="h-4 w-4" />
            <span className="text-xs font-medium">Connected</span>
          </div>
          <Button size="icon" variant="ghost" className="text-foreground">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-foreground">
            <Home className="h-5 w-5" />
            <h2 className="text-2xl font-bold">My Locks</h2>
          </div>
          <p className="text-muted-foreground">Manage all your smart locks</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-4 shadow-glass">
            <div className="text-3xl font-bold text-success">
              {locks.filter(l => l.isLocked).length}
            </div>
            <div className="text-sm text-muted-foreground">Locked</div>
          </div>
          <div className="glass rounded-2xl p-4 shadow-glass">
            <div className="text-3xl font-bold text-warning">
              {locks.filter(l => !l.isLocked).length}
            </div>
            <div className="text-sm text-muted-foreground">Unlocked</div>
          </div>
        </div>

        {/* Locks List */}
        <div className="space-y-3">
          {locks.map((lock) => (
            <LockCard
              key={lock.id}
              name={lock.name}
              isLocked={lock.isLocked}
              battery={lock.battery}
              onClick={() => setSelectedLock(lock.id)}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center glass border-t border-white/10">
        <p className="text-sm text-muted-foreground">
          All activity is encrypted and logged
        </p>
      </footer>
    </div>
  );
};

export default Index;
