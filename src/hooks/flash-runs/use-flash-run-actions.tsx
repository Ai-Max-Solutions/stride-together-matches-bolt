import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFlashRunMessages } from './use-flash-run-messages';
import { useFlashRunExpiration } from './use-flash-run-expiration';
import type { CreateFlashRunData, FlashRun } from '@/types/flash-runs';

/**
 * Hook for Flash Run actions: create, join, leave
 */
export function useFlashRunActions() {
  const { user } = useAuth();
  const { showCreationSuccess, showJoinSuccess, showLeaveSuccess, showError } = useFlashRunMessages();
  const { calculateExpirationTime, getMaxParticipants } = useFlashRunExpiration();

  const createFlashRun = async (data: CreateFlashRunData) => {
    if (!user) return null;

    try {
      const startTime = new Date(data.start_time);
      const expiresAt = calculateExpirationTime(data.start_time, data.sport_type);
      const maxParticipants = getMaxParticipants(data.sport_type);

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
          max_participants: maxParticipants,
          expires_at: expiresAt
        })
        .select()
        .single();

      if (error) throw error;

      showCreationSuccess(data);
      return flashRun;
    } catch (error) {
      console.error('Error creating flash run:', error);
      showError('create');
      return null;
    }
  };

  const joinFlashRun = async (flashRunId: string, flashRuns: FlashRun[]) => {
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

      const flashEvent = flashRuns.find(run => run.id === flashRunId);
      showJoinSuccess(flashEvent);
      return true;
    } catch (error) {
      console.error('Error joining flash run:', error);
      showError('join');
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

      showLeaveSuccess();
      return true;
    } catch (error) {
      console.error('Error leaving flash run:', error);
      showError('leave');
      return false;
    }
  };

  return {
    createFlashRun,
    joinFlashRun,
    leaveFlashRun
  };
}