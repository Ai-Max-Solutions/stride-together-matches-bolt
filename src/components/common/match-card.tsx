import React, { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, MapPin, Clock, Star, Zap, Trophy, Heart, Ban, Award, Target, TrendingUp, Medal } from "lucide-react";
import { BlockReportDialog } from "@/components/chat/BlockReportDialog";
import { MatchToast } from "@/components/common/MatchToast";
import { ConfettiEffect } from "@/components/common/ConfettiEffect";
import { VerificationStatus } from "@/components/verification/EliteVerificationBadge";
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
  verification_level?: 'amateur' | 'competitive' | 'elite' | 'professional' | 'olympic';
  verifications?: string[];
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

  // Determine if this is an elite match (90%+ compatibility score)
  const isEliteMatch = matchScore.score >= 90;
  const isHighPerformanceMatch = matchScore.score >= 75;

  // Generate dynamic badges based on match score and profile
  const generateMatchBadges = () => {
    const badges = [];
    
    // Performance compatibility badge
    badges.push({
      label: `${matchScore.score}% compatible`,
      variant: isEliteMatch ? "elite" : isHighPerformanceMatch ? "performance" : "secondary",
      icon: isEliteMatch ? Trophy : Medal
    });

    // Activity compatibility
    if (profile.sports && profile.sports.length > 0) {
      badges.push({
        label: profile.sports[0],
        variant: "fitness",
        icon: Zap
      });
    }

    // Coach/Mentor status
    if (profile.is_mentor_available) {
      badges.push({
        label: "Elite Coach",
        variant: "accent",
        icon: Award
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
          // Elite match gradient accent strip
          isEliteMatch && "border-l-4 border-l-amber-500",
          // Glass effect on hover
          "hover:backdrop-blur-sm",
          className
        )}
        style={{
          willChange: "transform"
        }}
      >
        {/* Elite match gradient overlay */}
        {isEliteMatch && (
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-yellow-500/5 pointer-events-none" />
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

          {/* Verification Status */}
          {(profile.verification_level || profile.verifications) && (
            <div className="mb-3">
              <VerificationStatus 
                verifications={[
                  profile.verification_level || 'amateur',
                  ...(profile.verifications || [])
                ]} 
              />
            </div>
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
                    badge.variant === "elite" && "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg",
                    badge.variant === "performance" && "bg-slate-800 text-white border-slate-700",
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
              isEliteMatch 
                ? "bg-gradient-to-r from-slate-800 to-slate-700 hover:shadow-lg text-white" 
                : "bg-slate-700 hover:bg-slate-600 text-white"
            )}
          >
            Partner Up
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