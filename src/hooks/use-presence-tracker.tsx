import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function usePresenceTracker() {
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout>();

  const updateLastActive = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('profiles')
        .update({ last_active_at: new Date().toISOString() })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Failed to update last active:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Update immediately on mount
    updateLastActive();

    // Update every 45 seconds while user is active
    intervalRef.current = setInterval(updateLastActive, 45000);

    // Update on user interaction
    const handleActivity = () => {
      updateLastActive();
    };

    // Listen for user activity
    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [user]);

  return { updateLastActive };
}