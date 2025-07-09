import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Clock, 
  Target, 
  MessageCircle,
  Star,
  Trophy,
  Calendar
} from "lucide-react";

interface ProfileCardProps {
  profile: {
    id: string;
    name: string;
    age: number;
    location: string;
    sport: string;
    pace: string;
    distance: string;
    goals: string[];
    availability: string[];
    rating: number;
    completedWorkouts: number;
    avatar: string;
    matchPercentage?: number;
  };
  showMatchPercentage?: boolean;
}

const ProfileCard = ({ profile, showMatchPercentage = false }: ProfileCardProps) => {
  const getSportColor = (sport: string) => {
    switch (sport.toLowerCase()) {
      case 'running': return 'running';
      case 'cycling': return 'cycling';
      case 'swimming': return 'fitness';
      case 'gym': return 'primary';
      default: return 'primary';
    }
  };

  const sportColor = getSportColor(profile.sport);

  return (
    <Card className="group hover:shadow-card transition-all duration-300 bg-gradient-card">
      <CardContent className="p-6">
        {/* Header with Avatar and Basic Info */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </div>
            {showMatchPercentage && profile.matchPercentage && (
              <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full font-semibold">
                {profile.matchPercentage}%
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-lg">{profile.name}</h3>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span className="text-sm font-medium">{profile.rating.toFixed(1)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
              <span>{profile.age} years</span>
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{profile.location}</span>
              </div>
            </div>

            <Badge variant="outline" className={`text-${sportColor} border-${sportColor}/20 bg-${sportColor}/10`}>
              {profile.sport}
            </Badge>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Pace</div>
            <div className="font-semibold">{profile.pace}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Distance</div>
            <div className="font-semibold">{profile.distance}</div>
          </div>
        </div>

        {/* Goals */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Goals</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {profile.goals.slice(0, 2).map((goal, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {goal}
              </Badge>
            ))}
            {profile.goals.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{profile.goals.length - 2} more
              </Badge>
            )}
          </div>
        </div>

        {/* Availability */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Available</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {profile.availability.slice(0, 3).map((time, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {time}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center space-x-1">
            <Trophy className="w-3 h-3" />
            <span>{profile.completedWorkouts} workouts</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>Active this week</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1">
            View Profile
          </Button>
          <Button variant={sportColor as any} size="sm" className="flex-1">
            <MessageCircle className="w-4 h-4 mr-2" />
            Connect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;