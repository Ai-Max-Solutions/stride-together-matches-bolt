import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Medal, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { BrandedChallenge, useChallengeLeaderboard } from '@/hooks/use-branded-challenges';
import { cn } from '@/lib/utils';

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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            {rank}
          </div>
        );
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      const colors = {
        1: 'bg-yellow-500 text-white',
        2: 'bg-gray-400 text-white', 
        3: 'bg-amber-600 text-white'
      };
      return (
        <Badge className={colors[rank as keyof typeof colors]}>
          #{rank}
        </Badge>
      );
    }
    return <Badge variant="outline">#{rank}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={challenge.brand_logo_url} alt={challenge.brand_name} />
              <AvatarFallback>{challenge.brand_name[0]}</AvatarFallback>
            </Avatar>
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                  <div className="h-6 w-12 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
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
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No participants yet</p>
            <p className="text-sm">Be the first to join this challenge!</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.user_id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    index < 3 
                      ? "bg-gradient-to-r from-primary/5 to-transparent border-primary/20" 
                      : "bg-muted/20 hover:bg-muted/40",
                    entry.is_completed && "ring-2 ring-green-500/20 bg-green-50/50"
                  )}
                >
                  {/* Rank */}
                  <div className="flex items-center gap-2">
                    {getRankIcon(entry.rank)}
                    {getRankBadge(entry.rank)}
                  </div>

                  {/* User Info */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.profile_picture_url} />
                    <AvatarFallback>
                      {entry.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{entry.full_name}</p>
                      {entry.is_completed && (
                        <Badge className="bg-green-500 text-white text-xs">
                          ✓ Completed
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{entry.current_distance.toFixed(1)} km</span>
                      <span>•</span>
                      <span>{entry.total_activities} activities</span>
                    </div>
                    
                    {/* Progress Bar for mobile */}
                    <div className="mt-1 md:hidden">
                      <Progress 
                        value={entry.progress_percentage} 
                        className="h-1.5"
                      />
                    </div>
                  </div>

                  {/* Progress - Hidden on mobile */}
                  <div className="hidden md:flex flex-col items-end gap-1 min-w-[100px]">
                    <span className="text-sm font-medium">
                      {entry.progress_percentage}%
                    </span>
                    <Progress 
                      value={entry.progress_percentage} 
                      className="w-20 h-2"
                    />
                  </div>
                </div>
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