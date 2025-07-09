import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAdvancedAI } from '@/hooks/use-advanced-ai';
import { 
  Sparkles, 
  Calendar, 
  Shield,
  Dumbbell,
  MessageSquare,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AISuggestionsProps {
  currentUser: any;
  otherUser: any;
  conversationHistory?: any[];
  onSendMessage: (message: string, type?: 'text' | 'ai_suggestion') => void;
  className?: string;
}

export function AISuggestions({
  currentUser,
  otherUser,
  conversationHistory = [],
  onSendMessage,
  className
}: AISuggestionsProps) {
  const { toast } = useToast();
  const {
    generateSmartWorkoutSuggestion,
    generateOptimalMeetingTimes,
    generateContextualIcebreaker,
    generateSafetyRecommendations,
    loading
  } = useAdvancedAI();

  const [activeTab, setActiveTab] = useState<'workout' | 'timing' | 'icebreaker' | 'safety' | null>(null);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleGenerateWorkout = async () => {
    setActiveTab('workout');
    setIsCollapsed(false);
    
    try {
      const suggestion = await generateSmartWorkoutSuggestion({
        currentUser,
        otherUser,
        conversationHistory
      });

      if (suggestion) {
        setSuggestions(suggestion);
      } else {
        toast({
          title: "No suggestions available",
          description: "Try again in a moment.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Failed to generate suggestion",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateTiming = async () => {
    setActiveTab('timing');
    setIsCollapsed(false);
    
    try {
      const suggestion = await generateOptimalMeetingTimes({
        currentUser,
        otherUser
      });

      if (suggestion) {
        setSuggestions(suggestion);
      } else {
        toast({
          title: "No timing suggestions available",
          description: "Try again in a moment.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Failed to generate timing",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateIcebreaker = async () => {
    setActiveTab('icebreaker');
    setIsCollapsed(false);
    
    try {
      const suggestions = await generateContextualIcebreaker({
        currentUser,
        otherUser,
        conversationHistory
      });

      if (suggestions && suggestions.length > 0) {
        setSuggestions(suggestions);
      } else {
        toast({
          title: "No conversation starters available",
          description: "Try again in a moment.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Failed to generate icebreakers",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateSafety = async () => {
    setActiveTab('safety');
    setIsCollapsed(false);
    
    try {
      const recommendations = await generateSafetyRecommendations({
        currentUser,
        otherUser,
        conversationHistory
      });

      if (recommendations) {
        setSuggestions(recommendations);
      } else {
        toast({
          title: "No safety tips available",
          description: "Try again in a moment.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Failed to generate safety tips",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleRegenerate = () => {
    if (activeTab === 'workout') handleGenerateWorkout();
    else if (activeTab === 'timing') handleGenerateTiming();
    else if (activeTab === 'icebreaker') handleGenerateIcebreaker();
    else if (activeTab === 'safety') handleGenerateSafety();
  };

  const renderSuggestionContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-3"></div>
          <span className="text-sm text-muted-foreground">AI is thinking...</span>
        </div>
      );
    }

    if (!suggestions) return null;

    switch (activeTab) {
      case 'workout':
        const workoutMessage = suggestions.details || 
          `🏋️ Let's ${suggestions.activity || 'work out'} together! Duration: ${suggestions.duration || '45 mins'}`;
        return (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-lg border border-primary/20">
              <div className="flex items-start gap-2 mb-2">
                <Bot className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">{workoutMessage}</p>
              </div>
              {!isExpanded && workoutMessage.length > 100 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                  className="text-xs h-auto p-1"
                >
                  Show More <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              )}
              {isExpanded && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-xs h-auto p-1"
                >
                  Show Less <ChevronUp className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
            <Button 
              onClick={() => onSendMessage(workoutMessage, 'ai_suggestion')}
              className="w-full"
              size="sm"
            >
              Send Workout Idea
            </Button>
          </div>
        );

      case 'timing':
        const timingMessage = suggestions.ai_analysis || "Let's find the perfect time to meet up!";
        return (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-lg border border-primary/20">
              <div className="flex items-start gap-2">
                <Bot className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">{timingMessage}</p>
              </div>
            </div>
            <Button 
              onClick={() => onSendMessage(`📅 ${timingMessage}`, 'ai_suggestion')}
              className="w-full"
              size="sm"
            >
              Share Timing Suggestion
            </Button>
          </div>
        );

      case 'icebreaker':
        return (
          <div className="space-y-3">
            {suggestions.slice(0, 2).map((suggestion: string, index: number) => (
              <div key={index} className="space-y-2">
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-lg border border-primary/20">
                  <div className="flex items-start gap-2">
                    <Bot className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{suggestion}</p>
                  </div>
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

      case 'safety':
        const safetyMessage = suggestions.ai_details || 
          suggestions.general_safety?.[0] || 
          "Let's meet in a public place for our first workout!";
        return (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-lg border border-primary/20">
              <div className="flex items-start gap-2">
                <Bot className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">{safetyMessage}</p>
              </div>
            </div>
            <Button 
              onClick={() => onSendMessage(`🛡️ Safety first! ${safetyMessage}`, 'ai_suggestion')}
              className="w-full"
              size="sm"
            >
              Share Safety Tip
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const suggestionButtons = [
    {
      id: 'workout' as const,
      label: 'Workout Ideas',
      icon: Dumbbell,
      action: handleGenerateWorkout
    },
    {
      id: 'timing' as const,
      label: 'Meeting Times',
      icon: Calendar,
      action: handleGenerateTiming
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
      action: handleGenerateSafety
    }
  ];

  return (
    <Card className={cn("border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Smart Suggestions
            <Badge variant="outline" className="border-primary/20 text-xs">
              Beta
            </Badge>
          </CardTitle>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="h-auto p-1"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Suggestion Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {suggestionButtons.map((button) => {
            const Icon = button.icon;
            return (
              <Button
                key={button.id}
                variant={activeTab === button.id ? "default" : "outline"}
                size="sm"
                onClick={button.action}
                disabled={loading}
                className="flex items-center gap-2 text-xs h-10 min-h-[44px]"
                aria-label={`Generate ${button.label.toLowerCase()}`}
              >
                <Icon className="h-3 w-3" />
                {button.label}
              </Button>
            );
          })}
        </div>

        {/* Content */}
        {!isCollapsed && (
          <>
            {activeTab && (
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {suggestionButtons.find(b => b.id === activeTab)?.label}
                </h4>
                {suggestions && !loading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRegenerate}
                    className="h-auto p-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
            
            {renderSuggestionContent()}
            
            {!activeTab && !loading && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Tap a button above to get AI suggestions!
                </p>
              </div>
            )}
          </>
        )}

        {isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            className="w-full"
          >
            Show AI Suggestions <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}