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
        <div className="flex items-center justify-center py-8">
          <div className="relative">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-200 border-t-amber-500"></div>
            <div className="absolute inset-0 animate-pulse">
              <div className="w-6 h-6 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full opacity-20"></div>
            </div>
          </div>
          <span className="text-sm text-amber-700 font-medium ml-3">✨ AI is crafting your suggestion...</span>
        </div>
      );
    }

    if (!suggestions) return null;

    switch (activeTab) {
      case 'workout':
        const workoutMessage = suggestions.details || 
          `🏋️ Let's ${suggestions.activity || 'work out'} together! Duration: ${suggestions.duration || '45 mins'}`;
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-2 rounded-full flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900 leading-relaxed">{workoutMessage}</p>
                </div>
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
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white border-0 shadow-md hover:shadow-lg hover:shadow-amber-200 transition-all duration-300 hover:scale-105"
              size="sm"
            >
              <Dumbbell className="h-4 w-4 mr-2" />
              Send Workout Idea
            </Button>
          </div>
        );

      case 'timing':
        const timingMessage = suggestions.ai_analysis || "Let's find the perfect time to meet up!";
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-2 rounded-full flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900 leading-relaxed">{timingMessage}</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => onSendMessage(`📅 ${timingMessage}`, 'ai_suggestion')}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white border-0 shadow-md hover:shadow-lg hover:shadow-amber-200 transition-all duration-300 hover:scale-105"
              size="sm"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Share Timing Suggestion
            </Button>
          </div>
        );

      case 'icebreaker':
        return (
          <div className="space-y-4">
            {suggestions.slice(0, 2).map((suggestion: string, index: number) => (
              <div key={index} className="space-y-3">
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-2 rounded-full flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-900 leading-relaxed">{suggestion}</p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => onSendMessage(suggestion, 'text')}
                  variant="outline"
                  size="sm"
                  className="w-full border-amber-300 text-amber-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 hover:border-amber-400 transition-all duration-300 hover:scale-105"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
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
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-2 rounded-full flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900 leading-relaxed">{safetyMessage}</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => onSendMessage(`🛡️ Safety first! ${safetyMessage}`, 'ai_suggestion')}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white border-0 shadow-md hover:shadow-lg hover:shadow-amber-200 transition-all duration-300 hover:scale-105"
              size="sm"
            >
              <Shield className="h-4 w-4 mr-2" />
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
    <Card className={cn("border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 hover-lift transition-all duration-300 shadow-lg", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="relative">
              <Sparkles className="h-5 w-5 text-amber-600 animate-pulse" />
              <div className="absolute inset-0 h-5 w-5 text-amber-400 animate-ping opacity-30">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent font-bold">
              AI Smart Suggestions
            </span>
            <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs animate-bounce-light border-0 shadow-md">
              ✨ AI
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
        {/* Enhanced Suggestion Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {suggestionButtons.map((button) => {
            const Icon = button.icon;
            const isActive = activeTab === button.id;
            return (
              <Button
                key={button.id}
                variant="outline"
                size="sm"
                onClick={button.action}
                disabled={loading}
                className={cn(
                  "flex items-center gap-2 text-xs h-12 min-h-[48px] transition-all duration-300 group relative overflow-hidden",
                  "hover:scale-105 hover:shadow-lg hover:shadow-amber-200",
                  isActive 
                    ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-amber-400 shadow-lg shadow-amber-200" 
                    : "bg-white hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 border-amber-200 text-amber-700 hover:border-amber-400"
                )}
                aria-label={`Generate ${button.label.toLowerCase()}`}
              >
                <div className={cn(
                  "transition-all duration-300",
                  isActive ? "text-white" : "text-amber-600 group-hover:text-amber-700"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={cn(
                  "font-medium transition-all duration-300",
                  isActive ? "text-white" : "text-amber-700 group-hover:text-amber-800"
                )}>
                  {button.label}
                </span>
                {/* Glow effect for active button */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-500 opacity-20 animate-pulse" />
                )}
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
              <div className="text-center py-6">
                <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-8 w-8 text-amber-600" />
                </div>
                <p className="text-sm text-amber-700 font-medium">
                  ✨ Tap a button above to get AI suggestions!
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Powered by intelligent algorithms
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