import React from 'react';
import { Activity, Bike, Dumbbell, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SportType = 'run' | 'cycle' | 'workout' | 'yoga';

interface SportIconProps {
  sport: SportType;
  size?: number;
  className?: string;
  withBackground?: boolean;
}

export function SportIcon({ 
  sport, 
  size = 20, 
  className = '',
  withBackground = false 
}: SportIconProps) {
  const iconMap = {
    run: Activity,
    cycle: Bike,
    workout: Dumbbell,
    yoga: Heart
  };

  const Icon = iconMap[sport];
  const sportColors = {
    run: 'text-activity-run',
    cycle: 'text-activity-cycle',
    workout: 'text-activity-workout',
    yoga: 'text-activity-yoga'
  };
  
  const bgColors = {
    run: 'bg-activity-run/10',
    cycle: 'bg-activity-cycle/10',
    workout: 'bg-activity-workout/10',
    yoga: 'bg-activity-yoga/10'
  };

  if (!withBackground) {
    return <Icon size={size} className={cn(sportColors[sport], className)} />;
  }
  
  return (
    <div className={cn(
      'flex items-center justify-center rounded-full p-2',
      bgColors[sport],
      className
    )}>
      <Icon size={size} className={sportColors[sport]} />
    </div>
  );
}
