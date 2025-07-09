import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MessageSquare, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AISuggestionsProps {
  userProfile: any;
  otherUserProfile: any;
  onSuggestionSelect: (suggestion: string) => void;
  conversationId?: string;
}

interface Suggestion {
  text: string;
  type: 'starter' | 'ice_breaker' | 'activity';
  icon: any;
}

export function AISuggestions({ 
  userProfile, 
  otherUserProfile, 
  onSuggestionSelect,
  conversationId 
}: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState<'starter' | 'ice_breaker' | 'activity'>('starter');

  const generateSuggestions = async (type: 'conversation_starter' | 'ice_breaker' | 'workout_suggestion') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          type,
          userProfile,
          otherUserProfile,
          conversationId
        }
      });

      if (error) throw error;

      // Parse the AI response into suggestions
      const response = data.response;
      const suggestionLines = response.split('\n').filter((line: string) => 
        line.trim() && (line.includes('1.') || line.includes('2.') || line.includes('3.') || line.includes('-'))
      );

      const newSuggestions: Suggestion[] = suggestionLines.map((line: string) => ({
        text: line.replace(/^\d+\.\s*|-\s*/, '').trim(),
        type: type === 'conversation_starter' ? 'starter' : 
              type === 'ice_breaker' ? 'ice_breaker' : 'activity',
        icon: type === 'conversation_starter' ? MessageSquare :
              type === 'ice_breaker' ? Lightbulb : Sparkles
      }));

      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = async (type: 'starter' | 'ice_breaker' | 'activity') => {
    setActiveType(type);
    const aiType = type === 'starter' ? 'conversation_starter' :
                   type === 'ice_breaker' ? 'ice_breaker' : 'workout_suggestion';
    await generateSuggestions(aiType);
  };

  const getSharedInterests = () => {
    const sharedSports = userProfile?.sports?.filter((sport: string) => 
      otherUserProfile?.sports?.includes(sport)
    ) || [];
    
    return {
      sports: sharedSports,
      sameCity: userProfile?.city === otherUserProfile?.city,
      similarLevel: userProfile?.experience_level === otherUserProfile?.experience_level
    };
  };

  const shared = getSharedInterests();

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">AI Conversation Suggestions</span>
        </div>

        {/* Quick Context */}
        <div className="flex flex-wrap gap-1 mb-3">
          {shared.sports.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              Shared: {shared.sports.slice(0, 2).join(', ')}
            </Badge>
          )}
          {shared.sameCity && (
            <Badge variant="secondary" className="text-xs">
              Same city
            </Badge>
          )}
          {shared.similarLevel && (
            <Badge variant="secondary" className="text-xs">
              Similar level
            </Badge>
          )}
        </div>

        {/* Type Selector */}
        <div className="flex gap-2 mb-3">
          <Button
            variant={activeType === 'starter' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange('starter')}
            className="text-xs"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Starters
          </Button>
          <Button
            variant={activeType === 'ice_breaker' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange('ice_breaker')}
            className="text-xs"
          >
            <Lightbulb className="h-3 w-3 mr-1" />
            Ice Breakers
          </Button>
          <Button
            variant={activeType === 'activity' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange('activity')}
            className="text-xs"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Activities
          </Button>
        </div>

        {/* Suggestions */}
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-2">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => onSuggestionSelect(suggestion.text)}
                className="w-full text-left text-xs h-auto p-2 justify-start"
              >
                <suggestion.icon className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="line-clamp-2">{suggestion.text}</span>
              </Button>
            ))}
          </div>
        ) : suggestions.length === 0 && !loading ? (
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground mb-2">
              Get AI-powered conversation suggestions
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTypeChange('starter')}
              className="text-xs"
            >
              Generate Suggestions
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}