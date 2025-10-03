import { Settings, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LockControl } from "@/components/LockControl";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-border">
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
      <main className="flex-1 flex items-center justify-center py-12">
        <LockControl />
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          All activity is encrypted and logged
        </p>
      </footer>
    </div>
  );
};

export default Index;
