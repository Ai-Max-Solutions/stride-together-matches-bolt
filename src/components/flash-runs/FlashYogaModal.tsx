import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, MapPin, Clock, Users, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFlashRuns } from '@/hooks/use-flash-runs';

const yogaFormSchema = z.object({
  sessionStyle: z.string().min(1, 'Please select a session style'),
  duration: z.string().min(1, 'Please select a duration'),
  startTime: z.string().min(1, 'Please select a start time'),
  meetingSpot: z.string().min(3, 'Please enter a meeting location'),
  notes: z.string().optional(),
});

type YogaFormData = z.infer<typeof yogaFormSchema>;

interface FlashYogaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sessionStyles = [
  { value: 'vinyasa-flow', label: 'Vinyasa Flow', description: 'Dynamic, breath-synchronized movement' },
  { value: 'yin-yoga', label: 'Yin Yoga', description: 'Passive poses held for longer periods' },
  { value: 'hatha', label: 'Hatha Yoga', description: 'Gentle, slower-paced practice' },
  { value: 'restorative', label: 'Restorative', description: 'Relaxing poses with props' },
  { value: 'stretch-mobility', label: 'Stretch & Mobility', description: 'Focus on flexibility and movement' },
  { value: 'meditation', label: 'Meditation', description: 'Primarily seated/lying practice' },
];

const durations = [
  { value: '30 min', label: '30 minutes', description: 'Quick lunch break session' },
  { value: '45 min', label: '45 minutes', description: 'Evening wind-down class' },
  { value: '60 min', label: '60 minutes', description: 'Standard full practice' },
  { value: '75 min', label: '75 minutes', description: 'Extended deep practice' },
];

export function FlashYogaModal({ open, onOpenChange }: FlashYogaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createFlashRun } = useFlashRuns();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<YogaFormData>({
    resolver: zodResolver(yogaFormSchema),
    defaultValues: {
      sessionStyle: '',
      duration: '60 min',
      startTime: '',
      meetingSpot: '',
      notes: '',
    }
  });

  const selectedStyle = watch('sessionStyle');
  const selectedDuration = watch('duration');

  // Set default start time to 30 minutes from now, minimum 15 minutes
  const getDefaultStartTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().slice(0, 16);
  };

  const getMinStartTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    return now.toISOString().slice(0, 16);
  };

  const onSubmit = async (data: YogaFormData) => {
    setIsSubmitting(true);

    try {
      const selectedStyleObj = sessionStyles.find(s => s.value === data.sessionStyle);
      const title = selectedStyleObj?.label || data.sessionStyle;

      const result = await createFlashRun({
        title,
        distance: data.duration,
        start_time: data.startTime,
        meeting_spot: data.meetingSpot,
        sport_type: 'yoga',
      });

      if (result) {
        reset();
        onOpenChange(false);
        toast({
          title: "🧘 Flash Yoga Created!",
          description: `Your peaceful ${data.duration} session is ready for participants.`,
        });
      }
    } catch (error) {
      console.error('Error creating yoga session:', error);
      toast({
        title: "Error",
        description: "Failed to create yoga session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-xl font-semibold">Create Flash Yoga 🧘</DialogTitle>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Session Style */}
          <div className="space-y-2">
            <Label htmlFor="sessionStyle" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Session Style
            </Label>
            <Select onValueChange={(value) => setValue('sessionStyle', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your yoga style" />
              </SelectTrigger>
              <SelectContent>
                {sessionStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{style.label}</span>
                      <span className="text-xs text-muted-foreground">{style.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sessionStyle && (
              <p className="text-sm text-destructive">{errors.sessionStyle.message}</p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duration
            </Label>
            <Select onValueChange={(value) => setValue('duration', value)} defaultValue="60 min">
              <SelectTrigger>
                <SelectValue placeholder="How long?" />
              </SelectTrigger>
              <SelectContent>
                {durations.map((duration) => (
                  <SelectItem key={duration.value} value={duration.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{duration.label}</span>
                      <span className="text-xs text-muted-foreground">{duration.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.duration && (
              <p className="text-sm text-destructive">{errors.duration.message}</p>
            )}
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <Label htmlFor="startTime" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Start Time
            </Label>
            <Input
              type="datetime-local"
              {...register('startTime')}
              defaultValue={getDefaultStartTime()}
              min={getMinStartTime()}
              className="w-full"
            />
            {errors.startTime && (
              <p className="text-sm text-destructive">{errors.startTime.message}</p>
            )}
          </div>

          {/* Meeting Spot */}
          <div className="space-y-2">
            <Label htmlFor="meetingSpot" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Quiet Location
            </Label>
            <Input
              {...register('meetingSpot')}
              placeholder="e.g., Central Park pavilion, Studio space..."
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              💡 Keep it general (exact location shared after joining)
            </p>
            {errors.meetingSpot && (
              <p className="text-sm text-destructive">{errors.meetingSpot.message}</p>
            )}
          </div>

          {/* Optional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Special Notes (Optional)
            </Label>
            <Textarea
              {...register('notes')}
              placeholder="Bring your own mat! Any props needed..."
              rows={2}
              className="w-full"
            />
          </div>

          {/* Summary */}
          {selectedStyle && selectedDuration && (
            <div className="p-3 bg-muted/50 rounded-lg border">
              <h4 className="font-medium text-sm mb-2">Session Summary:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>🧘 {sessionStyles.find(s => s.value === selectedStyle)?.label}</p>
                <p>⏱️ {durations.find(d => d.value === selectedDuration)?.label}</p>
                <p>👥 Max 8 participants</p>
                <p>📱 Auto-expires 75 minutes after start</p>
              </div>
            </div>
          )}

          {/* Mat Reminder */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              🧘‍♀️ <strong>Reminder:</strong> Participants will be reminded to bring their own mats!
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Creating...' : 'Create Session 🧘'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}