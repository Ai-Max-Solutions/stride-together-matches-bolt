import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BrandedChallenge, useChallengeLeaderboard } from '@/hooks/use-branded-challenges';
import { LeaderboardLoading } from './LeaderboardLoading';
import { LeaderboardEntry } from './LeaderboardEntry';
import { EmptyLeaderboard } from './EmptyLeaderboard';

interface ChallengeLeaderboardProps {
  challenge: BrandedChallenge;
}

export function ChallengeLeaderboard({ challenge }: ChallengeLeaderboardProps) {
  const { 
    leaderboard, 
    loading, 
    showAll, 
    setShowAll, 
    hasMore 
  } = useChallengeLeaderboard(challenge.id);

  if (loading) {
    return <LeaderboardLoading challenge={challenge} />;
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={challenge.brand_logo_url} 
              alt={challenge.brand_name}
              className="object-contain p-1"
            />
            <AvatarFallback>{challenge.brand_name[0]}</AvatarFallback>
          </Avatar>
          {challenge.title} - Leaderboard
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Target: {challenge.target_distance} km • {leaderboard.length} participants
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {leaderboard.length === 0 ? (
          <EmptyLeaderboard />
        ) : (
          <>
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <LeaderboardEntry
                  key={entry.user_id}
                  entry={entry}
                  index={index}
                />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowAll(!showAll)}
                  className="gap-2"
                >
                  {showAll ? (
                    <>
                      Show Top 10
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      View All Participants
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}