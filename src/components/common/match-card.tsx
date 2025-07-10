import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, MapPin, Clock, Star, Zap, GraduationCap } from "lucide-react";
import { SportsBadges } from "./sports-badges";
import { TrustBadges } from "./TrustBadges";
import { BlockReportDialog } from "@/components/chat/BlockReportDialog";
import { MatchToast } from "./MatchToast";
import { useUserPresence } from "@/hooks/use-user-presence";
import { useAchievements } from "@/hooks/use-achievements";
import { useChallenges } from "@/hooks/use-challenges";
import { cn } from '@/lib/utils';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string;
  profile_picture_url?: string;
  sports: string[];
  experience_level: string;
  pace_metrics: Record<string, any>;
  fitness_goals: string[];
  city: string;
  region: string;
  location_visible: boolean;
  availability: Record<string, string[]>;
  age_range_min: number;
  age_range_max: number;
  created_at: string;
  is_mentor_available?: boolean;
  years_experience?: number;
  mentor_specialties?: string[];
}

interface MatchScore {
  score: number;
  reasons: string[];
  tags: string[];
}

interface MatchCardProps {
  profile: Profile;
  matchScore?: MatchScore;
  onConnect: (profileId: string) => void;
  className?: string;
  currentUserId?: string;
}

export function MatchCard({ profile, matchScore, onConnect, className, currentUserId }: MatchCardProps) {
  const [showMatchToast, setShowMatchToast] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [hasConnected, setHasConnected] = useState(false);
  const { isOnline, statusText, statusColor } = useUserPresence(profile.user_id);
  const { checkAchievements } = useAchievements();
  const { updateProgress, challenges } = useChallenges();
  const formatLocation = (profile: Profile) => {
    if (!profile.location_visible) return 'Location private';
    if (profile.city && profile.region) {
      return `${profile.city}, ${profile.region}`;
    }
    return profile.city || profile.region || 'Location not set';
  };

  const getAvailabilityText = (availability: Record<string, string[]>) => {
    const activeDays = Object.keys(availability).filter(day => 
      availability[day] && availability[day].length > 0
    );
    if (activeDays.length === 0) return 'Schedule not set';
    return `Available ${activeDays.length} days/week`;
  };

  const generateMentorBlurb = (profile: Profile, currentUserGoals?: string[]) => {
    const name = profile.full_name?.split(' ')[0] || 'They';
    const specialties = profile.mentor_specialties || [];
    
    // Match specialties with current user's goals
    const relevantSpecialty = specialties.find(specialty => {
      if (currentUserGoals?.includes('first_marathon') && specialty === 'pacing_strategies') return true;
      if (currentUserGoals?.includes('weight_loss') && specialty === 'nutrition_planning') return true;
      if (currentUserGoals?.includes('strength') && specialty === 'strength_training') return true;
      return false;
    }) || specialties[0];

    if (relevantSpecialty) {
      const specialtyMap: Record<string, string> = {
        'pacing_strategies': 'pacing strategies',
        'injury_prevention': 'staying injury-free',
        'nutrition_planning': 'race-day nutrition',
        'race_preparation': 'race preparation',
        'strength_training': 'strength training',
        'form_technique': 'proper form',
        'mental_preparation': 'mental preparation',
        'recovery_methods': 'recovery techniques',
        'goal_setting': 'goal setting'
      };
      return `Ask ${name} about ${specialtyMap[relevantSpecialty] || relevantSpecialty.replace('_', ' ')}!`;
    }
    
    return `Ask ${name} about their experience!`;
  };

  const handleConnect = async () => {
    setConnecting(true);
    setHasConnected(true);
    
    // Add a small delay for button animation
    setTimeout(async () => {
      // Simulate checking if it's a mutual match (for demo purposes)
      const isMatch = Math.random() > 0.7; // 30% chance of mutual match
      
      setShowMatchToast(true);
      onConnect(profile.user_id);
      setConnecting(false);

      // Update gamification progress
      try {
        // Check for achievements based on connections
        await checkAchievements({ connectionsCount: 1 });
        
        // Update challenge progress for connection-based challenges
        const connectionChallenges = challenges.filter(c => 
          c.title.toLowerCase().includes('connect') || 
          c.title.toLowerCase().includes('buddy')
        );
        
        for (const challenge of connectionChallenges) {
          await updateProgress(challenge.id, 1);
        }
      } catch (error) {
        console.error('Error updating gamification progress:', error);
      }
    }, 600);
  };

  const handleStartChat = () => {
    setShowMatchToast(false);
    // Navigate to chat would happen in onConnect
  };

  const handleDismissToast = () => {
    setShowMatchToast(false);
  };

  return (
    <Card className={cn("hover-lift transition-all duration-300 group", className)}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={cn("relative status-indicator", statusColor)}>
            <Avatar className="h-16 w-16 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
              <AvatarImage src={profile.profile_picture_url} className="object-cover" />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                {profile.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{profile.full_name}</h3>
                <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    {formatLocation(profile)}
                  </div>
                  <div className={cn(
                    "text-xs font-medium animate-fade-in",
                    isOnline ? "text-green-600" : "text-muted-foreground"
                  )}>
                    {statusText}
                  </div>
                </div>
                  <TrustBadges profile={profile} size="sm" className="mt-1" />
                </div>
              </div>
              {matchScore && (
                <div className="flex flex-col items-end animate-fade-in">
                  <Badge className="bg-gradient-primary text-primary-foreground mb-1 shadow-primary animate-pulse-glow">
                    {matchScore.score}% match
                  </Badge>
                  {matchScore.score >= 70 && (
                    <div className="flex items-center text-amber-500 animate-bounce-light">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      <span className="text-xs font-medium">Top Match</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {profile.bio && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {profile.bio}
              </p>
            )}
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <SportsBadges selectedSports={profile.sports} variant="display" />
                {profile.is_mentor_available && (
                  <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-700 border-purple-200">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    Mentor
                  </Badge>
                )}
              </div>
              
              {profile.is_mentor_available && (
                <p className="text-xs text-purple-600 font-medium italic">
                  {generateMentorBlurb(profile, currentUserId ? [] : [])}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="capitalize">{profile.experience_level} level</span>
                {profile.is_mentor_available && profile.years_experience && (
                  <span>{profile.years_experience} years experience</span>
                )}
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {getAvailabilityText(profile.availability)}
                </div>
              </div>
            </div>
            
            {matchScore && matchScore.reasons.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1 mb-2">
                  {matchScore.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {matchScore.reasons.slice(0, 2).join(' • ')}
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={handleConnect}
                disabled={connecting || hasConnected}
                className={cn(
                  "flex-1 button-bounce transition-all duration-300",
                  hasConnected && "success-flash",
                  connecting && "animate-pulse"
                )}
                size="sm"
                variant="hero"
              >
                {connecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Connecting...
                  </>
                ) : hasConnected ? (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Sent!
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Connect
                  </>
                )}
              </Button>
              <BlockReportDialog 
                otherUserId={profile.user_id}
                otherUserName={profile.full_name || 'User'}
                onBlock={() => {}}
              />
            </div>
            
            <MatchToast
              isVisible={showMatchToast}
              otherUser={{
                name: profile.full_name || 'User',
                avatar: profile.profile_picture_url
              }}
              isMatch={Math.random() > 0.7} // This would come from actual match logic
              onStartChat={handleStartChat}
              onDismiss={handleDismissToast}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}