/**
 * Hook for calculating Flash Run expiration times based on sport type
 */
export function useFlashRunExpiration() {
  const calculateExpirationTime = (startTime: string, sportType: string): string => {
    const start = new Date(startTime);
    let expiresAt = new Date(start);
    
    switch (sportType) {
      case 'cycling':
        expiresAt.setHours(expiresAt.getHours() + 2); // 2 hours for cycling
        break;
      case 'workout':
        expiresAt.setMinutes(expiresAt.getMinutes() + 90); // 90 minutes for workouts
        break;
      case 'yoga':
        expiresAt.setMinutes(expiresAt.getMinutes() + 75); // 75 minutes for yoga
        break;
      default:
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour for running
        break;
    }
    
    return expiresAt.toISOString();
  };

  const getMaxParticipants = (sportType: string): number => {
    switch (sportType) {
      case 'workout':
        return 6; // Gym equipment capacity
      case 'yoga':
        return 8; // Good circle formation
      default:
        return 8; // Default for runs/rides
    }
  };

  return {
    calculateExpirationTime,
    getMaxParticipants
  };
}