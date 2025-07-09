import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SmartSuggestionParams {
  currentUser: any;
  otherUser: any;
  conversationHistory?: any[];
  type: 'workout' | 'meeting_time' | 'icebreaker' | 'safety';
}

interface WorkoutSuggestion {
  activity: string;
  location: string;
  duration: string;
  difficulty: string;
  safety_tips: string[];
  best_times: string[];
}

interface MeetingTimeSuggestion {
  recommended_times: Array<{
    day: string;
    time: string;
    confidence: number;
    reason: string;
  }>;
  optimal_duration: string;
  location_suggestions: string[];
}

export function useAdvancedAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSmartWorkoutSuggestion = useCallback(async ({
    currentUser,
    otherUser,
    conversationHistory = []
  }: Omit<SmartSuggestionParams, 'type'>): Promise<WorkoutSuggestion | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          type: 'smart_workout_suggestion',
          userProfile: currentUser,
          otherUserProfile: otherUser,
          conversationHistory
        }
      });

      if (error) throw error;
      return data?.suggestion || null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateOptimalMeetingTimes = useCallback(async ({
    currentUser,
    otherUser
  }: Omit<SmartSuggestionParams, 'type' | 'conversationHistory'>): Promise<MeetingTimeSuggestion | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Cross-reference both users' availability
      const sharedAvailability: Record<string, string[]> = {};
      
      Object.keys(currentUser.availability || {}).forEach(day => {
        const currentTimes = currentUser.availability[day] || [];
        const otherTimes = otherUser.availability[day] || [];
        const overlap = currentTimes.filter(time => otherTimes.includes(time));
        
        if (overlap.length > 0) {
          sharedAvailability[day] = overlap;
        }
      });

      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          type: 'optimal_meeting_times',
          userProfile: currentUser,
          otherUserProfile: otherUser,
          sharedAvailability
        }
      });

      if (error) throw error;
      return data?.suggestion || null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateContextualIcebreaker = useCallback(async ({
    currentUser,
    otherUser,
    conversationHistory = []
  }: Omit<SmartSuggestionParams, 'type'>): Promise<string[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          type: 'contextual_icebreaker',
          userProfile: currentUser,
          otherUserProfile: otherUser,
          conversationHistory
        }
      });

      if (error) throw error;
      return data?.suggestion || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const generateSafetyRecommendations = useCallback(async ({
    currentUser,
    otherUser,
    conversationHistory = []
  }: Omit<SmartSuggestionParams, 'type'>): Promise<{
    location_tips: string[];
    timing_recommendations: string[];
    general_safety: string[];
    red_flags: string[];
  } | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          type: 'safety_recommendations',
          userProfile: currentUser,
          otherUserProfile: otherUser,
          conversationHistory
        }
      });

      if (error) throw error;
      return data?.suggestion || null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    generateSmartWorkoutSuggestion,
    generateOptimalMeetingTimes,
    generateContextualIcebreaker,
    generateSafetyRecommendations,
    loading,
    error
  };
}