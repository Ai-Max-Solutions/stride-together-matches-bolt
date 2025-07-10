import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { ClubEvent, ClubEventParticipant } from '@/types/club-events';

export const useClubEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClubEvents = async () => {
    try {
      // Get events with organization data and participant counts
      const { data: eventsData, error: eventsError } = await supabase
        .from('club_events')
        .select(`
          *,
          organizations:organization_id (
            id,
            name,
            logo_url,
            organization_type,
            verification_status
          )
        `)
        .eq('event_status', 'upcoming')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (eventsError) throw eventsError;

      // Get participant counts and check if user joined
      const eventsWithParticipants = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { count } = await supabase
            .from('club_event_participants')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);

          let isJoined = false;
          if (user) {
            const { data: participation } = await supabase
              .from('club_event_participants')
              .select('id')
              .eq('event_id', event.id)
              .eq('user_id', user.id)
              .single();
            
            isJoined = !!participation;
          }

          return {
            ...event,
            organization: Array.isArray(event.organizations) ? event.organizations[0] : event.organizations,
            participant_count: count || 0,
            is_joined: isJoined,
          } as ClubEvent;
        })
      );

      setEvents(eventsWithParticipants);
    } catch (error) {
      console.error('Error fetching club events:', error);
      toast.error('Failed to load club events');
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async (eventId: string) => {
    if (!user) {
      toast.error('Please sign in to join events');
      return false;
    }

    try {
      const { error } = await supabase
        .from('club_event_participants')
        .insert({
          event_id: eventId,
          user_id: user.id,
        });

      if (error) throw error;

      toast.success('Successfully joined the event!');
      await fetchClubEvents(); // Refresh the list
      return true;
    } catch (error: any) {
      console.error('Error joining event:', error);
      if (error.code === '23505') {
        toast.error('You have already joined this event');
      } else {
        toast.error('Failed to join event');
      }
      return false;
    }
  };

  const leaveEvent = async (eventId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('club_event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Left the event');
      await fetchClubEvents(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error leaving event:', error);
      toast.error('Failed to leave event');
      return false;
    }
  };

  const createEvent = async (eventData: {
    organization_id: string;
    title: string;
    description?: string;
    event_date: string;
    distance: string;
    meeting_point: string;
    meeting_coordinates?: any;
    max_participants?: number;
    cause_description?: string;
    registration_deadline?: string;
  }) => {
    if (!user) {
      toast.error('Please sign in to create events');
      return false;
    }

    try {
      const { error } = await supabase
        .from('club_events')
        .insert({
          ...eventData,
          organiser_id: user.id,
        });

      if (error) throw error;

      toast.success('Event created successfully!');
      await fetchClubEvents(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
      return false;
    }
  };

  useEffect(() => {
    fetchClubEvents();
  }, [user]);

  return {
    events,
    loading,
    joinEvent,
    leaveEvent,
    createEvent,
    refetch: fetchClubEvents,
  };
};