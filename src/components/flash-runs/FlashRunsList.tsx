import { Zap, Clock } from 'lucide-react';
import { FlashRunCard } from './FlashRunCard';
import { FlashRun } from '@/hooks/use-flash-runs';
import { Skeleton } from '@/components/ui/skeleton';

interface FlashRunsListProps {
  flashRuns: FlashRun[];
  loading: boolean;
  onJoin: (flashRunId: string) => Promise<boolean>;
  onLeave: (flashRunId: string) => Promise<boolean>;
}

export function FlashRunsList({ flashRuns, loading, onJoin, onLeave }: FlashRunsListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Flash Runs</h2>
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (flashRuns.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Flash Runs</h2>
        </div>
        <div className="text-center py-8 px-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            No Flash Runs nearby
          </h3>
          <p className="text-xs text-muted-foreground">
            Be the first to create a spontaneous workout!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Flash Runs</h2>
        </div>
        <div className="text-xs text-muted-foreground">
          {flashRuns.length} happening soon
        </div>
      </div>
      
      <div className="space-y-3">
        {flashRuns.map((flashRun) => (
          <FlashRunCard
            key={flashRun.id}
            flashRun={flashRun}
            onJoin={onJoin}
            onLeave={onLeave}
          />
        ))}
      </div>
    </div>
  );
}