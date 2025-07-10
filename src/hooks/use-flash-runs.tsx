import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface FlashRun {
  id: string;
  creator_id: string;
  title: string;
  distance: string;
  pace: string;
  start_time: string;
  meeting_spot: string;
  meeting_coordinates?: any;
  max_participants: number;
  status: string;
  expires_at: string;
  created_at: string;
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

export function useFlashRuns() {
  const [flashRuns, setFlashRuns] = useState<FlashRun[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFlashRuns = async () => {
    try {
      const { data, error } = await supabase
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
    pace: string;
    start_time: string;
    meeting_spot: string;
    meeting_coordinates?: { lat: number; lng: number };
  }) => {
    if (!user) return null;

    try {
      const startTime = new Date(data.start_time);
      const expiresAt = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hour

      const { data: flashRun, error } = await supabase
        .from('flash_runs')
        .insert({
          creator_id: user.id,
          title: data.title,
          distance: data.distance,
          pace: data.pace,
          start_time: startTime.toISOString(),
          meeting_spot: data.meeting_spot,
          meeting_coordinates: data.meeting_coordinates,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "⚡ Flash Run Created!",
        description: `Your ${data.distance} run is live and ready for participants!`,
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

      toast({
        title: "🎉 You're in!",
        description: "See you at the Flash Run!",
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
      .channel('flash-runs-updates')
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
  }, [user]);

  return {
    flashRuns,
    loading,
    createFlashRun,
    joinFlashRun,
    leaveFlashRun,
    refetch: fetchFlashRuns
  };
}