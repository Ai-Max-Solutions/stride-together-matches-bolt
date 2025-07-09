import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, MapPin, Clock, Star } from "lucide-react";
import { SportsBadges } from "./sports-badges";
import { TrustBadges } from "./TrustBadges";
import { BlockReportDialog } from "@/components/chat/BlockReportDialog";
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
}

export function MatchCard({ profile, matchScore, onConnect, className }: MatchCardProps) {
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

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.profile_picture_url} />
            <AvatarFallback>
              {profile.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{profile.full_name}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {formatLocation(profile)}
                  </div>
                  <TrustBadges profile={profile} size="sm" className="mt-1" />
                </div>
              </div>
              {matchScore && (
                <div className="flex flex-col items-end">
                  <Badge className="bg-primary text-primary-foreground mb-1">
                    {matchScore.score}% match
                  </Badge>
                  {matchScore.score >= 70 && (
                    <div className="flex items-center text-amber-500">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      <span className="text-xs">Top Match</span>
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
              <SportsBadges selectedSports={profile.sports} variant="display" />
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="capitalize">{profile.experience_level} level</span>
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
                onClick={() => onConnect(profile.user_id)}
                className="flex-1"
                size="sm"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Connect
              </Button>
              <BlockReportDialog 
                otherUserId={profile.user_id}
                otherUserName={profile.full_name || 'User'}
                onBlock={() => {}}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}