import { useState } from 'react';
import { Plus, Calendar, MapPin, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface CreateEventDialogProps {
  onCreateEvent: (eventData: any) => Promise<boolean>;
  loading: boolean;
}

export function CreateEventDialog({ onCreateEvent, loading }: CreateEventDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    organization_id: '',
    title: '',
    description: '',
    event_date: '',
    distance: '',
    meeting_point: '',
    max_participants: 50,
    cause_description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.organization_id || !formData.title || !formData.event_date || !formData.distance || !formData.meeting_point) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const success = await onCreateEvent(formData);
    if (success) {
      setOpen(false);
      setFormData({
        organization_id: '',
        title: '',
        description: '',
        event_date: '',
        distance: '',
        meeting_point: '',
        max_participants: 50,
        cause_description: '',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Create Club/Charity Event
          </DialogTitle>
          <DialogDescription>
            Create a new event for your verified organization. Events help bring people together for running and charity causes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organization">Organization *</Label>
              <Select value={formData.organization_id} onValueChange={(value) => setFormData(prev => ({ ...prev, organization_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sample-org-1">Sample Running Club</SelectItem>
                  <SelectItem value="sample-org-2">Sample Charity Foundation</SelectItem>
                  <SelectItem value="sample-org-3">Local Community Group</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance">Distance *</Label>
              <Select value={formData.distance} onValueChange={(value) => setFormData(prev => ({ ...prev, distance: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5K">5K</SelectItem>
                  <SelectItem value="10K">10K</SelectItem>
                  <SelectItem value="Half Marathon">Half Marathon</SelectItem>
                  <SelectItem value="Marathon">Marathon</SelectItem>
                  <SelectItem value="Custom">Custom Distance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Charity 5K for Children's Hospital"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Event Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your event, what to expect, and any special details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">Date & Time *</Label>
              <Input
                id="event_date"
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_participants">Max Participants</Label>
              <Input
                id="max_participants"
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) || 50 }))}
                min={1}
                max={1000}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting_point">Meeting Point *</Label>
            <Input
              id="meeting_point"
              value={formData.meeting_point}
              onChange={(e) => setFormData(prev => ({ ...prev, meeting_point: e.target.value }))}
              placeholder="e.g., Central Park Main Entrance, New York"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cause_description">Charity Cause (if applicable)</Label>
            <Textarea
              id="cause_description"
              value={formData.cause_description}
              onChange={(e) => setFormData(prev => ({ ...prev, cause_description: e.target.value }))}
              placeholder="Describe the charity cause this event supports..."
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}