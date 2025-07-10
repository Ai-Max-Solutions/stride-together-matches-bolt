import React, { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, MapPin, Clock, Star, Zap, Trophy, Heart, Ban } from "lucide-react";
import { BlockReportDialog } from "@/components/chat/BlockReportDialog";
import { MatchToast } from "@/components/common/MatchToast";
import { ConfettiEffect } from "@/components/common/ConfettiEffect";
import { useUserPresence } from "@/hooks/use-user-presence";
import { useAchievements } from "@/hooks/use-achievements";
import { useChallenges } from "@/hooks/use-challenges";
import { cn } from "@/lib/utils";

// Profile interface matching the Browse page structure
interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  bio: string | null;
  city: string | null;
  region: string | null;
  sports: string[] | null;
  experience_level: string | null;
  fitness_goals: string[] | null;
  mentor_specialties: string[] | null;
  is_mentor_available: boolean | null;
  years_experience: number | null;
  availability: Record<string, string[]> | null;
  trust_score: number | null;
  profile_picture_url: string | null;
  last_active_at: string | null;
}

interface MatchScore {
  score: number;
  reasons: string[];
  tags: string[];
}

interface MatchCardProps {
  profile: Profile;
  matchScore: MatchScore;
  onConnect: (profileId: string) => void;
  className?: string;
  currentUserId?: string;
}

