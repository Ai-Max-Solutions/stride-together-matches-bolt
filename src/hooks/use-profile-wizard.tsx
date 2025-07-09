import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useFormDraft } from '@/hooks/use-form-draft';
import { supabase } from '@/integrations/supabase/client';
import { ProfileData } from '@/types/profile';
import { DEFAULT_PROFILE_DATA } from '@/constants/profile-setup';

export const useProfileWizard = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(DEFAULT_PROFILE_DATA);

  const { saveDraft, loadDraft, clearDraft, formatLastSaved, isSaving } = useFormDraft({
    key: 'profile_setup'
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfileExists(true);
        setProfileData({
          full_name: data.full_name || '',
          bio: data.bio || '',
          sports: data.sports || [],
          experience_level: data.experience_level || '',
          pace_metrics: (data.pace_metrics as Record<string, any>) || {},
          fitness_goals: data.fitness_goals || [],
          city: data.city || '',
          region: data.region || '',
          location_visible: data.location_visible ?? true,
          availability: (data.availability as Record<string, string[]>) || {},
          age_range_min: data.age_range_min || 18,
          age_range_max: data.age_range_max || 65,
          gender_preference: data.gender_preference || 'any',
          profile_picture_url: data.profile_picture_url || undefined
        });
      } else {
        // Load draft if no profile exists
        const draft = loadDraft();
        if (draft) {
          setProfileData(prev => ({ ...prev, ...draft }));
          toast({
            title: "Draft loaded",
            description: "We've restored your previous progress.",
          });
        }
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    }
  };

  const updateProfileData = (updates: Partial<ProfileData>) => {
    const newData = { ...profileData, ...updates };
    setProfileData(newData);
    saveDraft(newData);
  };

  const nextStep = () => {
    if (currentStep < 4) { // 5 steps total (0-4)
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Check if profile exists first
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let error;
      if (existingProfile) {
        // Update existing profile
        const result = await supabase
          .from('profiles')
          .update({
            email: user.email,
            ...profileData
          })
          .eq('user_id', user.id);
        error = result.error;
      } else {
        // Insert new profile
        const result = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email,
            ...profileData
          });
        error = result.error;
      }

      if (error) throw error;

      clearDraft();
      toast({
        title: "Profile saved!",
        description: "Your profile has been updated successfully.",
      });

      navigate('/browse');
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    currentStep,
    loading,
    profileExists,
    profileData,
    authLoading,
    formatLastSaved: formatLastSaved(),
    isSaving,
    
    // Actions
    updateProfileData,
    nextStep,
    prevStep,
    goToStep,
    handleSubmit,
    
    // Navigation
    navigate
  };
};