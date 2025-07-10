import { useState } from 'react';
import { X, MapPin, Clock, Dumbbell, Timer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface FlashWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    distance: string; // repurposed as duration
    pace: string; // repurposed as difficulty
    start_time: string;
    meeting_spot: string;
    meeting_coordinates?: { lat: number; lng: number };
  }) => Promise<boolean>;
}

const WORKOUT_TYPE_OPTIONS = [
  { value: 'Upper-body Strength', label: '💪 Upper-body Strength', description: 'Arms, chest, shoulders' },
  { value: 'Full-body HIIT', label: '🔥 Full-body HIIT', description: 'High-intensity intervals' },
  { value: 'Core & Abs', label: '🎯 Core & Abs', description: 'Core strengthening' },
  { value: 'Circuit Training', label: '⚡ Circuit Training', description: 'Mixed strength & cardio' },
  { value: 'Cardio Blast', label: '💨 Cardio Blast', description: 'Heart-pumping cardio' }
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: '🟢 Easy', description: 'Beginner friendly' },
  { value: 'moderate', label: '🟡 Moderate', description: 'Intermediate level' },
  { value: 'hard', label: '🔴 Hard', description: 'Advanced challenge' }
];

const DURATION_OPTIONS = [
  { value: '30 min', label: '30 minutes' },
  { value: '45 min', label: '45 minutes' },
  { value: '60 min', label: '60 minutes' },
  { value: '90 min', label: '90 minutes' }
];

const TIME_OPTIONS = [
  { value: 10, label: 'In 10 minutes' },
  { value: 15, label: 'In 15 minutes' },
  { value: 30, label: 'In 30 minutes' },
  { value: 45, label: 'In 45 minutes' },
  { value: 60, label: 'In 1 hour' }
];

export function FlashWorkoutModal({ isOpen, onClose, onSubmit }: FlashWorkoutModalProps) {
  const [formData, setFormData] = useState({
    workoutType: '',
    difficulty: '',
    duration: '',
    startMinutes: 30,
    meeting_spot: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.workoutType || !formData.difficulty || !formData.duration || !formData.meeting_spot) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const startTime = new Date();
    startTime.setMinutes(startTime.getMinutes() + formData.startMinutes);

    try {
      const success = await onSubmit({
        title: formData.workoutType,
        distance: formData.duration, // repurposed as duration
        pace: formData.difficulty, // repurposed as difficulty
        start_time: startTime.toISOString(),
        meeting_spot: formData.meeting_spot
      });

      if (success) {
        setFormData({
          workoutType: '',
          difficulty: '',
          duration: '',
          startMinutes: 30,
          meeting_spot: ''
        });
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            Create Flash Workout
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Workout Type */}
          <div className="space-y-2">
            <Label>
              <Dumbbell className="inline h-4 w-4 mr-1" />
              Workout Type *
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {WORKOUT_TYPE_OPTIONS.map(option => (
                <Button
                  key={option.value}
                  type="button"
                  variant={formData.workoutType === option.value ? "default" : "outline"}
                  className="h-auto p-3 text-left justify-start"
                  onClick={() => setFormData(prev => ({ ...prev, workoutType: option.value }))}
                >
                  <div>
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label>Difficulty *</Label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTY_OPTIONS.map(option => (
                <Button
                  key={option.value}
                  type="button"
                  variant={formData.difficulty === option.value ? "default" : "outline"}
                  className="h-auto p-3 text-center"
                  onClick={() => setFormData(prev => ({ ...prev, difficulty: option.value }))}
                >
                  <div>
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>
              <Timer className="inline h-4 w-4 mr-1" />
              Duration *
            </Label>
            <Select
              value={formData.duration}
              onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <Label>
              <Clock className="inline h-4 w-4 mr-1" />
              Starts
            </Label>
            <Select
              value={formData.startMinutes.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, startMinutes: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Meeting Spot */}
          <div className="space-y-2">
            <Label htmlFor="meeting_spot">
              <MapPin className="inline h-4 w-4 mr-1" />
              Location *
            </Label>
            <Input
              id="meeting_spot"
              placeholder="e.g., FitLife Gym, Central Park, Community Center..."
              value={formData.meeting_spot}
              onChange={(e) => setFormData(prev => ({ ...prev, meeting_spot: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              🔒 Exact address will be shared only with participants
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Dumbbell className="w-4 h-4 mr-2" />
              )}
              Create Flash Workout
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}