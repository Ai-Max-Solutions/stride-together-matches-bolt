import React from 'react';
import { cn } from '@/lib/utils';
import { SportType } from './SportIcon';

interface MatchBadgeProps {
  matchPercent: number;
  sport: SportType;
  className?: string;
}

export function MatchBadge({ 
  matchPercent, 
  sport, 
  className 
}: MatchBadgeProps) {
  let matchLevel = 'low';
  if (matchPercent >= 90) matchLevel = 'high';
  else if (matchPercent >= 70) matchLevel = 'medium';

  const matchColors = {
    high: 'bg-match-high text-text-inverse',
    medium: 'bg-match-medium text-text-primary',
    low: 'bg-match-low text-text-inverse',
  };

  const sportDisplay = {
    run: 'Running Buddy',
    cycle: 'Ride Partner',
    workout: 'Workout Partner',
    yoga: 'Yoga Partner'
  }[sport];

  return (
    <div className={cn(
      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
      matchColors[matchLevel as keyof typeof matchColors],
      className
    )}>
      {sportDisplay} {matchPercent}%
    </div>
  );
}
