import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface FlashRun {
  id: string;
  creator_id: string;
  title: string;
  distance: string;
  pace?: string;
  average_speed?: string;
  start_time: string;
  meeting_spot: string;
  meeting_coordinates?: any;
  max_participants: number;
  status: string;
  expires_at: string;
  created_at: string;
  sport_type: string;
  route_type?: string;
  creator?: {
    full_name: string;
    profile_picture_url?: string;
  };
  participants?: {
    id: string;
    user_id: string;
    status: string;
    user?: {
      full_name: string;
      profile_picture_url?: string;
    };
  }[];
  participant_count?: number;
  is_participant?: boolean;
}

export function useFlashRuns(sportType?: string) {
  const [flashRuns, setFlashRuns] = useState<FlashRun[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFlashRuns = async () => {
    try {
      let query = supabase
        .from('flash_runs')
        .select(`
          *,
          creator:profiles!flash_runs_creator_id_fkey(full_name, profile_picture_url),
          participants:flash_run_participants(
            id,
            user_id,
            status,
            user:profiles!flash_run_participants_user_id_fkey(full_name, profile_picture_url)
          )
        `)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('start_time', { ascending: true });

      // Filter by sport type if specified
      if (sportType) {
        query = query.eq('sport_type', sportType);
      }

      const { data, error } = await query;

      if (error) throw error;

      const processedRuns = data?.map(run => ({
        ...run,
        participant_count: run.participants?.filter(p => p.status === 'joined').length || 0,
        is_participant: user ? run.participants?.some(p => p.user_id === user.id && p.status === 'joined') : false
      })) as unknown as FlashRun[] || [];

      setFlashRuns(processedRuns);
    } catch (error) {
      console.error('Error fetching flash runs:', error);
      toast({
        title: "Error",
        description: "Failed to load Flash Runs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createFlashRun = async (data: {
    title: string;
    distance: string;
    pace?: string;
    average_speed?: string;
    start_time: string;
    meeting_spot: string;
    sport_type: string;
    route_type?: string;
    meeting_coordinates?: { lat: number; lng: number };
  }) => {
    if (!user) return null;

    try {
      const startTime = new Date(data.start_time);
      // Calculate expiration time based on sport type
      const hoursToAdd = data.sport_type === 'cycling' ? 2 : 1; // 2 hours for cycling, 1 for running
      const expiresAt = new Date(startTime.getTime() + hoursToAdd * 60 * 60 * 1000);

      const { data: flashRun, error } = await supabase
        .from('flash_runs')
        .insert({
          creator_id: user.id,
          title: data.title,
          distance: data.distance,
          pace: data.pace || null,
          average_speed: data.average_speed || null,
          start_time: startTime.toISOString(),
          meeting_spot: data.meeting_spot,
          meeting_coordinates: data.meeting_coordinates,
          sport_type: data.sport_type,
          route_type: data.route_type || null,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const eventType = data.sport_type === 'cycling' ? 'Flash Ride' : 'Flash Run';
      const eventEmoji = data.sport_type === 'cycling' ? '🚴' : '⚡';
      
      toast({
        title: `${eventEmoji} ${eventType} Created!`,
        description: `Your ${data.distance} ${data.sport_type === 'cycling' ? 'ride' : 'run'} is live and ready for participants!`,
      });

      return flashRun;
    } catch (error) {
      console.error('Error creating flash run:', error);
      toast({
        title: "Error",
        description: "Failed to create Flash Run",
        variant: "destructive"
      });
      return null;
    }
  };

  const joinFlashRun = async (flashRunId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('flash_run_participants')
        .insert({
          flash_run_id: flashRunId,
          user_id: user.id,
          status: 'joined'
        });

      if (error) throw error;

      // Find the flash event to determine sport type
      const flashEvent = flashRuns.find(run => run.id === flashRunId);
      const isCycling = flashEvent?.sport_type === 'cycling';
      const message = isCycling ? "🚴 See you on the saddle!" : "See you at the Flash Run!";
      
      toast({
        title: "🎉 You're in!",
        description: message,
      });

      return true;
    } catch (error) {
      console.error('Error joining flash run:', error);
      toast({
        title: "Error",
        description: "Failed to join Flash Run",
        variant: "destructive"
      });
      return false;
    }
  };

  const leaveFlashRun = async (flashRunId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('flash_run_participants')
        .delete()
        .eq('flash_run_id', flashRunId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Left Flash Run",
        description: "You've left the Flash Run",
      });

      return true;
    } catch (error) {
      console.error('Error leaving flash run:', error);
      toast({
        title: "Error",
        description: "Failed to leave Flash Run",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchFlashRuns();

    // Set up real-time subscription
    const channel = supabase
      .channel(`flash-runs-updates-${sportType || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flash_runs'
        },
        () => {
          fetchFlashRuns();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flash_run_participants'
        },
        () => {
          fetchFlashRuns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, sportType]);

  return {
    flashRuns,
    loading,
    createFlashRun,
    joinFlashRun,
    leaveFlashRun,
    refetch: fetchFlashRuns
  };
}