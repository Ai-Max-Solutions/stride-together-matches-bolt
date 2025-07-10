import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFlashRunMessages } from './use-flash-run-messages';
import type { FlashRun } from '@/types/flash-runs';

/**
 * Hook for fetching and managing Flash Run data
 */
export function useFlashRunData(sportType?: string) {
  const [flashRuns, setFlashRuns] = useState<FlashRun[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showError } = useFlashRunMessages();

  const fetchFlashRuns = async () => {
    try {
      setLoading(true);
      
      // Get flash runs first
      let query = supabase
        .from('flash_runs')
        .select('*')
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('start_time', { ascending: true });

      // Filter by sport type if specified
      if (sportType) {
        query = query.eq('sport_type', sportType);
      }

      const { data: runsData, error: runsError } = await query;

      if (runsError) {
        console.error('Flash runs query error:', runsError);
        throw runsError;
      }

      if (!runsData || runsData.length === 0) {
        setFlashRuns([]);
        return;
      }

      // Get unique creator IDs
      const creatorIds = [...new Set(runsData.map(run => run.creator_id))];
      
      // Get creator profiles
      const { data: creatorsData, error: creatorsError } = await supabase
        .from('profiles')
        .select('user_id, full_name, profile_picture_url')
        .in('user_id', creatorIds);

      if (creatorsError) {
        console.error('Creators query error:', creatorsError);
        throw creatorsError;
      }

      // Create a map for quick lookup
      const creatorsMap = new Map(creatorsData?.map(creator => [creator.user_id, creator]) || []);

      // Get participants for all runs
      const runIds = runsData.map(run => run.id);
      const { data: participantsData, error: participantsError } = await supabase
        .from('flash_run_participants')
        .select('*')
        .in('flash_run_id', runIds);

      if (participantsError) {
        console.error('Participants query error:', participantsError);
        throw participantsError;
      }

      // Get participant profiles
      const participantUserIds = [...new Set(participantsData?.map(p => p.user_id) || [])];
      const { data: participantProfilesData, error: participantProfilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, profile_picture_url')
        .in('user_id', participantUserIds);

      if (participantProfilesError) {
        console.error('Participant profiles query error:', participantProfilesError);
        throw participantProfilesError;
      }

      const participantProfilesMap = new Map(participantProfilesData?.map(profile => [profile.user_id, profile]) || []);

      // Group participants by flash run ID
      const participantsByRun = new Map<string, any[]>();
      participantsData?.forEach(participant => {
        const runParticipants = participantsByRun.get(participant.flash_run_id) || [];
        runParticipants.push({
          ...participant,
          user: participantProfilesMap.get(participant.user_id)
        });
        participantsByRun.set(participant.flash_run_id, runParticipants);
      });

      const processedRuns = runsData.map(run => {
        const participants = participantsByRun.get(run.id) || [];
        return {
          ...run,
          creator: creatorsMap.get(run.creator_id),
          participants,
          participant_count: participants.filter(p => p.status === 'joined').length,
          is_participant: user ? participants.some(p => p.user_id === user.id && p.status === 'joined') : false
        };
      }) as FlashRun[];

      setFlashRuns(processedRuns);
    } catch (error) {
      console.error('Error fetching flash runs:', error);
      showError('fetch');
    } finally {
      setLoading(false);
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
    refetch: fetchFlashRuns
  };
}