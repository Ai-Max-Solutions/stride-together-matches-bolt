import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Zap } from 'lucide-react';

interface FlashRideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateFlashRide: (data: {
    title: string;
    distance: string;
    average_speed: string;
    start_time: string;
    meeting_spot: string;
    sport_type: string;
    route_type: string;
    meeting_coordinates?: {
      lat: number;
      lng: number;
    };
  }) => Promise<any>;
}

const DISTANCE_OPTIONS = [
  { value: '10', label: '10 km' },
  { value: '20', label: '20 km' },
  { value: '40', label: '40 km' },
  { value: '60', label: '60 km' },
  { value: '100', label: '100 km' },
  { value: 'custom', label: 'Custom' },
];

const SPEED_OPTIONS = [
  { value: '15', label: '15 km/h (Leisure)' },
  { value: '20', label: '20 km/h (Easy)' },
  { value: '25', label: '25 km/h (Moderate)' },
  { value: '30', label: '30 km/h (Fast)' },
  { value: '35', label: '35+ km/h (Race)' },
];

const ROUTE_TYPES = [
  { value: 'road', label: 'Road 🛣️', emoji: '🛣️' },
  { value: 'gravel', label: 'Gravel 🗻', emoji: '🗻' },
  { value: 'mixed', label: 'Mixed 🌊', emoji: '🌊' },
];

export function FlashRideModal({ open, onOpenChange, onCreateFlashRide }: FlashRideModalProps) {
  const [title, setTitle] = useState('');
  const [distance, setDistance] = useState('');
  const [customDistance, setCustomDistance] = useState('');
  const [averageSpeed, setAverageSpeed] = useState('');
  const [routeType, setRouteType] = useState('road');
  const [meetingSpot, setMeetingSpot] = useState('');
  const [startTime, setStartTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default start time (45 minutes from now)
  useEffect(() => {
    if (open) {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 45);
      setStartTime(now.toISOString().slice(0, 16));
    }
  }, [open]);

  // Get minimum time (15 minutes from now)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !distance || !averageSpeed || !meetingSpot || !startTime) return;

    setIsSubmitting(true);
    try {
      const finalDistance = distance === 'custom' ? customDistance : distance;
      
      await onCreateFlashRide({
        title,
        distance: finalDistance + ' km',
        average_speed: averageSpeed + ' km/h',
        start_time: startTime,
        meeting_spot: meetingSpot,
        sport_type: 'cycling',
        route_type: routeType,
      });

      // Reset form
      setTitle('');
      setDistance('');
      setCustomDistance('');
      setAverageSpeed('');
      setRouteType('road');
      setMeetingSpot('');
      setStartTime('');
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating Flash Ride:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRouteType = ROUTE_TYPES.find(type => type.value === routeType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            🚴 Create Flash Ride
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Ride Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Morning ride around the lake"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Distance</Label>
              <Select value={distance} onValueChange={setDistance} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select distance" />
                </SelectTrigger>
                <SelectContent>
                  {DISTANCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {distance === 'custom' && (
                <Input
                  value={customDistance}
                  onChange={(e) => setCustomDistance(e.target.value)}
                  placeholder="Enter km"
                  type="number"
                  min="1"
                  max="300"
                  required
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Average Speed</Label>
              <Select value={averageSpeed} onValueChange={setAverageSpeed} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select speed" />
                </SelectTrigger>
                <SelectContent>
                  {SPEED_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Route Type</Label>
            <div className="flex gap-2">
              {ROUTE_TYPES.map((type) => (
                <Badge
                  key={type.value}
                  variant={routeType === type.value ? "default" : "outline"}
                  className="cursor-pointer px-3 py-2 text-sm"
                  onClick={() => setRouteType(type.value)}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting-spot" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Meeting Spot
            </Label>
            <Input
              id="meeting-spot"
              value={meetingSpot}
              onChange={(e) => setMeetingSpot(e.target.value)}
              placeholder="Central Park entrance"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Start Time
            </Label>
            <Input
              id="start-time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              min={getMinDateTime()}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title || !distance || !averageSpeed || !meetingSpot || !startTime}
              className="flex-1"
            >
              {isSubmitting ? 'Creating...' : 'Create Ride 🚴'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}