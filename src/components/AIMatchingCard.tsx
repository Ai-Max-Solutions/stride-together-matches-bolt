import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Target, 
  MapPin, 
  Clock, 
  TrendingUp,
  MessageCircle,
  CheckCircle
} from "lucide-react";

interface AIMatchingCardProps {
  recommendations: {
    profile: {
      id: string;
      name: string;
      sport: string;
      pace: string;
      location: string;
      matchPercentage: number;
    };
    reasons: {
      type: 'pace' | 'location' | 'goals' | 'availability';
      description: string;
      score: number;
    }[];
    confidenceScore: number;
  }[];
}

const AIMatchingCard = ({ recommendations }: AIMatchingCardProps) => {
  const getReasonIcon = (type: string) => {
    switch (type) {
      case 'pace': return Target;
      case 'location': return MapPin;
      case 'goals': return TrendingUp;
      case 'availability': return Clock;
      default: return CheckCircle;
    }
  };

  const getReasonColor = (score: number) => {
    if (score >= 0.8) return 'text-success';
    if (score >= 0.6) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <Card className="mb-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">AI-Powered Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              Smart matches based on your training profile and preferences
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <div key={recommendation.profile.id} className="bg-background rounded-lg p-4 border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium">{recommendation.profile.name}</h4>
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      {recommendation.profile.matchPercentage}% match
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {recommendation.profile.sport}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                    <span>{recommendation.profile.pace}</span>
                    <span>•</span>
                    <span>{recommendation.profile.location}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                  <div className="font-semibold text-primary">
                    {Math.round(recommendation.confidenceScore * 100)}%
                  </div>
                </div>
              </div>

              {/* AI Reasoning */}
              <div className="mb-4">
                <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Why this is a great match:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recommendation.reasons.map((reason, reasonIndex) => {
                    const Icon = getReasonIcon(reason.type);
                    return (
                      <div key={reasonIndex} className="flex items-center space-x-2 text-sm">
                        <Icon className={`w-4 h-4 ${getReasonColor(reason.score)}`} />
                        <span className="text-muted-foreground">{reason.description}</span>
                        <div className="flex space-x-1">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 h-1 rounded-full ${
                                i < Math.ceil(reason.score * 3) 
                                  ? 'bg-primary' 
                                  : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Full Profile
                </Button>
                <Button variant="default" size="sm" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <Brain className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm">
              <div className="font-medium mb-1">How AI Matching Works</div>
              <p className="text-muted-foreground">
                Our algorithm analyzes your pace, training goals, availability, and location preferences 
                to find compatible partners. Match percentages reflect compatibility across all factors, 
                with explanations for each recommendation.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIMatchingCard;