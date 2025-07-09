import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { DAYS_OF_WEEK, TIME_SLOTS } from "@/constants";

interface AvailabilityPickerProps {
  availability: Record<string, string[]>;
  onAvailabilityToggle: (day: string, timeSlot: string) => void;
  className?: string;
}

export function AvailabilityPicker({ 
  availability, 
  onAvailabilityToggle, 
  className 
}: AvailabilityPickerProps) {
  return (
    <div className={className}>
      <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
        <Clock className="h-4 w-4" />
        When are you usually available?
      </Label>
      <div className="space-y-3">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="flex items-center space-x-4">
            <div className="w-20 capitalize font-medium">
              {day.slice(0, 3)}
            </div>
            <div className="flex gap-2">
              {TIME_SLOTS.map(timeSlot => (
                <div key={timeSlot} className="flex items-center space-x-1">
                  <Checkbox
                    id={`${day}-${timeSlot}`}
                    checked={availability[day]?.includes(timeSlot) || false}
                    onCheckedChange={() => onAvailabilityToggle(day, timeSlot)}
                  />
                  <Label htmlFor={`${day}-${timeSlot}`} className="capitalize text-sm">
                    {timeSlot}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}