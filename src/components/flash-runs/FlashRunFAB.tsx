import { Zap, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMobileDetection } from '@/hooks/use-mobile-detection';

interface FlashRunFABProps {
  onClick: () => void;
  sportType?: string;
}

export function FlashRunFAB({ onClick, sportType = 'running' }: FlashRunFABProps) {
  const { isMobile } = useMobileDetection();
  
  const isCycling = sportType === 'cycling';
  const isWorkout = sportType === 'workout';
  
  const getLabel = () => {
    if (isWorkout) return 'Create Flash Workout';
    if (isCycling) return 'Create Flash Ride';
    return 'Create Flash Run';
  };
  
  const label = getLabel();

  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary group z-40"
      aria-label={label}
      title={label}
    >
      {isWorkout ? (
        <Dumbbell className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
      ) : isCycling ? (
        <span className="text-xl group-hover:scale-110 transition-transform duration-200">🚴</span>
      ) : (
        <Zap className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
      )}
      <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
    </Button>
  );
}