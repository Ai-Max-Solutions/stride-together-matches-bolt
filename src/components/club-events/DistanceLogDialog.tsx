import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { ClubEvent } from '@/types/club-events';

interface DistanceLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ClubEvent | null;
  onLogDistance: (distance: number) => void;
  loading?: boolean;
}

export const DistanceLogDialog = ({
  open,
  onOpenChange,
  event,
  onLogDistance,
  loading = false,
}: DistanceLogDialogProps) => {
  const [distance, setDistance] = useState([5.0]);

  const handleSubmit = () => {
    onLogDistance(distance[0]);
    onOpenChange(false);
  };

  const handleDistanceChange = (value: number[]) => {
    setDistance(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setDistance([Math.max(0, Math.min(50, value))]);
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Your Distance</DialogTitle>
          <DialogDescription>
            How far did you run in the "{event.title}" event?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="distance">Distance (km)</Label>
            <div className="space-y-4">
              <Slider
                value={distance}
                onValueChange={handleDistanceChange}
                max={50}
                min={0}
                step={0.1}
                className="w-full"
              />
              <Input
                id="distance"
                type="number"
                value={distance[0]}
                onChange={handleInputChange}
                min={0}
                max={50}
                step={0.1}
                className="text-center text-lg font-medium"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {distance[0]} km for {event.organization?.name}
            </p>
          </div>

          {event.cause_description && (
            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>Supporting:</strong> {event.cause_description}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || distance[0] <= 0}
          >
            {loading ? 'Logging...' : 'Log Distance'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};