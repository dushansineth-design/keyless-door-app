import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Lock {
  id: string;
  name: string;
  is_locked: boolean;
  battery_level: number;
  // Note: pin_code is never exposed to the client for security
}

export function useLocks(userId: string | undefined) {
  const [locks, setLocks] = useState<Lock[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setLocks([]);
      setLoading(false);
      return;
    }

    fetchLocks();

    // Subscribe to realtime updates on the secure view
    const channel = supabase
      .channel('locks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'locks',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchLocks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchLocks = async () => {
    try {
      // Query the secure view instead of the locks table to prevent pin_code access
      const { data, error } = await supabase
        .from('locks_secure')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLocks(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading locks",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLock = async (lockId: string, currentState: boolean) => {
    try {
      // SECURITY: No .select() to prevent any data exposure including pin_code
      const { error } = await supabase
        .from('locks')
        .update({ is_locked: !currentState })
        .eq('id', lockId);

      if (error) throw error;

      // Log activity
      await supabase.from('lock_activity').insert({
        lock_id: lockId,
        action: !currentState ? 'locked' : 'unlocked',
      });

      toast({
        title: !currentState ? "Locked" : "Unlocked",
        description: "Lock status updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return { locks, loading, toggleLock, refetch: fetchLocks };
}
