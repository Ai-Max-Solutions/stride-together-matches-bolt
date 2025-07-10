import { Trophy, Medal, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const getRankIcon = (rank: number) => {
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

export const getRankBadge = (rank: number) => {
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