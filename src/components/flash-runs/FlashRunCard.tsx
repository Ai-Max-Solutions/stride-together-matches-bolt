import { useState } from 'react';
import { Clock, MapPin, Users, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ConfettiEffect } from '@/components/common/ConfettiEffect';
import { FlashRun } from '@/hooks/use-flash-runs';

interface FlashRunCardProps {
  flashRun: FlashRun;
  onJoin: (flashRunId: string) => Promise<boolean>;
  onLeave: (flashRunId: string) => Promise<boolean>;
}

export function FlashRunCard({ flashRun, onJoin, onLeave }: FlashRunCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const getTimeRemaining = () => {
    const now = new Date();
    const startTime = new Date(flashRun.start_time);
    const diffMs = startTime.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins <= 0) return 'Starting now!';
    if (diffMins < 60) return `${diffMins}m`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getPaceIcon = (pace: string) => {
    switch (pace.toLowerCase()) {
      case 'easy': return '🚶';
      case 'moderate': return '🏃';
      case 'fast': return '💨';
      case 'race': return '🏆';
      default: return '🏃';
    }
  };

  const handleJoinLeave = async () => {
    setIsLoading(true);
    try {
      if (flashRun.is_participant) {
        await onLeave(flashRun.id);
      } else {
        const success = await onJoin(flashRun.id);
        if (success) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 1200);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const participantAvatars = flashRun.participants?.slice(0, 3) || [];
  const extraCount = (flashRun.participant_count || 0) - 3;

  return (
    <Card className="relative overflow-hidden border-l-4 border-l-primary bg-gradient-to-r from-background to-accent/5 hover:shadow-lg transition-all duration-200">
      <ConfettiEffect isActive={showConfetti} />
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={flashRun.creator?.profile_picture_url} />
                <AvatarFallback className="text-xs">
                  {flashRun.creator?.full_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {flashRun.creator?.full_name || 'Anonymous'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {flashRun.title}
                </p>
              </div>
            </div>

            {/* Activity Details */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">
                <Activity className="w-3 h-3 mr-1" />
                {flashRun.distance}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getPaceIcon(flashRun.pace)} {flashRun.pace} pace
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {getTimeRemaining()}
              </Badge>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 mb-3">
              <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {flashRun.meeting_spot}
              </span>
            </div>

            {/* Participants */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {participantAvatars.map((participant, index) => (
                    <Avatar key={participant.id} className="h-6 w-6 border-2 border-background">
                      <AvatarImage src={participant.user?.profile_picture_url} />
                      <AvatarFallback className="text-xs">
                        {participant.user?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {extraCount > 0 && (
                    <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-xs font-medium">+{extraCount}</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  <Users className="w-3 h-3 inline mr-1" />
                  {flashRun.participant_count || 0}/{flashRun.max_participants}
                </span>
              </div>
            </div>
          </div>

          {/* Join/Leave Button */}
          <Button
            size="sm"
            variant={flashRun.is_participant ? "outline" : "default"}
            onClick={handleJoinLeave}
            disabled={isLoading || (!flashRun.is_participant && (flashRun.participant_count || 0) >= flashRun.max_participants)}
            className="flex-shrink-0"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : flashRun.is_participant ? (
              'Leave'
            ) : (flashRun.participant_count || 0) >= flashRun.max_participants ? (
              'Full'
            ) : (
              'Join'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}