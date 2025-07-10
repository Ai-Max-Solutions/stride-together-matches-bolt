import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BrandedChallenge {
  id: string;
  title: string;
  description: string;
  brand_name: string;
  brand_logo_url: string;
  target_distance: number;
  points_reward: number;
  starts_at: string;
  ends_at: string;
  coupon_code?: string;
  coupon_url?: string;
  user_progress?: {
    current_distance: number;
    is_participating: boolean;
    is_completed: boolean;
    progress_percentage: number;
  };
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  profile_picture_url?: string;
  current_distance: number;
  total_activities: number;
  completed_at?: string;
  is_completed: boolean;
  progress_percentage: number;
  rank: number;
}

export function useBrandedChallenges() {
  const [challenges, setChallenges] = useState<BrandedChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBrandedChallenges = async () => {
    try {
      setLoading(true);
      
      // Fetch branded challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .not('brand_name', 'is', null)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (challengesError) throw challengesError;

      // If user is logged in, fetch their progress
      let userProgress: any[] = [];
      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .from('user_challenge_progress')
          .select('*')
          .eq('user_id', user.id);

        if (progressError) throw progressError;
        userProgress = progressData || [];
      }

      // Combine challenges with user progress
      const enrichedChallenges = challengesData?.map((challenge) => {
        const progress = userProgress.find(p => p.challenge_id === challenge.id);
        const progressPercentage = progress 
          ? Math.min((progress.current_distance / challenge.target_distance) * 100, 100)
          : 0;

        return {
          ...challenge,
          user_progress: progress ? {
            current_distance: progress.current_distance || 0,
            is_participating: true,
            is_completed: !!progress.completed_at,
            progress_percentage: Math.round(progressPercentage)
          } : {
            current_distance: 0,
            is_participating: false,
            is_completed: false,
            progress_percentage: 0
          }
        };
      }) || [];

      setChallenges(enrichedChallenges);
    } catch (error) {
      console.error('Error fetching branded challenges:', error);
      toast({
        title: "Error",
        description: "Failed to load branded challenges",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join challenges",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_challenge_progress')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          current_distance: 0,
          current_count: 0,
          total_activities: 0
        });

      if (error) throw error;

      toast({
        title: "Challenge Joined!",
        description: "You've successfully joined the challenge. Start logging your activities!",
      });

      await fetchBrandedChallenges();
      return true;
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: "Error",
        description: "Failed to join challenge",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateProgress = async (challengeId: string, distanceToAdd: number) => {
    if (!user) return false;

    try {
      // First get current progress
      const { data: currentProgress } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId)
        .single();

      if (!currentProgress) {
        toast({
          title: "Error",
          description: "You're not participating in this challenge",
          variant: "destructive"
        });
        return false;
      }

      const newDistance = (currentProgress.current_distance || 0) + distanceToAdd;
      const newActivities = (currentProgress.total_activities || 0) + 1;

      const { error } = await supabase
        .from('user_challenge_progress')
        .update({
          current_distance: newDistance,
          total_activities: newActivities,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId);

      if (error) throw error;

      // Check if challenge is now completed
      const { data: challenge } = await supabase
        .from('challenges')
        .select('target_distance')
        .eq('id', challengeId)
        .single();

      if (challenge && newDistance >= challenge.target_distance) {
        // Complete the challenge
        await completeChallenge(challengeId);
      }

      await fetchBrandedChallenges();
      return true;
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive"
      });
      return false;
    }
  };

  const completeChallenge = async (challengeId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('complete_branded_challenge', {
        p_user_id: user.id,
        p_challenge_id: challengeId
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        toast({
          title: "🎉 Challenge Completed!",
          description: `Congratulations! You earned ${result.points_awarded} points${result.coupon_code ? ` and a ${result.brand_name} coupon!` : '!'}`,
        });

        await fetchBrandedChallenges();
        return result;
      } else {
        toast({
          title: "Unable to complete",
          description: result?.error || "Challenge completion failed",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error completing challenge:', error);
      toast({
        title: "Error",
        description: "Failed to complete challenge",
        variant: "destructive"
      });
    }
    return null;
  };

  useEffect(() => {
    fetchBrandedChallenges();
  }, [user]);

  return {
    challenges,
    loading,
    joinChallenge,
    updateProgress,
    completeChallenge,
    refetch: fetchBrandedChallenges
  };
}

export function useChallengeLeaderboard(challengeId: string) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      // First get the challenge target distance
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('target_distance')
        .eq('id', challengeId)
        .single();

      if (challengeError) throw challengeError;

      // Get user progress for this challenge
      const { data: progressData, error: progressError } = await supabase
        .from('user_challenge_progress')
        .select('user_id, current_distance, total_activities, completed_at')
        .eq('challenge_id', challengeId)
        .order('current_distance', { ascending: false })
        .order('completed_at', { ascending: true });

      if (progressError) throw progressError;

      if (!progressData?.length) {
        setLeaderboard([]);
        return;
      }

      // Get user profiles for all participants
      const userIds = progressData.map(p => p.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, profile_picture_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      const leaderboardData = progressData.map((entry, index) => {
        const profile = profilesData?.find(p => p.user_id === entry.user_id);
        const progressPercentage = Math.min(
          (entry.current_distance / challengeData.target_distance) * 100,
          100
        );

        return {
          user_id: entry.user_id,
          full_name: profile?.full_name || 'Anonymous',
          profile_picture_url: profile?.profile_picture_url,
          current_distance: entry.current_distance || 0,
          total_activities: entry.total_activities || 0,
          completed_at: entry.completed_at,
          is_completed: !!entry.completed_at,
          progress_percentage: Math.round(progressPercentage),
          rank: index + 1
        };
      });

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (challengeId) {
      fetchLeaderboard();
    }
  }, [challengeId]);

  const displayedLeaderboard = showAll ? leaderboard : leaderboard.slice(0, 10);

  return {
    leaderboard: displayedLeaderboard,
    fullLeaderboard: leaderboard,
    loading,
    showAll,
    setShowAll,
    hasMore: leaderboard.length > 10,
    refetch: fetchLeaderboard
  };
}