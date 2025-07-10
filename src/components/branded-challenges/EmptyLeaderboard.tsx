import { Trophy } from 'lucide-react';

export function EmptyLeaderboard() {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
      <p>No participants yet</p>
      <p className="text-sm">Be the first to join this challenge!</p>
    </div>
  );
}