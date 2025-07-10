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
      
      let query = supabase
        .from('flash_runs')
        .select(`
          *,
          creator:profiles(full_name, profile_picture_url),
          participants:flash_run_participants(
            id,
            user_id,
            status,
            user:profiles(full_name, profile_picture_url)
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

      if (error) {
        console.error('Flash runs query error:', error);
        throw error;
      }

      const processedRuns = data?.map(run => ({
        ...run,
        participant_count: run.participants?.filter(p => p.status === 'joined').length || 0,
        is_participant: user ? run.participants?.some(p => p.user_id === user.id && p.status === 'joined') : false
      })) as unknown as FlashRun[] || [];

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