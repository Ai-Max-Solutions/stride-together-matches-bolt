import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeOptimizationProps {
  userId?: string;
  onUpdate?: (payload: any) => void;
  enabled?: boolean;
}

export function useRealtimeOptimization({
  userId,
  onUpdate,
  enabled = true
}: UseRealtimeOptimizationProps) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const isOnlineRef = useRef(true);

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, []);

  const subscribe = useCallback(() => {
    if (!enabled || !userId) return;

    cleanup();

    // Create optimized channel with user-specific filter
    const channel = supabase
      .channel(`user-updates-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=in.(${userId})`
        },
        (payload) => {
          if (isOnlineRef.current) {
            onUpdate?.(payload);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `participant_1_id=eq.${userId},participant_2_id=eq.${userId}`
        },
        (payload) => {
          if (isOnlineRef.current) {
            onUpdate?.(payload);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime connection established');
        } else if (status === 'CHANNEL_ERROR') {
          console.log('Realtime connection error, attempting reconnect...');
          // Exponential backoff reconnection
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isOnlineRef.current) {
              subscribe();
            }
          }, 5000);
        }
      });

    channelRef.current = channel;
  }, [enabled, userId, onUpdate, cleanup]);

  // Handle online/offline states
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
      subscribe();
    };

    const handleOffline = () => {
      isOnlineRef.current = false;
      cleanup();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial subscription
    if (navigator.onLine) {
      subscribe();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      cleanup();
    };
  }, [subscribe, cleanup]);

  // Cleanup on unmount or dependency changes
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    isConnected: channelRef.current?.state === 'joined',
    reconnect: subscribe,
    disconnect: cleanup
  };
}