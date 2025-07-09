import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SPORTS_OPTIONS } from "@/constants";

interface SportsBadgesProps {
  selectedSports: string[];
  onSportToggle?: (sport: string) => void;
  variant?: 'display' | 'interactive';
  className?: string;
}

export function SportsBadges({ 
  selectedSports, 
  onSportToggle, 
  variant = 'display',
  className 
}: SportsBadgesProps) {
  if (variant === 'display') {
    return (
      <div className={`flex flex-wrap gap-1 ${className}`}>
        {selectedSports.map(sport => (
          <Badge key={sport} variant="secondary" className="text-xs capitalize">
            {sport.replace('_', ' ')}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 ${className}`}>
      {SPORTS_OPTIONS.map(sport => (
        <div key={sport} className="flex items-center space-x-2">
          <Checkbox
            id={sport}
            checked={selectedSports.includes(sport)}
            onCheckedChange={() => onSportToggle?.(sport)}
          />
          <Label htmlFor={sport} className="capitalize">
            {sport.replace('_', ' ')}
          </Label>
        </div>
      ))}
    </div>
  );
}