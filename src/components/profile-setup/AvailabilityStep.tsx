import { Label } from '@/components/ui/label';
import { AvailabilityPicker } from '@/components/common/availability-picker';
import { Clock } from 'lucide-react';

interface AvailabilityStepProps {
  data: {
    availability: Record<string, string[]>;
  };
  onChange: (updates: any) => void;
}

export function AvailabilityStep({ data, onChange }: AvailabilityStepProps) {
  const handleAvailabilityToggle = (day: string, timeSlot: string) => {
    const currentSlots = data.availability[day] || [];
    const newSlots = currentSlots.includes(timeSlot)
      ? currentSlots.filter(t => t !== timeSlot)
      : [...currentSlots, timeSlot];
    
    onChange({
      availability: {
        ...data.availability,
        [day]: newSlots
      }
    });
  };

  const getTotalSlots = () => {
    return Object.values(data.availability).flat().length;
  };

  const getMostAvailableDay = () => {
    let maxSlots = 0;
    let bestDay = '';
    
    Object.entries(data.availability).forEach(([day, slots]) => {
      if (slots.length > maxSlots) {
        maxSlots = slots.length;
        bestDay = day;
      }
    });
    
    return bestDay ? bestDay.charAt(0).toUpperCase() + bestDay.slice(1) : 'None';
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
          <Clock className="h-4 w-4" />
          When are you usually available?
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Select the times when you're typically free for workouts. This helps us suggest compatible partners.
        </p>
      </div>

      <AvailabilityPicker
        availability={data.availability}
        onAvailabilityToggle={handleAvailabilityToggle}
      />

      {getTotalSlots() > 0 && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Your Availability Summary:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total time slots:</span>
              <span className="font-medium ml-2">{getTotalSlots()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Most available:</span>
              <span className="font-medium ml-2">{getMostAvailableDay()}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-semibold text-sm mb-2">Availability Tips:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Select your typical free time - you can always adjust later</li>
          <li>• More availability means more potential matches</li>
          <li>• Morning: 6AM-12PM, Afternoon: 12PM-6PM, Evening: 6PM-10PM</li>
          <li>• Don't worry about being too specific - this is just for matching</li>
        </ul>
      </div>
    </div>
  );
}