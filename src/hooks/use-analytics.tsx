import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Generate a simple session ID for tracking user sessions
const generateSessionId = () => {
  if (typeof window !== 'undefined') {
    let sessionId = sessionStorage.getItem('session-id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('session-id', sessionId);
    }
    return sessionId;
  }
  return null;
};

export const useAnalytics = () => {
  const location = useLocation();
  const { user } = useAuth();

  const trackPageVisit = async (pagePath: string) => {
    try {
      const sessionId = generateSessionId();
      
      await supabase
        .from('page_analytics')
        .insert({
          user_id: user?.id || null,
          page_path: pagePath,
          session_id: sessionId,
          visited_at: new Date().toISOString()
        });
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.warn('Analytics tracking failed:', error);
    }
  };

  useEffect(() => {
    // Track page visit when location changes
    trackPageVisit(location.pathname);
  }, [location.pathname, user?.id]);

  return { trackPageVisit };
};