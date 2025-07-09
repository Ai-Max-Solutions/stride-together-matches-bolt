import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MessageCircle, ThumbsUp, ThumbsDown, HelpCircle, Send, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Conversation {
  id: string;
  question: string;
  response: string;
  created_at: string;
  feedback?: boolean | null;
}

const FAQ_SUGGESTIONS = [
  "How do I find people who run at my pace?",
  "Is my exact location shared with other users?", 
  "How do I chat with someone safely?",
  "Can I block or report someone?",
  "How do I change my fitness goals?",
  "What's a good warm-up before a 5K?",
  "How many buddies can I match with?",
  "How do I stay safe meeting someone new?",
  "Why didn't I get any matches?",
  "Where can I give feedback about the app?"
];

export default function Chatbot() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionsRemaining, setQuestionsRemaining] = useState(5);
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  useEffect(() => {
    if (user) {
      loadTodaysUsage();
    }
  }, [user]);

  const loadTodaysUsage = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('chatbot_usage')
        .select('questions_used')
        .eq('user_id', user?.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading usage:', error);
        return;
      }

      const used = data?.questions_used || 0;
      setQuestionsRemaining(5 - used);
    } catch (error) {
      console.error('Error loading usage:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading || questionsRemaining <= 0) return;

    const currentQuestion = question.trim();
    setQuestion('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('stride-chatbot', {
        body: {
          question: currentQuestion,
          sessionId
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error === 'Daily limit reached') {
          toast({
            title: "Daily Limit Reached",
            description: data.message,
            variant: "destructive",
          });
          setQuestionsRemaining(0);
          return;
        }
        throw new Error(data.error);
      }

      const newConversation: Conversation = {
        id: data.conversationId,
        question: currentQuestion,
        response: data.response,
        created_at: new Date().toISOString()
      };

      setConversations(prev => [...prev, newConversation]);
      setQuestionsRemaining(data.questionsRemaining);

    } catch (error) {
      console.error('Error asking question:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (conversationId: string, isHelpful: boolean) => {
    try {
      const { error } = await supabase.functions.invoke('chatbot-feedback', {
        body: {
          conversationId,
          isHelpful
        }
      });

      if (error) throw error;

      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, feedback: isHelpful }
            : conv
        )
      );

      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve.",
      });

    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback.",
        variant: "destructive",
      });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (questionsRemaining > 0 && !isLoading) {
      setQuestion(suggestion);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to use the AI assistant.
            </p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">AI Assistant</h1>
            <p className="text-muted-foreground">
              Get help with the app, workout tips, and safety advice
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">
              {questionsRemaining} questions left
            </div>
            <div className="text-xs text-muted-foreground">today</div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Chat with Stride Assistant
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {conversations.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Hi! I'm your Stride Together assistant.</p>
                      <p className="text-sm mt-2">Ask me about using the app, workout tips, or safety advice!</p>
                    </div>
                  )}
                  
                  {conversations.map((conv) => (
                    <div key={conv.id} className="space-y-3">
                      {/* User Question */}
                      <div className="flex justify-end">
                        <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%]">
                          {conv.question}
                        </div>
                      </div>
                      
                      {/* Bot Response */}
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
                          {conv.response}
                          
                          {/* Feedback Buttons */}
                          {conv.feedback === undefined && (
                            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border">
                              <span className="text-xs text-muted-foreground">Was this helpful?</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleFeedback(conv.id, true)}
                                className="h-6 w-6 p-0"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleFeedback(conv.id, false)}
                                className="h-6 w-6 p-0"
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          
                          {conv.feedback !== undefined && (
                            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
                              <span className="text-xs text-muted-foreground">
                                Thanks for your feedback!
                              </span>
                              {conv.feedback ? (
                                <ThumbsUp className="h-3 w-3 text-green-600" />
                              ) : (
                                <ThumbsDown className="h-3 w-3 text-red-600" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <LoadingSpinner size="sm" message="Thinking..." />
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={questionsRemaining > 0 ? "Ask me anything about the app or workouts..." : "Daily limit reached"}
                    disabled={isLoading || questionsRemaining <= 0}
                    className="flex-1"
                    maxLength={500}
                  />
                  <Button 
                    type="submit" 
                    disabled={!question.trim() || isLoading || questionsRemaining <= 0}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Suggestions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HelpCircle className="h-5 w-5" />
                  Try asking...
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {FAQ_SUGGESTIONS.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2 px-3 whitespace-normal"
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={questionsRemaining <= 0 || isLoading}
                  >
                    {suggestion}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Important</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  💡 I can help with app features, basic workout tips, and safety advice.
                </p>
                <p>
                  🚫 I cannot provide medical, legal, or professional advice.
                </p>
                <p>
                  🔒 Always prioritize safety when meeting new workout partners.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}