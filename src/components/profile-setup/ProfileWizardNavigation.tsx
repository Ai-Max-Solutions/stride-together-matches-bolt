import { Button } from '@/components/ui/button';
import { PROFILE_SETUP_STEPS } from '@/constants/profile-setup';

interface ProfileWizardNavigationProps {
  currentStep: number;
  loading: boolean;
  profileExists: boolean;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSubmit: () => void;
  onSkip: () => void;
}

export const ProfileWizardNavigation = ({
  currentStep,
  loading,
  profileExists,
  onPrevStep,
  onNextStep,
  onSubmit,
  onSkip
}: ProfileWizardNavigationProps) => {
  const isLastStep = currentStep === PROFILE_SETUP_STEPS.length - 1;
  
  return (
    <div className="flex justify-between mt-8">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevStep}
        disabled={currentStep === 0}
      >
        Previous
      </Button>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
        >
          Skip for now
        </Button>
        
        {isLastStep ? (
          <Button
            onClick={onSubmit}
            disabled={loading}
            variant="hero"
          >
            {loading ? 'Saving...' : (profileExists ? 'Update Profile' : 'Complete Profile')}
          </Button>
        ) : (
          <Button
            onClick={onNextStep}
            variant="hero"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};