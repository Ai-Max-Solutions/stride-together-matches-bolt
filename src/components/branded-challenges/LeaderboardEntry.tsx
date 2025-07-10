import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LeaderboardEntry as LeaderboardEntryType } from '@/hooks/use-branded-challenges';
import { getRankIcon, getRankBadge } from './rank-utils';
import { cn } from '@/lib/utils';

interface LeaderboardEntryProps {
  entry: LeaderboardEntryType;
  index: number;
}

export function LeaderboardEntry({ entry, index }: LeaderboardEntryProps) {
  return (
    <div
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
  );
}