import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { CharityMiles } from '@/types/club-events';

export const useCharityMiles = () => {
  const { user } = useAuth();
  const [charityMiles, setCharityMiles] = useState<CharityMiles[]>([]);
  const [totalMiles, setTotalMiles] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCharityMiles = async () => {
    if (!user) {
      setCharityMiles([]);
      setTotalMiles(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('charity_miles')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date', { ascending: false });

      if (error) throw error;

      setCharityMiles(data || []);
      const total = (data || []).reduce((sum, mile) => sum + mile.distance, 0);
      setTotalMiles(total);
    } catch (error) {
      console.error('Error fetching charity miles:', error);
    } finally {
      setLoading(false);
    }
  };

  const logDistance = async (
    eventId: string,
    distance: number,
    organizationName: string,
    causeDescription?: string
  ) => {
    if (!user) {
      toast.error('Please sign in to log distance');
      return false;
    }

    try {
      // First, update the participant record
      await supabase
        .from('club_event_participants')
        .update({
          distance_logged: distance,
          logged_at: new Date().toISOString(),
          attendance_status: 'attended',
        })
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      // Then, create the charity miles record
      const { error } = await supabase
        .from('charity_miles')
        .insert({
          user_id: user.id,
          event_id: eventId,
          distance: distance,
          event_date: new Date().toISOString().split('T')[0],
          organization_name: organizationName,
          cause_description: causeDescription,
        });

      if (error) throw error;

      toast.success(`🏃 +${distance}km added to your charity miles!`);
      await fetchCharityMiles();
      return true;
    } catch (error: any) {
      console.error('Error logging distance:', error);
      if (error.code === '23505') {
        toast.error('Distance already logged for this event');
      } else {
        toast.error('Failed to log distance');
      }
      return false;
    }
  };

  useEffect(() => {
    fetchCharityMiles();
  }, [user]);

  return {
    charityMiles,
    totalMiles,
    loading,
    logDistance,
    refetch: fetchCharityMiles,
  };
};