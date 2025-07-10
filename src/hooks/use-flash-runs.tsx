import { useFlashRunData } from './flash-runs/use-flash-run-data';
import { useFlashRunActions } from './flash-runs/use-flash-run-actions';

// Re-export types for backward compatibility
export type { FlashRun, CreateFlashRunData } from '@/types/flash-runs';

/**
 * Main hook for Flash Runs functionality
 * Combines data fetching and actions for a complete Flash Runs experience
 */
export function useFlashRuns(sportType?: string) {
  const { flashRuns, loading, refetch } = useFlashRunData(sportType);
  const { createFlashRun, joinFlashRun: joinFlashRunAction, leaveFlashRun } = useFlashRunActions();

  // Wrap joinFlashRun to pass current flashRuns data
  const joinFlashRun = async (flashRunId: string) => {
    return await joinFlashRunAction(flashRunId, flashRuns);
  };

  return {
    flashRuns,
    loading,
    createFlashRun,
    joinFlashRun,
    leaveFlashRun,
    refetch
  };
}