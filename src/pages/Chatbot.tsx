import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Bot, Send, ArrowLeft, Dumbbell, Clock, Users, Target, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const SMART_SUGGESTIONS = [
  { icon: Dumbbell, text: "Give me workout ideas for my sports", category: "workout" },
  { icon: Clock, text: "When's the best time to find workout partners?", category: "timing" },
  { icon: Users, text: "How do I find people with similar fitness goals?", category: "social" },
  { icon: Target, text: "Help me create a training plan", category: "planning" }
];

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm Stride AI, your intelligent fitness companion! 🏃‍♂️ I know your sports, fitness goals, and can help you find the perfect workout partners. I can provide personalized workout ideas, analyze your compatibility with other users, and suggest optimal times to connect. You get 8 questions per day. What would you like help with?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dailyUsage, setDailyUsage] = useState({ used: 0, remaining: 8 });
  const [sessionId] = useState(() => crypto.randomUUID());
  const { user, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      setDailyUsage({ used, remaining: 8 - used });
    } catch (error) {
      console.error('Error loading usage:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || dailyUsage.remaining <= 0) return;

    const userInput = input.trim();
    setInput('');
    setLoading(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: userInput,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await supabase.functions.invoke('stride-chatbot', {
        body: { question: userInput, sessionId },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to get AI response');
      }

      const { response: aiResponse, questionsRemaining, questionsUsed, isLimitReached } = response.data;

      // Update usage tracking
      if (questionsRemaining !== undefined && questionsUsed !== undefined) {
        setDailyUsage({ used: questionsUsed, remaining: questionsRemaining });
      }

      // Add AI response
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
      }]);

      // Show limit reached notification
      if (isLimitReached) {
        toast({
          title: "Daily Limit Reached",
          description: "You've used all 8 questions for today. Come back tomorrow!",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (dailyUsage.remaining > 0 && !loading) {
      setInput(suggestion);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to use the AI fitness assistant.
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
            <h1 className="text-2xl font-bold text-foreground">
              ✨ AI Fitness Assistant
            </h1>
            <p className="text-muted-foreground">
              Personalized fitness guidance based on your profile
            </p>
          </div>
          <div className="text-right">
            <div className="bg-gradient-to-r from-amber-100 to-yellow-100 px-3 py-2 rounded-lg border border-amber-200">
              <div className="text-sm font-bold text-amber-800">
                {dailyUsage.remaining} questions left
              </div>
              <div className="text-xs text-amber-600">today</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-2 rounded-full">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold">
                    AI Fitness Coach
                  </span>
                </CardTitle>
                <CardDescription>
                  ✨ Personalized fitness companion • {dailyUsage.remaining} questions remaining today
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[98%] rounded-lg px-4 py-3 shadow-md ${
                          message.isUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground border'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-muted border rounded-lg px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-muted-foreground border-t-primary"></div>
                            <div className="absolute inset-0 animate-pulse">
                              <div className="w-4 h-4 bg-primary rounded-full opacity-20"></div>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground font-medium">✨ Analyzing your profile...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      dailyUsage.remaining > 0 
                        ? "Ask me about workouts, timing, or finding partners..." 
                        : "Daily limit reached - come back tomorrow!"
                    }
                    disabled={loading || dailyUsage.remaining <= 0}
                    className="flex-1"
                    maxLength={500}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={loading || !input.trim() || dailyUsage.remaining <= 0}
                    className="px-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Smart Suggestions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-1 rounded-full">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span>
                    Smart Suggestions
                  </span>
                </CardTitle>
                <CardDescription>
                  ✨ AI-powered questions based on your profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {SMART_SUGGESTIONS.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-4 px-4 hover:bg-muted transition-all duration-300 hover-scale-102 group border border-transparent hover:border-border rounded-lg"
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    disabled={dailyUsage.remaining <= 0 || loading}
                  >
                    <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-2 rounded-full mr-3 group-hover:scale-110 transition-transform">
                      <suggestion.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{suggestion.text}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-2 rounded-full">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <span>
                    AI Features
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                  <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-2 rounded-full">
                    <Dumbbell className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-foreground font-medium">Sport-specific workout suggestions based on your chosen activities</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                  <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-2 rounded-full">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-foreground font-medium">Smart timing analysis for finding compatible workout partners</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                  <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-2 rounded-full">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-foreground font-medium">Compatibility insights based on your location and interests</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                  <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-2 rounded-full">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-foreground font-medium">Personalized advice using your fitness goals and experience level</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}