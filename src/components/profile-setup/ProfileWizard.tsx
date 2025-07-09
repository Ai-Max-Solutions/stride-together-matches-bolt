import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PROFILE_SETUP_STEPS } from '@/constants/profile-setup';
import { useProfileWizard } from '@/hooks/use-profile-wizard';

import { BasicInfoStep } from './BasicInfoStep';
import { SportsStep } from './SportsStep';
import { LocationStep } from './LocationStep';
import { AvailabilityStep } from './AvailabilityStep';
import { ReviewStep } from './ReviewStep';
import { ProfileWizardHeader } from './ProfileWizardHeader';
import { ProfileWizardProgress } from './ProfileWizardProgress';
import { ProfileWizardNavigation } from './ProfileWizardNavigation';

export default function ProfileWizard() {
  const {
    currentStep,
    loading,
    profileExists,
    profileData,
    authLoading,
    formatLastSaved,
    isSaving,
    updateProfileData,
    nextStep,
    prevStep,
    goToStep,
    handleSubmit,
    navigate
  } = useProfileWizard();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  const currentStepData = PROFILE_SETUP_STEPS[currentStep];

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep 
            data={profileData} 
            onChange={updateProfileData} 
          />
        );
      case 1:
        return (
          <SportsStep 
            data={profileData} 
            onChange={updateProfileData} 
          />
        );
      case 2:
        return (
          <LocationStep 
            data={profileData} 
            onChange={updateProfileData} 
          />
        );
      case 3:
        return (
          <AvailabilityStep 
            data={profileData} 
            onChange={updateProfileData} 
          />
        );
      case 4:
        return (
          <ReviewStep 
            data={profileData} 
            onEdit={goToStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <ProfileWizardHeader 
          currentStep={currentStep}
          profileExists={profileExists}
        />

        <ProfileWizardProgress 
          currentStep={currentStep}
          formatLastSaved={formatLastSaved}
          isSaving={isSaving}
        />

        <Card className="bg-card border shadow-lg">
          <CardHeader>
            <CardTitle>{currentStepData.title}</CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            {renderCurrentStep()}

            <ProfileWizardNavigation 
              currentStep={currentStep}
              loading={loading}
              profileExists={profileExists}
              onPrevStep={prevStep}
              onNextStep={nextStep}
              onSubmit={handleSubmit}
              onSkip={() => navigate('/browse')}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}