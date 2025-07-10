import { useToast } from '@/hooks/use-toast';
import type { FlashRun } from '@/types/flash-runs';

/**
 * Hook for managing Flash Run toast messages and celebrations
 */
export function useFlashRunMessages() {
  const { toast } = useToast();

  const showCreationSuccess = (data: { distance: string; sport_type: string }) => {
    let eventType = 'Flash Run';
    let eventEmoji = '⚡';
    let description = `Your ${data.distance} run is live and ready for participants!`;
    
    switch (data.sport_type) {
      case 'cycling':
        eventType = 'Flash Ride';
        eventEmoji = '🚴';
        description = `Your ${data.distance} ride is live and ready for participants!`;
        break;
      case 'workout':
        eventType = 'Flash Workout';
        eventEmoji = '💪';
        description = `Your ${data.distance} workout is live and ready for participants!`;
        break;
      case 'yoga':
        eventType = 'Flash Yoga';
        eventEmoji = '🧘';
        description = `Your peaceful ${data.distance} session is ready for participants.`;
        break;
    }
    
    toast({
      title: `${eventEmoji} ${eventType} Created!`,
      description,
    });
  };

  const showJoinSuccess = (flashEvent?: FlashRun) => {
    let title = "🎉 You're in!";
    let message = "See you at the Flash Run!";
    
    switch (flashEvent?.sport_type) {
      case 'workout':
        title = "💪 Let's crush it!";
        message = "Ready to sweat? Your workout starts soon!";
        
        // Add workout-specific vibration if supported
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
        break;
      case 'cycling':
        message = "🚴 See you on the saddle!";
        break;
      case 'yoga':
        title = "Time to unwind! 🧘";
        message = "Don't forget your mat! Your peaceful session awaits.";
        break;
    }
    
    toast({
      title,
      description: message,
    });
  };

  const showLeaveSuccess = () => {
    toast({
      title: "Left Flash Run",
      description: "You've left the Flash Run",
    });
  };

  const showError = (action: 'create' | 'join' | 'leave' | 'fetch', customMessage?: string) => {
    const messages = {
      create: "Failed to create Flash Run",
      join: "Failed to join Flash Run",
      leave: "Failed to leave Flash Run",
      fetch: "Failed to load Flash Runs"
    };

    toast({
      title: "Error",
      description: customMessage || messages[action],
      variant: "destructive"
    });
  };

  return {
    showCreationSuccess,
    showJoinSuccess,
    showLeaveSuccess,
    showError
  };
}