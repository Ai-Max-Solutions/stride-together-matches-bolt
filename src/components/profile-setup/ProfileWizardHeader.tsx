import { PROFILE_SETUP_STEPS } from '@/constants/profile-setup';

interface ProfileWizardHeaderProps {
  currentStep: number;
  profileExists: boolean;
}

export const ProfileWizardHeader = ({ currentStep, profileExists }: ProfileWizardHeaderProps) => {
  const currentStepData = PROFILE_SETUP_STEPS[currentStep];
  
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        {profileExists ? 'Update Your Profile' : 'Complete Your Profile'}
      </h1>
      <p className="text-muted-foreground">
        Step {currentStep + 1} of {PROFILE_SETUP_STEPS.length}: {currentStepData.description}
      </p>
    </div>
  );
};