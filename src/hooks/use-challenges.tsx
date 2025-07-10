import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'seasonal';
  target_count: number;
  points_reward: number;
  starts_at: string;
  ends_at: string;
  status: 'active' | 'completed' | 'expired';
  created_at: string;
}

export interface UserChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  current_count: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  challenge: Challenge;
}

export const useChallenges = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userProgress, setUserProgress] = useState<UserChallengeProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActiveChallenges();
      fetchUserProgress();
    }
  }, [user]);

  const fetchActiveChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('status', 'active')
        .lte('starts_at', new Date().toISOString())
        .gte('ends_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const fetchUserProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_challenge_progress')
        .select(`
          *,
          challenge:challenges(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserProgress(data || []);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (challengeId: string, increment: number = 1) => {
    if (!user) return;

    try {
      // Find existing progress
      const existingProgress = userProgress.find(p => p.challenge_id === challengeId);
      const challenge = challenges.find(c => c.id === challengeId);
      
      if (!challenge) return;

      if (existingProgress) {
        // Update existing progress
        const newCount = existingProgress.current_count + increment;
        const isCompleted = newCount >= challenge.target_count;

        const { error } = await supabase
          .from('user_challenge_progress')
          .update({
            current_count: newCount,
            completed_at: isCompleted ? new Date().toISOString() : null
          })
          .eq('id', existingProgress.id);

        if (error) throw error;

        // Show completion notification
        if (isCompleted && !existingProgress.completed_at) {
          toast({
            title: "🎯 Challenge Complete!",
            description: `${challenge.title} - You earned ${challenge.points_reward} points!`,
          });

          // Update user's total points
          await supabase
            .from('profiles')
            .update({ 
              total_points: (userProgress.length * 10) + challenge.points_reward 
            })
            .eq('user_id', user.id);
        }
      } else {
        // Create new progress entry
        const isCompleted = increment >= challenge.target_count;

        const { error } = await supabase
          .from('user_challenge_progress')
          .insert({
            user_id: user.id,
            challenge_id: challengeId,
            current_count: increment,
            completed_at: isCompleted ? new Date().toISOString() : null
          });

        if (error) throw error;

        if (isCompleted) {
          toast({
            title: "🎯 Challenge Complete!",
            description: `${challenge.title} - You earned ${challenge.points_reward} points!`,
          });
        }
      }

      // Refresh progress
      fetchUserProgress();
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  };

  const getProgressPercentage = (challengeId: string): number => {
    const progress = userProgress.find(p => p.challenge_id === challengeId);
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (!progress || !challenge) return 0;
    
    return Math.min((progress.current_count / challenge.target_count) * 100, 100);
  };

  const isCompleted = (challengeId: string): boolean => {
    const progress = userProgress.find(p => p.challenge_id === challengeId);
    return !!progress?.completed_at;
  };

  return {
    challenges,
    userProgress,
    loading,
    updateProgress,
    getProgressPercentage,
    isCompleted
  };
};