import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useTypingIndicator(conversationId?: string) {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const channelRef = useRef<any>();

  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`typing-${conversationId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const { userId, isTyping } = payload;
        
        if (userId !== user.id) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (isTyping) {
              newSet.add(userId);
            } else {
              newSet.delete(userId);
            }
            return newSet;
          });

          // Auto-remove typing indicator after 3 seconds
          if (isTyping) {
            setTimeout(() => {
              setTypingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
              });
            }, 3000);
          }
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [conversationId, user]);

  const sendTypingIndicator = (isTyping: boolean) => {
    if (!channelRef.current || !user) return;

    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user.id, isTyping }
    });
  };

  const handleTyping = () => {
    sendTypingIndicator(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
    }, 1000);
  };

  const stopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTypingIndicator(false);
  };

  return {
    typingUsers: Array.from(typingUsers),
    handleTyping,
    stopTyping
  };
}