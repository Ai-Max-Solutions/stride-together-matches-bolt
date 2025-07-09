import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  X, 
  Send, 
  ThumbsUp, 
  ThumbsDown,
  HelpCircle,
  Shield,
  Flag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMobileDetection } from '@/hooks/use-mobile-detection';

interface FloatingAssistantProps {
  className?: string;
}

interface Conversation {
  id: string;
  question: string;
  response: string;
  created_at: string;
  feedback?: boolean | null;
}

const QUICK_ACTIONS = [
  {
    title: "How to find matches",
    question: "How do I find people who run at my pace?",
    icon: "🏃‍♀️"
  },
  {
    title: "Safety tips",
    question: "How do I stay safe meeting someone new?",
    icon: "🛡️"
  },
  {
    title: "Report/Block user",
    question: "How can I block or report someone?",
    icon: "🚫"
  },
  {
    title: "Chat safely",
    question: "How do I chat with someone safely?",
    icon: "💬"
  },
  {
    title: "App troubleshooting",
    question: "Why didn't I get any matches?",
    icon: "❓"
  }
];

export function FloatingAssistant({ className }: FloatingAssistantProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useMobileDetection();
  
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionsRemaining, setQuestionsRemaining] = useState(5);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  useEffect(() => {
    if (user && isOpen) {
      loadTodaysUsage();
    }
  }, [user, isOpen]);

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
    setShowQuickActions(false);

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
        title: "Thanks!",
        description: "Your feedback helps us improve.",
      });

    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setQuestion(action.question);
    setShowQuickActions(false);
  };

  const isOnChatPage = location.pathname.startsWith('/chat/');
  
  // Position the floating button to avoid overlapping with chat input on chat pages
  const buttonPositionClass = isOnChatPage && isMobile 
    ? 'bottom-24 right-4' // Higher up on mobile chat pages
    : 'bottom-6 right-4';

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className={cn(
            "fixed z-50 h-12 w-12 rounded-full shadow-card hover:shadow-primary transition-all duration-300",
            "bg-gradient-primary text-white hover-lift animate-pulse-glow",
            buttonPositionClass,
            className
          )}
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Floating Assistant Panel */}
      {isOpen && (
        <div className={cn(
          "fixed z-50 transition-all duration-300",
          isMobile 
            ? "inset-x-4 bottom-4 top-16" 
            : "bottom-6 right-6 w-96 h-[500px]"
        )}>
          <Card className="h-full flex flex-col shadow-card hover-lift border-primary/20 glass-effect animate-scale-in">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  AI Assistant
                </CardTitle>
                <div className="flex items-center gap-2">
                  {user && (
                    <span className="text-xs text-muted-foreground">
                      {questionsRemaining} left today
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsOpen(false);
                      setConversations([]);
                      setShowQuickActions(true);
                    }}
                    className="h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
              {!user ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <HelpCircle className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold mb-2">Sign in for AI help</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get personalized workout tips and safety advice
                    </p>
                    <Button onClick={() => navigate('/auth')} size="sm">
                      Sign In
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                    {conversations.length === 0 && showQuickActions && (
                      <div className="space-y-3">
                        <div className="text-center py-2">
                          <p className="text-sm font-medium">How can I help you?</p>
                          <p className="text-xs text-muted-foreground">
                            Tap a topic below or ask me anything
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          {QUICK_ACTIONS.map((action, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuickAction(action)}
                              className="w-full justify-start text-left h-auto py-2 px-3"
                              disabled={questionsRemaining <= 0}
                            >
                              <span className="mr-2">{action.icon}</span>
                              <span className="text-xs">{action.title}</span>
                            </Button>
                          ))}
                        </div>

                        <div className="pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowQuickActions(false)}
                            className="w-full"
                          >
                            <ChevronUp className="h-3 w-3 mr-1" />
                            Ask custom question
                          </Button>
                        </div>
                      </div>
                    )}

                    {(!showQuickActions || conversations.length > 0) && (
                      <>
                        {conversations.map((conv) => (
                          <div key={conv.id} className="space-y-2">
                            {/* User Question */}
                            <div className="flex justify-end">
                              <div className="bg-gradient-primary text-primary-foreground rounded-lg px-3 py-2 max-w-[85%] text-sm">
                                {conv.question}
                              </div>
                            </div>
                            
                            {/* Bot Response */}
                <div className="flex justify-start">
                              <div className="bg-gradient-to-r from-muted via-muted/90 to-muted rounded-lg px-3 py-2 max-w-[85%] text-sm">
                                {conv.response}
                                
                                {/* Feedback Buttons */}
                                {conv.feedback === undefined && (
                                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
                                    <span className="text-xs text-muted-foreground">Helpful?</span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleFeedback(conv.id, true)}
                                      className="h-5 w-5 p-0 hover-scale"
                                    >
                                      <ThumbsUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleFeedback(conv.id, false)}
                                      className="h-5 w-5 p-0 hover-scale"
                                    >
                                      <ThumbsDown className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                                Thinking...
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Form */}
                  {(!showQuickActions || conversations.length > 0) && (
                    <form onSubmit={handleSubmit} className="flex gap-2 border-t pt-3">
                      <Input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder={questionsRemaining > 0 ? "Ask me anything..." : "Daily limit reached"}
                        disabled={isLoading || questionsRemaining <= 0}
                        className="flex-1 text-sm"
                        maxLength={200}
                      />
                      <Button 
                        type="submit" 
                        disabled={!question.trim() || isLoading || questionsRemaining <= 0}
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                    </form>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}