import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import { useToast } from '@/hooks/use-toast';

export interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement: Achievement;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAchievements();
      fetchUserAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: true });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      logger.error('Error fetching achievements:', error);
    }
  };

  const fetchUserAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setUserAchievements(data || []);
    } catch (error) {
      logger.error('Error fetching user achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const awardAchievement = async (achievementType: string) => {
    if (!user) return;

    try {
      // Find the achievement by type
      const achievement = achievements.find(a => a.type === achievementType);
      if (!achievement) return;

      // Check if user already has this achievement
      const hasAchievement = userAchievements.some(
        ua => ua.achievement.type === achievementType
      );
      if (hasAchievement) return;

      // Award the achievement
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievement.id
        });

      if (error) throw error;

      // Update user's total points
      await supabase
        .from('profiles')
        .update({ 
          total_points: userAchievements.length * 10 + achievement.points 
        })
        .eq('user_id', user.id);

      // Show celebration toast
      toast({
        title: "🎉 Achievement Unlocked!",
        description: `${achievement.icon} ${achievement.title} - ${achievement.description}`,
      });

      // Refresh achievements
      fetchUserAchievements();
    } catch (error) {
      logger.error('Error awarding achievement:', error);
    }
  };

  const checkAchievements = async (context: {
    connectionsCount?: number;
    meetupsCount?: number;
    streakDays?: number;
  }) => {
    if (!user) return;

    const { connectionsCount = 0, meetupsCount = 0, streakDays = 0 } = context;

    // Check for first connection
    if (connectionsCount === 1) {
      await awardAchievement('first_connection');
    }

    // Check for social butterfly (5+ connections in a week)
    if (connectionsCount >= 5) {
      await awardAchievement('social_butterfly');
    }

    // Check for meetup master (5+ completed meetups)
    if (meetupsCount >= 5) {
      await awardAchievement('meetup_master');
    }

    // Check for consistent connector (7-day streak)
    if (streakDays >= 7) {
      await awardAchievement('consistent_connector');
    }
  };

  return {
    achievements,
    userAchievements,
    loading,
    awardAchievement,
    checkAchievements
  };
};