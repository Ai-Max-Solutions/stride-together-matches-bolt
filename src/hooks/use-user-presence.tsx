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

  useEffect(() => {
    if (!userId || !user) return;

    let channel: any;

    const setupPresence = async () => {
      // Create a channel for this user's presence
      channel = supabase
        .channel(`user-presence-${userId}`)
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
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
      if (user.id === userId) {
        await channel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
        });
      }
    };

    setupPresence();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, user]);

  const getStatusText = (): string => {
    if (presence.isOnline) {
      return 'Online now';
    }
    
    if (presence.lastSeen) {
      const lastSeenDate = new Date(presence.lastSeen);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just left';
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