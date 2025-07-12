import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SportIcon, SportType } from './SportIcon';
import { MatchBadge } from './MatchBadge';
import { MessageSquare, MapPin, Calendar, Clock } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface SportStats {
  pace?: string;
  avgDistance?: string;
  preferredTime?: string;
}

interface MatchCardProps {
  id: string;
  name: string;
  age: number;
  location: string;
  distance: string;
  matchPercent: number;
  bio: string;
  imageUrl: string;
  sport: SportType;
  stats: SportStats;
  lastActive: string;
  onConnect: (id: string) => void;
  onMessage: (id: string) => void;
}

export function MatchCard({
  id,
  name,
  age,
  location,
  distance,
  matchPercent,
  bio,
  imageUrl,
  sport,
  stats,
  lastActive,
  onConnect,
  onMessage
}: MatchCardProps) {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  
  const handleCardInteraction = () => {
    if (isMobile && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };
  
  let matchAccentColor = 'from-match-low to-match-low/50';
  if (matchPercent >= 90) {
    matchAccentColor = 'from-match-high to-match-high/50';
  } else if (matchPercent >= 70) {
    matchAccentColor = 'from-match-medium to-match-medium/50';
  }
  
  const animationClasses = prefersReducedMotion 
    ? 'hover:shadow-card'
    : 'transition-all duration-150 hover:shadow-card-hover hover:scale-105';
  
  return (
    <Card 
      className={`relative overflow-hidden group ${animationClasses}`}
      onClick={handleCardInteraction}
    >
      <div 
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${matchAccentColor}`} 
        aria-hidden="true"
      />
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarImage src={imageUrl} alt={name} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-foreground">{name}, {age}</h3>
                <SportIcon sport={sport} />
              </div>
              <div className="flex items-center text-sm text-muted-foreground gap-1">
                <MapPin size={14} />
                <span>{location} • {distance} away</span>
              </div>
            </div>
          </div>
          <MatchBadge matchPercent={matchPercent} sport={sport} />
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-muted-foreground text-sm line-clamp-2">{bio}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {stats.pace && (
            <div className="rounded-md bg-muted px-2 py-1 flex items-center gap-1">
              <Clock size={14} className="text-activity-run" />
              <span className="text-foreground font-medium">Pace:</span> {stats.pace}
            </div>
          )}
          {stats.avgDistance && (
            <div className="rounded-md bg-muted px-2 py-1 flex items-center gap-1">
              <span className="text-foreground font-medium">Avg:</span> {stats.avgDistance}
            </div>
          )}
          {stats.preferredTime && (
            <div className="rounded-md bg-muted px-2 py-1 flex items-center gap-1">
              <Calendar size={14} className="text-primary" />
              <span>{stats.preferredTime}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="w-full flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Active {lastActive}</span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="group-hover:border-primary group-hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                onMessage(id);
              }}
            >
              <MessageSquare size={16} className="mr-1" />
              Message
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onConnect(id);
              }}
            >
              Connect
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
