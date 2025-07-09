import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { SportsBadges } from '@/components/common/sports-badges';
import { useProfileValidation } from '@/hooks/use-profile-validation';
import { EXPERIENCE_LEVELS, FITNESS_GOALS } from '@/constants';

interface SportsStepProps {
  data: {
    sports: string[];
    experience_level: string;
    fitness_goals: string[];
  };
  onChange: (updates: any) => void;
}

export function SportsStep({ data, onChange }: SportsStepProps) {
  const { validateSportsSelection } = useProfileValidation();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSportToggle = (sport: string) => {
    const newSports = data.sports.includes(sport)
      ? data.sports.filter(s => s !== sport)
      : [...data.sports, sport];
    
    // Validate sports selection
    const error = validateSportsSelection(newSports);
    setErrors(prev => ({ ...prev, sports: error || '' }));
    
    onChange({ sports: newSports });
  };

  const handleGoalToggle = (goal: string) => {
    const newGoals = data.fitness_goals.includes(goal)
      ? data.fitness_goals.filter(g => g !== goal)
      : [...data.fitness_goals, goal];
    
    onChange({ fitness_goals: newGoals });
  };

  return (
    <div className="space-y-6">
      {/* Sports Selection */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Sports & Activities *
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Select the sports and activities you enjoy or want to try (up to 5)
        </p>
        
        <SportsBadges 
          selectedSports={data.sports}
          onSportToggle={handleSportToggle}
          variant="interactive"
        />
        
        {errors.sports && (
          <p className="text-sm text-destructive mt-2">{errors.sports}</p>
        )}
        
        {data.sports.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium mb-2">Selected sports:</p>
            <SportsBadges 
              selectedSports={data.sports}
              variant="display"
            />
          </div>
        )}
      </div>

      {/* Experience Level */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Experience Level *
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          How would you describe your overall fitness experience?
        </p>
        
        <Select
          value={data.experience_level}
          onValueChange={(value) => onChange({ experience_level: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your experience level" />
          </SelectTrigger>
          <SelectContent>
            {EXPERIENCE_LEVELS.map(level => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fitness Goals */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Fitness Goals (Optional)
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          What are you hoping to achieve? This helps us find compatible partners.
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          {FITNESS_GOALS.map(goal => (
            <div key={goal} className="flex items-center space-x-2">
              <Checkbox
                id={goal}
                checked={data.fitness_goals.includes(goal)}
                onCheckedChange={() => handleGoalToggle(goal)}
              />
              <Label htmlFor={goal} className="capitalize text-sm">
                {goal.replace('_', ' ')}
              </Label>
            </div>
          ))}
        </div>
        
        {data.fitness_goals.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium mb-2">Your goals:</p>
            <div className="flex flex-wrap gap-1">
              {data.fitness_goals.map(goal => (
                <span 
                  key={goal} 
                  className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full"
                >
                  {goal.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-semibold text-sm mb-2">Matching Tips:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Choose sports you actively do or want to learn</li>
          <li>• Experience level helps match you with similar partners</li>
          <li>• Goals help find people with compatible motivations</li>
        </ul>
      </div>
    </div>
  );
}