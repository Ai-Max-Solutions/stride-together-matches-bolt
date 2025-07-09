import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useFormDraft } from '@/hooks/use-form-draft';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

import { BasicInfoStep } from './BasicInfoStep';
import { SportsStep } from './SportsStep';
import { LocationStep } from './LocationStep';
import { AvailabilityStep } from './AvailabilityStep';
import { ReviewStep } from './ReviewStep';

interface ProfileData {
  full_name: string;
  bio: string;
  sports: string[];
  experience_level: string;
  pace_metrics: Record<string, any>;
  fitness_goals: string[];
  city: string;
  region: string;
  location_visible: boolean;
  availability: Record<string, string[]>;
  age_range_min: number;
  age_range_max: number;
  gender_preference: string;
  profile_picture_url?: string;
}

const STEPS = [
  { id: 'basic', title: 'Basic Info', description: 'Tell us about yourself' },
  { id: 'sports', title: 'Sports & Goals', description: 'Your activities and experience' },
  { id: 'location', title: 'Location & Preferences', description: 'Where and with whom you want to train' },
  { id: 'availability', title: 'Availability', description: 'When are you free to workout?' },
  { id: 'review', title: 'Review', description: 'Confirm your profile details' }
];

export default function ProfileWizard() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    bio: '',
    sports: [],
    experience_level: '',
    pace_metrics: {},
    fitness_goals: [],
    city: '',
    region: '',
    location_visible: true,
    availability: {},
    age_range_min: 18,
    age_range_max: 65,
    gender_preference: 'any'
  });

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
  }, [user, authLoading]);

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
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          ...profileData
        });

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const currentStepData = STEPS[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {profileExists ? 'Update Your Profile' : 'Complete Your Profile'}
          </h1>
          <p className="text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}: {currentStepData.description}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">{currentStepData.title}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Draft status */}
          {formatLastSaved() && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {formatLastSaved()}
              </span>
              {isSaving && (
                <Badge variant="secondary" className="text-xs">
                  Saving...
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Step Content */}
        <Card className="bg-card border shadow-lg">
          <CardHeader>
            <CardTitle>{currentStepData.title}</CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            {currentStep === 0 && (
              <BasicInfoStep 
                data={profileData} 
                onChange={updateProfileData} 
              />
            )}
            {currentStep === 1 && (
              <SportsStep 
                data={profileData} 
                onChange={updateProfileData} 
              />
            )}
            {currentStep === 2 && (
              <LocationStep 
                data={profileData} 
                onChange={updateProfileData} 
              />
            )}
            {currentStep === 3 && (
              <AvailabilityStep 
                data={profileData} 
                onChange={updateProfileData} 
              />
            )}
            {currentStep === 4 && (
              <ReviewStep 
                data={profileData} 
                onEdit={(step) => setCurrentStep(step)}
              />
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/browse')}
                >
                  Skip for now
                </Button>
                
                {currentStep === STEPS.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    variant="hero"
                  >
                    {loading ? 'Saving...' : (profileExists ? 'Update Profile' : 'Complete Profile')}
                  </Button>
                ) : (
                  <Button
                    onClick={nextStep}
                    variant="hero"
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}