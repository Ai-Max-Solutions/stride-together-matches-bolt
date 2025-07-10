import { useState } from 'react';
import { X, MapPin, Clock, Activity, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface FlashRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    distance: string;
    pace: string;
    start_time: string;
    meeting_spot: string;
    meeting_coordinates?: { lat: number; lng: number };
  }) => Promise<boolean>;
}

const DISTANCE_OPTIONS = [
  { value: '1K', label: '1 Kilometer' },
  { value: '3K', label: '3 Kilometers' },
  { value: '5K', label: '5 Kilometers' },
  { value: '10K', label: '10 Kilometers' },
  { value: '5 miles', label: '5 Miles' },
  { value: 'Custom', label: 'Custom Distance' }
];

const PACE_OPTIONS = [
  { value: 'easy', label: '🚶 Easy Pace', description: 'Conversational, relaxed' },
  { value: 'moderate', label: '🏃 Moderate Pace', description: 'Comfortably hard' },
  { value: 'fast', label: '💨 Fast Pace', description: 'Challenging pace' },
  { value: 'race', label: '🏆 Race Pace', description: 'All-out effort' }
];

const TIME_OPTIONS = [
  { value: 15, label: 'In 15 minutes' },
  { value: 30, label: 'In 30 minutes' },
  { value: 45, label: 'In 45 minutes' },
  { value: 60, label: 'In 1 hour' }
];

export function FlashRunModal({ isOpen, onClose, onSubmit }: FlashRunModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    distance: '',
    pace: '',
    startMinutes: 30,
    meeting_spot: '',
    customDistance: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.distance || !formData.pace || !formData.meeting_spot) {
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

    const distance = formData.distance === 'Custom' ? formData.customDistance : formData.distance;
    const title = formData.title || `${distance} ${formData.pace} run`;

    try {
      const success = await onSubmit({
        title,
        distance,
        pace: formData.pace,
        start_time: startTime.toISOString(),
        meeting_spot: formData.meeting_spot
      });

      if (success) {
        setFormData({
          title: '',
          distance: '',
          pace: '',
          startMinutes: 30,
          meeting_spot: '',
          customDistance: ''
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
            <Zap className="h-5 w-5 text-primary" />
            Create Flash Run
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="title">Run Title (Optional)</Label>
            <Input
              id="title"
              placeholder="e.g., Quick morning loop, Hill sprints..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          {/* Distance */}
          <div className="space-y-2">
            <Label htmlFor="distance">
              <Activity className="inline h-4 w-4 mr-1" />
              Distance *
            </Label>
            <Select
              value={formData.distance}
              onValueChange={(value) => setFormData(prev => ({ ...prev, distance: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select distance" />
              </SelectTrigger>
              <SelectContent>
                {DISTANCE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {formData.distance === 'Custom' && (
              <Input
                placeholder="Enter custom distance"
                value={formData.customDistance}
                onChange={(e) => setFormData(prev => ({ ...prev, customDistance: e.target.value }))}
              />
            )}
          </div>

          {/* Pace */}
          <div className="space-y-2">
            <Label>Pace *</Label>
            <div className="grid grid-cols-2 gap-2">
              {PACE_OPTIONS.map(option => (
                <Button
                  key={option.value}
                  type="button"
                  variant={formData.pace === option.value ? "default" : "outline"}
                  className="h-auto p-3 text-left"
                  onClick={() => setFormData(prev => ({ ...prev, pace: option.value }))}
                >
                  <div>
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </Button>
              ))}
            </div>
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
              Meeting Spot *
            </Label>
            <Input
              id="meeting_spot"
              placeholder="e.g., Central Park main entrance, City Hall steps..."
              value={formData.meeting_spot}
              onChange={(e) => setFormData(prev => ({ ...prev, meeting_spot: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Choose a well-known, public location for safety
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
                <Zap className="w-4 h-4 mr-2" />
              )}
              Create Flash Run
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}