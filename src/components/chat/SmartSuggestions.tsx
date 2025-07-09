import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAdvancedAI } from '@/hooks/use-advanced-ai';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Clock,
  Shield,
  Lightbulb,
  Dumbbell,
  MessageSquare
} from 'lucide-react';

interface SmartSuggestionsProps {
  currentUser: any;
  otherUser: any;
  conversationHistory?: any[];
  onSendMessage: (message: string, type?: 'text' | 'ai_suggestion') => void;
}

export function SmartSuggestions({
  currentUser,
  otherUser,
  conversationHistory = [],
  onSendMessage
}: SmartSuggestionsProps) {
  const { toast } = useToast();
  const {
    generateSmartWorkoutSuggestion,
    generateOptimalMeetingTimes,
    generateContextualIcebreaker,
    generateSafetyRecommendations,
    loading
  } = useAdvancedAI();

  const [activeTab, setActiveTab] = useState<'workout' | 'timing' | 'icebreaker' | 'safety'>('workout');
  const [suggestions, setSuggestions] = useState<any>(null);

  const handleGenerateWorkoutSuggestion = async () => {
    try {
      const suggestion = await generateSmartWorkoutSuggestion({
        currentUser,
        otherUser,
        conversationHistory
      });

      if (suggestion) {
        setSuggestions(suggestion);
        setActiveTab('workout');
      }
    } catch (error) {
      toast({
        title: "Failed to generate suggestion",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateMeetingTimes = async () => {
    try {
      const suggestion = await generateOptimalMeetingTimes({
        currentUser,
        otherUser
      });

      if (suggestion) {
        setSuggestions(suggestion);
        setActiveTab('timing');
      }
    } catch (error) {
      toast({
        title: "Failed to generate meeting times",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateIcebreaker = async () => {
    try {
      const suggestions = await generateContextualIcebreaker({
        currentUser,
        otherUser,
        conversationHistory
      });

      if (suggestions && suggestions.length > 0) {
        setSuggestions(suggestions);
        setActiveTab('icebreaker');
      }
    } catch (error) {
      toast({
        title: "Failed to generate icebreakers",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateSafetyTips = async () => {
    try {
      const recommendations = await generateSafetyRecommendations({
        currentUser,
        otherUser,
        conversationHistory
      });

      if (recommendations) {
        setSuggestions(recommendations);
        setActiveTab('safety');
      }
    } catch (error) {
      toast({
        title: "Failed to generate safety tips",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const tabs = [
    {
      id: 'workout' as const,
      label: 'Workout Ideas',
      icon: Dumbbell,
      action: handleGenerateWorkoutSuggestion
    },
    {
      id: 'timing' as const,
      label: 'Meeting Times',
      icon: Calendar,
      action: handleGenerateMeetingTimes
    },
    {
      id: 'icebreaker' as const,
      label: 'Conversation',
      icon: MessageSquare,
      action: handleGenerateIcebreaker
    },
    {
      id: 'safety' as const,
      label: 'Safety Tips',
      icon: Shield,
      action: handleGenerateSafetyTips
    }
  ];

  const renderWorkoutSuggestions = () => {
    if (!suggestions || activeTab !== 'workout') return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Activity</h4>
            <p className="font-semibold">{suggestions.activity}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Duration</h4>
            <p className="font-semibold">{suggestions.duration}</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Suggested Message:</h4>
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm">{suggestions.details}</p>
          </div>
          <Button 
            onClick={() => onSendMessage(suggestions.details, 'ai_suggestion')}
            className="w-full mt-2"
            size="sm"
          >
            Send Workout Suggestion
          </Button>
        </div>
      </div>
    );
  };

  const renderMeetingTimes = () => {
    if (!suggestions || activeTab !== 'timing') return null;

    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Recommended Times:</h4>
          <div className="space-y-2">
            {suggestions.recommended_times?.slice(0, 3).map((time: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm capitalize">{time.day}</p>
                  <p className="text-xs text-muted-foreground">{time.time}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {time.confidence}/10 match
                </Badge>
              </div>
            ))}
          </div>
        </div>
        
        {suggestions.ai_analysis && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">AI Analysis:</h4>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm">{suggestions.ai_analysis}</p>
            </div>
            <Button 
              onClick={() => onSendMessage(`📅 Perfect timing! ${suggestions.ai_analysis}`, 'ai_suggestion')}
              className="w-full mt-2"
              size="sm"
            >
              Share Timing Suggestion
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderIcebreakers = () => {
    if (!suggestions || activeTab !== 'icebreaker') return null;

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground">Conversation Starters:</h4>
        {suggestions.map((suggestion: string, index: number) => (
          <div key={index} className="space-y-2">
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm">{suggestion}</p>
            </div>
            <Button 
              onClick={() => onSendMessage(suggestion, 'text')}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Send This Message
            </Button>
          </div>
        ))}
      </div>
    );
  };

  const renderSafetyTips = () => {
    if (!suggestions || activeTab !== 'safety') return null;

    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Location Safety
          </h4>
          <ul className="space-y-1">
            {suggestions.location_tips?.map((tip: string, index: number) => (
              <li key={index} className="text-sm text-muted-foreground">• {tip}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Timing Tips
          </h4>
          <ul className="space-y-1">
            {suggestions.timing_recommendations?.map((tip: string, index: number) => (
              <li key={index} className="text-sm text-muted-foreground">• {tip}</li>
            ))}
          </ul>
        </div>

        {suggestions.ai_details && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Safety Reminder:</h4>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm">{suggestions.ai_details}</p>
            </div>
            <Button 
              onClick={() => onSendMessage(`🛡️ Safety first! ${suggestions.general_safety?.[0] || 'Let\'s meet in a public place for our first workout.'}`, 'ai_suggestion')}
              className="w-full mt-2"
              size="sm"
            >
              Share Safety Suggestion
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Smart Suggestions
          <Badge variant="outline" className="border-primary/20 text-xs">
            Beta
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                size="sm"
                onClick={tab.action}
                disabled={loading}
                className="flex items-center gap-1 text-xs"
                aria-label={`Generate ${tab.label.toLowerCase()}`}
              >
                <Icon className="h-3 w-3" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        <Separator />

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Generating suggestions...</span>
          </div>
        ) : suggestions ? (
          <div>
            {renderWorkoutSuggestions()}
            {renderMeetingTimes()}
            {renderIcebreakers()}
            {renderSafetyTips()}
          </div>
        ) : (
          <div className="text-center py-6">
            <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Click a button above to get AI-powered suggestions for your conversation!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}