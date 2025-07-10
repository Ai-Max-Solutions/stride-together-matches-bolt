import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPresence {
  isOnline: boolean;
  lastSeen: string | null;
  isTyping: boolean;
}

export function useUserPresence(userId?: string) {
  const { user } = useAuth();
  const [presence, setPresence] = useState<UserPresence>({
    isOnline: false,
    lastSeen: null,
    isTyping: false
  });
  const [lastActiveAt, setLastActiveAt] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Fetch last_active_at from database
    const fetchLastActive = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('last_active_at')
        .eq('user_id', userId)
        .single();
      
      if (data?.last_active_at) {
        setLastActiveAt(data.last_active_at);
      }
    };

    fetchLastActive();

    // Set up real-time subscription for profile updates
    const profileChannel = supabase
      .channel(`profile-updates-${userId}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => {
          if (payload.new.last_active_at) {
            setLastActiveAt(payload.new.last_active_at);
          }
        }
      )
      .subscribe();

    let presenceChannel: any;

    const setupPresence = async () => {
      // Create a channel for this user's presence
      presenceChannel = supabase
        .channel(`user-presence-${userId}`)
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannel.presenceState();
          const userPresences = state[userId] || [];
          const isOnline = userPresences.length > 0;
          
          setPresence(prev => ({
            ...prev,
            isOnline,
            lastSeen: isOnline ? null : (userPresences[0]?.last_seen || prev.lastSeen)
          }));
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          if (key === userId) {
            setPresence(prev => ({ ...prev, isOnline: true, lastSeen: null }));
          }
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          if (key === userId) {
            const lastSeen = new Date().toISOString();
            setPresence(prev => ({ ...prev, isOnline: false, lastSeen }));
          }
        })
        .subscribe();

      // Track current user's presence
      if (user && user.id === userId) {
        await presenceChannel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
        });
      }
    };

    setupPresence();

    return () => {
      if (presenceChannel) {
        supabase.removeChannel(presenceChannel);
      }
      if (profileChannel) {
        supabase.removeChannel(profileChannel);
      }
    };
  }, [userId, user]);

  const getStatusText = (): string => {
    // Check real-time presence first
    if (presence.isOnline) {
      return 'Online now';
    }
    
    // Then check database last_active_at
    const timestampToCheck = presence.lastSeen || lastActiveAt;
    if (timestampToCheck) {
      const lastSeenDate = new Date(timestampToCheck);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 5) return 'Online now';
      if (diffInMinutes < 60) return `Active ${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `Active ${Math.floor(diffInMinutes / 60)}h ago`;
      if (diffInMinutes < 10080) return `Active ${Math.floor(diffInMinutes / 1440)}d ago`;
      return 'Last seen recently';
    }
    
    return 'Last seen recently';
  };

  const getStatusColor = (): string => {
    if (presence.isOnline) return 'online';
    
    if (presence.lastSeen) {
      const lastSeenDate = new Date(presence.lastSeen);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 30) return 'recently-active';
    }
    
    return 'offline';
  };

  return {
    ...presence,
    statusText: getStatusText(),
    statusColor: getStatusColor()
  };
}