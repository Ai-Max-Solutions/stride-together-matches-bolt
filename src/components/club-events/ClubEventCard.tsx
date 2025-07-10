import { format } from 'date-fns';
import { Calendar, MapPin, Users, Target, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ClubEvent } from '@/types/club-events';

interface ClubEventCardProps {
  event: ClubEvent;
  onJoin: (eventId: string) => void;
  onLeave: (eventId: string) => void;
  loading?: boolean;
}

export const ClubEventCard = ({ event, onJoin, onLeave, loading }: ClubEventCardProps) => {
  const eventDate = new Date(event.event_date);
  const isEventFull = (event.participant_count || 0) >= event.max_participants;
  
  const organizationInitials = event.organization?.name
    ?.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase() || 'ORG';

  return (
    <Card className="w-full">
      <CardHeader className="space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={event.organization?.logo_url} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {organizationInitials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                {event.organization?.name}
              </span>
              {event.organization?.verification_status === 'verified' && (
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(eventDate, 'MMM dd, HH:mm')}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{event.distance}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{event.meeting_point}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{event.participant_count || 0}/{event.max_participants}</span>
          </div>
        </div>

        {event.cause_description && (
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md">
            <Target className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              {event.cause_description}
            </p>
          </div>
        )}

        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}
      </CardContent>

      <CardFooter>
        {event.is_joined ? (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => onLeave(event.id)}
            disabled={loading}
          >
            Leave Event
          </Button>
        ) : (
          <Button 
            className="w-full"
            onClick={() => onJoin(event.id)}
            disabled={loading || isEventFull}
          >
            {isEventFull ? 'Event Full' : 'Join Event'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};