import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Mentorship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  sport: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  ended_at?: string;
}

export function useMentorships() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMentorships = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mentorships')
        .select('*')
        .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMentorships((data || []) as Mentorship[]);
    } catch (error: any) {
      console.error('Error fetching mentorships:', error);
      toast({
        title: "Error loading mentorships",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const requestMentorship = async (mentorId: string, sport: string) => {
    if (!user) return false;

    try {
      // Check if user already has an active mentor for this sport
      const { data: existing, error: checkError } = await supabase
        .from('mentorships')
        .select('id')
        .eq('mentee_id', user.id)
        .eq('sport', sport)
        .eq('status', 'active')
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        toast({
          title: "Mentorship limit reached",
          description: `You already have an active mentor for ${sport}`,
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('mentorships')
        .insert({
          mentor_id: mentorId,
          mentee_id: user.id,
          sport,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Mentorship requested!",
        description: "Your mentor will be notified and can start helping you.",
      });

      fetchMentorships();
      return true;
    } catch (error: any) {
      console.error('Error requesting mentorship:', error);
      toast({
        title: "Error requesting mentorship",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const endMentorship = async (mentorshipId: string) => {
    try {
      const { error } = await supabase
        .from('mentorships')
        .update({ 
          status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('id', mentorshipId);

      if (error) throw error;

      toast({
        title: "Mentorship completed",
        description: "Thank you for participating in the mentoring program!",
      });

      fetchMentorships();
    } catch (error: any) {
      console.error('Error ending mentorship:', error);
      toast({
        title: "Error ending mentorship",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchMentorships();
  }, [user]);

  return {
    mentorships,
    loading,
    requestMentorship,
    endMentorship,
    refetch: fetchMentorships
  };
}