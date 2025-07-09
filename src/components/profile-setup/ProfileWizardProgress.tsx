import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PROFILE_SETUP_STEPS } from '@/constants/profile-setup';

interface ProfileWizardProgressProps {
  currentStep: number;
  formatLastSaved?: string;
  isSaving: boolean;
}

export const ProfileWizardProgress = ({ 
  currentStep, 
  formatLastSaved, 
  isSaving 
}: ProfileWizardProgressProps) => {
  const progress = ((currentStep + 1) / PROFILE_SETUP_STEPS.length) * 100;
  const currentStepData = PROFILE_SETUP_STEPS[currentStep];
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">{currentStepData.title}</span>
        <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      
      {/* Draft status */}
      {formatLastSaved && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {formatLastSaved}
          </span>
          {isSaving && (
            <Badge variant="secondary" className="text-xs">
              Saving...
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};