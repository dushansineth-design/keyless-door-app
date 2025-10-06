import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Wifi, Lock, Unlock, ArrowLeft, LogOut, Plus, Home } from "lucide-react";
import { LockControl } from "@/components/LockControl";
import { LockCard } from "@/components/LockCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLocks } from "@/hooks/useLocks";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedLock, setSelectedLock] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { locks, loading, toggleLock } = useLocks(user?.id);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
  };

  const handleAddLock = async () => {
    if (!user) return;

    const lockName = prompt("Enter lock name:");
    if (!lockName) return;

    const pinCode = prompt("Enter 4-digit PIN code:");
    if (!pinCode || pinCode.length !== 4 || !/^\d+$/.test(pinCode)) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits",
        variant: "destructive",
      });
      return;
    }

    try {
      // First create the lock without a PIN (PIN will be set via edge function)
      // SECURITY: Only select 'id' to prevent any potential pin_code exposure
      const { data: newLock, error: insertError } = await supabase
        .from("locks")
        .insert({
          name: lockName,
          user_id: user.id,
          is_locked: true,
          battery_level: 100,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      // Then set the PIN securely via edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/set-lock-pin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ lockId: newLock.id, pin: pinCode }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to set PIN");
      }

      toast({
        title: "Success",
        description: "Lock added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const currentLock = locks.find(lock => lock.id === selectedLock);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentLock) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center justify-between p-6 glass border-b border-white/10">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSelectedLock(null)}
            className="hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">{currentLock.name}</h1>
          <Button variant="ghost" size="icon" className="hover:bg-white/5">
            <Settings className="w-5 h-5" />
          </Button>
        </header>

        <main className="flex-1 flex items-center justify-center py-12">
          <LockControl 
            lockName={currentLock.name} 
            lockId={currentLock.id}
            isLocked={currentLock.is_locked}
            onToggle={() => toggleLock(currentLock.id, currentLock.is_locked)}
            onBack={() => setSelectedLock(null)} 
          />
        </main>

        <footer className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Battery: {currentLock.battery_level}% • All activity is encrypted and logged
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={handleSignOut}
            className="text-foreground hover:bg-white/5"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-foreground">
            <Home className="h-5 w-5" />
            <h2 className="text-2xl font-bold">My Locks</h2>
          </div>
          <p className="text-muted-foreground">Manage all your smart locks</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-4 shadow-glass">
            <div className="text-3xl font-bold text-success">
              {locks.filter(l => l.is_locked).length}
            </div>
            <div className="text-sm text-muted-foreground">Locked</div>
          </div>
          <div className="glass rounded-2xl p-4 shadow-glass">
            <div className="text-3xl font-bold text-warning">
              {locks.filter(l => !l.is_locked).length}
            </div>
            <div className="text-sm text-muted-foreground">Unlocked</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">YOUR LOCKS</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddLock}
              className="hover:bg-white/5"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Lock
            </Button>
          </div>
          
          {locks.length === 0 ? (
            <div className="glass rounded-2xl p-8 shadow-glass text-center">
              <Lock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">No locks yet</p>
              <Button onClick={handleAddLock} className="bg-gradient-primary">
                Add Your First Lock
              </Button>
            </div>
          ) : (
            locks.map((lock) => (
              <LockCard
                key={lock.id}
                name={lock.name}
                isLocked={lock.is_locked}
                battery={lock.battery_level}
                onClick={() => setSelectedLock(lock.id)}
              />
            ))
          )}
        </div>
      </main>

      <footer className="p-6 text-center glass border-t border-white/10">
        <p className="text-sm text-muted-foreground">
          All activity is encrypted and logged
        </p>
      </footer>
    </div>
  );
};

export default Index;
