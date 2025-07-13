import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy,
  Medal,
  Award,
  Crown,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  Calendar,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  previousRank?: number;
  athlete: {
    id: string;
    name: string;
    avatar?: string;
    location: string;
    isVerified: boolean;
  };
  score: number;
  metric: string; // e.g., "distance", "time", "points"
  metricValue: string; // formatted display value
  change: number; // position change
  joinedDate: string;
}

interface Competition {
  id: string;
  title: string;
  description: string;
  type: 'distance' | 'time' | 'points' | 'pace';
  sport: string;
  duration: string;
  participantCount: number;
  prize?: string;
  endDate: string;
  isActive: boolean;
}

interface LeaderboardCardProps {
  competition: Competition;
  entries: LeaderboardEntry[];
  currentUserRank?: number;
  className?: string;
  onJoinCompetition?: (competitionId: string) => void;
  onViewProfile?: (athleteId: string) => void;
}

export const LeaderboardCard = ({ 
  competition, 
  entries, 
  currentUserRank,
  className,
  onJoinCompetition,
  onViewProfile
}: LeaderboardCardProps) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
      case 3: return 'bg-gradient-to-r from-amber-400 to-amber-500 text-white';
      default: return 'bg-muted';
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return null;
  };

  const getCompetitionTypeColor = (type: string) => {
    switch (type) {
      case 'distance': return 'bg-blue-100 text-blue-800';
      case 'time': return 'bg-green-100 text-green-800';
      case 'points': return 'bg-purple-100 text-purple-800';
      case 'pace': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold mb-2">{competition.title}</CardTitle>
            <p className="text-sm text-muted-foreground mb-3">{competition.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={getCompetitionTypeColor(competition.type)}>
                {competition.type.charAt(0).toUpperCase() + competition.type.slice(1)}
              </Badge>
              <Badge variant="outline">{competition.sport}</Badge>
              {competition.prize && (
                <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white">
                  <Trophy className="h-3 w-3 mr-1" />
                  {competition.prize}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{competition.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{competition.participantCount} athletes</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Ends {competition.endDate}</span>
              </div>
            </div>
          </div>
          
          {competition.isActive && (
            <Button 
              className="ml-4"
              onClick={() => onJoinCompetition?.(competition.id)}
            >
              Join Competition
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Current User Rank (if participating) */}
        {currentUserRank && (
          <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary">Your Position</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">#{currentUserRank}</span>
                {getRankIcon(currentUserRank)}
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Entries */}
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.athlete.id}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-muted/50 cursor-pointer",
                getRankStyle(entry.rank)
              )}
              onClick={() => onViewProfile?.(entry.athlete.id)}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-8">
                {getRankIcon(entry.rank)}
              </div>

              {/* Athlete Info */}
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.athlete.avatar} />
                  <AvatarFallback className="text-xs">
                    {entry.athlete.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-medium truncate",
                      entry.rank <= 3 ? "text-white" : "text-foreground"
                    )}>
                      {entry.athlete.name}
                    </span>
                    {entry.athlete.isVerified && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        ✓
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className={cn(
                      "h-3 w-3",
                      entry.rank <= 3 ? "text-white/80" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-xs truncate",
                      entry.rank <= 3 ? "text-white/80" : "text-muted-foreground"
                    )}>
                      {entry.athlete.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div className="text-right">
                <div className={cn(
                  "font-bold",
                  entry.rank <= 3 ? "text-white" : "text-foreground"
                )}>
                  {entry.metricValue}
                </div>
                <div className="flex items-center justify-end gap-1">
                  {getChangeIcon(entry.change)}
                  {entry.change !== 0 && (
                    <span className={cn(
                      "text-xs",
                      entry.rank <= 3 ? "text-white/80" : "text-muted-foreground"
                    )}>
                      {Math.abs(entry.change)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {entries.length > 5 && (
          <div className="text-center pt-4">
            <Button variant="outline" size="sm">
              View Full Leaderboard
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};