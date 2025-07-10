import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Target, Trophy, Gift, Users } from 'lucide-react';
import { BrandedChallenge } from '@/hooks/use-branded-challenges';
import { formatDistanceToNow } from 'date-fns';

interface BrandedChallengeCardProps {
  challenge: BrandedChallenge;
  onJoin: (challengeId: string) => Promise<boolean>;
  onViewLeaderboard: (challenge: BrandedChallenge) => void;
  onUpdateProgress?: (challengeId: string) => void;
}

export function BrandedChallengeCard({ 
  challenge, 
  onJoin, 
  onViewLeaderboard,
  onUpdateProgress 
}: BrandedChallengeCardProps) {
  const [isJoining, setIsJoining] = useState(false);
  
  const { user_progress } = challenge;
  const isParticipating = user_progress?.is_participating || false;
  const isCompleted = user_progress?.is_completed || false;
  const progress = user_progress?.progress_percentage || 0;
  const currentDistance = user_progress?.current_distance || 0;

  const handleJoin = async () => {
    setIsJoining(true);
    await onJoin(challenge.id);
    setIsJoining(false);
  };

  const getStatusBadge = () => {
    if (isCompleted) {
      return <Badge className="bg-green-500 text-white">Completed ✓</Badge>;
    }
    if (isParticipating) {
      return <Badge variant="secondary">Participating</Badge>;
    }
    return <Badge variant="outline">Available</Badge>;
  };

  const timeRemaining = formatDistanceToNow(new Date(challenge.ends_at), { addSuffix: true });

  return (
    <Card className="overflow-hidden hover-scale group">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2">
              <AvatarImage 
                src={challenge.brand_logo_url} 
                alt={challenge.brand_name}
                className="object-contain p-1"
              />
              <AvatarFallback>{challenge.brand_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {challenge.title}
              </h3>
              <p className="text-sm text-muted-foreground">{challenge.brand_name}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {challenge.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Challenge Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-primary" />
            <span>{challenge.target_distance} km</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span>{challenge.points_reward} points</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span>Ends {timeRemaining}</span>
          </div>
          {challenge.coupon_code && (
            <div className="flex items-center gap-2 text-sm">
              <Gift className="h-4 w-4 text-purple-500" />
              <span>Coupon included</span>
            </div>
          )}
        </div>

        {/* Progress Section */}
        {isParticipating && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {currentDistance.toFixed(1)} / {challenge.target_distance} km
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {progress}% complete
            </p>
          </div>
        )}

        {/* Completed State with Coupon */}
        {isCompleted && challenge.coupon_code && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200 space-y-2">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Reward Unlocked!</span>
            </div>
            <p className="text-xs text-green-700">
              Coupon Code: <span className="font-mono font-bold">{challenge.coupon_code}</span>
            </p>
            {challenge.coupon_url && (
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full border-green-300 text-green-700 hover:bg-green-100"
                onClick={() => window.open(challenge.coupon_url, '_blank')}
              >
                Redeem Coupon
              </Button>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        {!isParticipating ? (
          <Button 
            onClick={handleJoin}
            disabled={isJoining}
            className="flex-1"
          >
            {isJoining ? 'Joining...' : 'Join Challenge'}
          </Button>
        ) : (
          <>
            {onUpdateProgress && !isCompleted && (
              <Button 
                variant="outline" 
                onClick={() => onUpdateProgress(challenge.id)}
                className="flex-1"
              >
                Log Activity
              </Button>
            )}
            <Button 
              variant="secondary" 
              onClick={() => onViewLeaderboard(challenge)}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-1" />
              Leaderboard
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}