const MatchCard = ({ profile, matchScore, onConnect, className, currentUserId }: MatchCardProps) => {
  const [showMatchToast, setShowMatchToast] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isBlockReportOpen, setIsBlockReportOpen] = useState(false);
  
  const isOnline = useUserPresence(profile.user_id);
  const { awardAchievement } = useAchievements();
  const { updateProgress } = useChallenges();

  // Format location for display
  const formatLocation = (profile: Profile): string => {
    if (profile.city && profile.region) {
      return `${profile.city}, ${profile.region}`;
    }
    return profile.city || profile.region || "Location not specified";
  };

  // Get availability summary
  const getAvailabilityText = (availability: Record<string, string[]>): string => {
    if (!availability || Object.keys(availability).length === 0) {
      return "Availability not set";
    }
    
    const days = Object.keys(availability).filter(day => 
      availability[day] && availability[day].length > 0
    );
    
    if (days.length === 0) return "No availability set";
    if (days.length === 7) return "Available daily";
    if (days.length >= 5) return "Available most days";
    
    return `Available ${days.length} days/week`;
  };

  // Generate mentor blurb
  const generateMentorBlurb = (profile: Profile, currentUserGoals?: string[]): string => {
    if (!profile.is_mentor_available || !profile.mentor_specialties) return "";
    
    const specialties = profile.mentor_specialties.slice(0, 2);
    return `Mentor for ${specialties.join(" & ")}`;
  };

  const handleConnect = useCallback(async () => {
    try {
      await onConnect(profile.id);
      
      // Trigger success animations
      setShowConfetti(true);
      setShowMatchToast(true);
      
      // Update gamification
      await awardAchievement("first_connection");
      
      // Auto-hide confetti after animation
      setTimeout(() => setShowConfetti(false), 3000);
      
    } catch (error) {
      console.error("Error connecting:", error);
    }
  }, [profile.id, onConnect, awardAchievement, updateProgress]);

  const handleStartChat = () => {
    console.log("Starting chat with:", profile.user_id);
  };

  const handleDismissToast = () => {
    setShowMatchToast(false);
  };

  // Determine if this is a premium match (90%+ match score)
  const isPremiumMatch = matchScore.score >= 90;
  const isHighMatch = matchScore.score >= 75;

  // Generate dynamic badges based on match score and profile
  const generateMatchBadges = () => {
    const badges = [];
    
    // Match percentage badge
    badges.push({
      label: `${matchScore.score}% match`,
      variant: isPremiumMatch ? "premium" : isHighMatch ? "success" : "secondary",
      icon: isPremiumMatch ? Trophy : Star
    });

    // Activity compatibility
    if (profile.sports && profile.sports.length > 0) {
      badges.push({
        label: profile.sports[0],
        variant: "fitness",
        icon: Zap
      });
    }

    // Mentor status
    if (profile.is_mentor_available) {
      badges.push({
        label: "Mentor",
        variant: "accent",
        icon: Heart
      });
    }

    return badges.slice(0, 3); // Limit to 3 badges for clean design
  };

  const badges = generateMatchBadges();

  return (
    <>
      <Card 
        className={cn(
          // Base card styling with premium elevation
          "group relative overflow-hidden transition-all duration-300 ease-out",
          "bg-card border-0 shadow-card hover:shadow-card-hover",
          "hover:scale-[1.02] hover:-translate-y-1",
          // Premium match gradient accent strip
          isPremiumMatch && "border-l-4 border-l-gradient-primary",
          // Glass effect on hover
          "hover:backdrop-blur-sm",
          className
        )}
        style={{
          willChange: "transform"
        }}
      >
        {/* Premium match gradient overlay */}
        {isPremiumMatch && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        )}

        <CardContent className="p-6 space-y-4">
          {/* Header: Avatar + Name + Status */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-background shadow-avatar transition-transform group-hover:scale-105">
                <AvatarImage 
                  src={profile.profile_picture_url || undefined} 
                  alt={profile.full_name || "User"} 
                />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                  {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              {/* Online status indicator */}
              {isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success rounded-full border-2 border-background animate-pulse" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-card-foreground leading-tight">
                {profile.full_name || "Anonymous User"}
              </h3>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{formatLocation(profile)}</span>
              </div>

              {/* Experience level */}
              {profile.experience_level && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Star className="h-3 w-3" />
                  <span className="capitalize">{profile.experience_level}</span>
                </div>
              )}
            </div>

            {/* Quick action button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartChat}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>

          {/* Bio snippet */}
          {profile.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Match badges with modern pill design */}
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => {
              const IconComponent = badge.icon;
              return (
                <Badge
                  key={index}
                  variant={badge.variant as any}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-full",
                    "flex items-center gap-1.5 transition-all",
                    "hover:scale-105 hover:shadow-sm",
                    badge.variant === "premium" && "bg-gradient-primary text-primary-foreground shadow-premium",
                    badge.variant === "success" && "bg-success/10 text-success border-success/20",
                    badge.variant === "fitness" && "bg-accent/10 text-accent border-accent/20",
                    badge.variant === "accent" && "bg-secondary text-secondary-foreground"
                  )}
                >
                  <IconComponent className="h-3 w-3" />
                  {badge.label}
                </Badge>
              );
            })}
            
            {/* Block badge */}
            <Badge
              onClick={() => setIsBlockReportOpen(true)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full cursor-pointer",
                "flex items-center gap-1.5 transition-all",
                "hover:scale-105 hover:shadow-sm",
                "bg-red-600 text-white border-red-500 hover:bg-red-700"
              )}
            >
              <Ban className="h-3 w-3" />
              BLOCK
            </Badge>
          </div>

          {/* Mentor specialties */}
          {profile.is_mentor_available && profile.mentor_specialties && (
            <div className="text-sm">
              <span className="text-muted-foreground">Mentoring: </span>
              <span className="text-card-foreground font-medium">
                {generateMentorBlurb(profile)}
              </span>
            </div>
          )}

          {/* Availability */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{getAvailabilityText(profile.availability || {})}</span>
          </div>

          {/* Action button */}
          <Button 
            onClick={handleConnect}
            className={cn(
              "w-full mt-4 transition-all duration-200",
              "hover:scale-[1.02] active:scale-[0.98]",
              isPremiumMatch 
                ? "bg-gradient-primary hover:shadow-premium text-primary-foreground" 
                : "bg-primary hover:bg-primary/90"
            )}
          >
            Connect
          </Button>
        </CardContent>

        {/* Confetti effect for premium matches */}
        {showConfetti && <ConfettiEffect isActive={showConfetti} />}
      </Card>

      {/* Match success toast */}
      <MatchToast
        isVisible={showMatchToast}
        otherUser={{
          name: profile.full_name || "User",
          avatar: profile.profile_picture_url || undefined
        }}
        isMatch={matchScore.score >= 90}
        onDismiss={handleDismissToast}
        onStartChat={handleStartChat}
      />

    </>
  );
};

export default MatchCard;