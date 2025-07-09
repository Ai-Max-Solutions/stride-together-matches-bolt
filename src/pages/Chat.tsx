import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Send, 
  Image as ImageIcon, 
  Calendar,
  MapPin,
  Shield,
  MoreVertical,
  Sparkles,
  Clock,
  Flag,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { SmartSuggestions } from '@/components/chat/SmartSuggestions';
import { BlockReportDialog } from '@/components/chat/BlockReportDialog';
import { ReportUserDialog } from '@/components/chat/ReportUserDialog';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { SafetyTipsSheet } from '@/components/chat/SafetyTipsSheet';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { MobileNav } from '@/components/ui/mobile-nav';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'system' | 'ai_suggestion';
  created_at: string;
  read_at?: string;
  metadata: any;
}

interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  updated_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  profile_picture_url?: string;
  sports: string[];
  experience_level: string;
  city: string;
  region: string;
}

export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const { conversationId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [otherUserProfile, setOtherUserProfile] = useState<Profile | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [expandedMeetup, setExpandedMeetup] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showSafetyTips, setShowSafetyTips] = useState(false);
  
  const { isMobile } = useMobileDetection();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user && conversationId) {
      fetchConversationData();
      subscribeToMessages();
    }
  }, [user, authLoading, conversationId]);

  const fetchConversationData = async () => {
    try {
      setLoading(true);

      // Fetch conversation
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;
      setConversation(convData);

      // Determine other user ID
      const otherUserId = convData.participant_1_id === user?.id 
        ? convData.participant_2_id 
        : convData.participant_1_id;

      // Fetch profiles
      const [{ data: currentProfile }, { data: otherProfile }] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user?.id).single(),
        supabase.from('profiles').select('*').eq('user_id', otherUserId).single()
      ]);

      setCurrentUserProfile(currentProfile);
      setOtherUserProfile(otherProfile);

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages((messagesData || []) as Message[]);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user?.id)
        .is('read_at', null);

    } catch (err: any) {
      toast({
        title: "Error loading conversation",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    // Subscribe to new messages
    const messagesChannel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
          
          // Mark as read if not from current user
          if (newMessage.sender_id !== user?.id) {
            supabase
              .from('messages')
              .update({ read_at: new Date().toISOString() })
              .eq('id', newMessage.id);
          }
          
          // Auto-scroll to bottom after new message
          setTimeout(() => {
            scrollToBottom(true);
          }, 100);
        }
      )
      .subscribe();

    // Subscribe to typing indicators
    const typingChannel = supabase
      .channel(`typing-${conversationId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = typingChannel.presenceState();
        const otherUsersTyping = Object.values(state).flat()
          .filter((presence: any) => presence.user_id !== user?.id && presence.typing);
        setOtherUserTyping(otherUsersTyping.length > 0);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const otherUsersTyping = newPresences
          .filter((presence: any) => presence.user_id !== user?.id && presence.typing);
        if (otherUsersTyping.length > 0) {
          setOtherUserTyping(true);
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const otherUsersTyping = leftPresences
          .filter((presence: any) => presence.user_id !== user?.id && presence.typing);
        if (otherUsersTyping.length > 0) {
          setOtherUserTyping(false);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(typingChannel);
    };
  };

  const sendMessage = async (content: string, messageType: 'text' | 'ai_suggestion' = 'text') => {
    if (!content.trim() || !user || !conversationId) return;

    setSending(true);
    try {
      // Safety check for user messages (not AI suggestions)
      if (messageType === 'text') {
        const safetyCheck = await supabase.functions.invoke('chat-assistant', {
          body: {
            type: 'safety_check',
            message: content,
            conversationId
          }
        });

        if (safetyCheck.data && !safetyCheck.data.safe) {
          toast({
            title: "Message not sent",
            description: "This message contains inappropriate content.",
            variant: "destructive"
          });
          return;
        }
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: messageType
        });

      if (error) throw error;
      
      setNewMessage('');
      setShowSuggestions(false);
      
    } catch (err: any) {
      toast({
        title: "Failed to send message",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const getAiSuggestions = async (lastMessage: string) => {
    try {
      const { data } = await supabase.functions.invoke('chat-assistant', {
        body: {
          type: 'message_suggestion',
          message: lastMessage,
          userProfile: currentUserProfile,
          otherUserProfile,
          conversationId
        }
      });

      if (data?.response) {
        // Parse AI response to extract suggestions
        const suggestions = data.response
          .split('\n')
          .filter((line: string) => line.trim())
          .slice(0, 3);
        setAiSuggestions(suggestions);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('Error getting AI suggestions:', err);
    }
  };

  const requestMeetup = async () => {
    // Show safety tips first
    setShowSafetyTips(true);
  };

  const handleSafetyAccepted = async () => {
    try {
      const { data } = await supabase.functions.invoke('chat-assistant', {
        body: {
          type: 'meetup_planning',
          userProfile: currentUserProfile,
          otherUserProfile,
          conversationId
        }
      });

      if (data?.response) {
        // Shorten AI response to first 3 suggestions or 280 characters max
        const shortResponse = data.response
          .split('\n')
          .filter((line: string) => line.trim())
          .slice(0, 3)
          .join('\n')
          .substring(0, 280);
        
        const fullResponse = data.response;
        
        await sendMessage(`🏃‍♀️ Quick Meetup Ideas:\n\n${shortResponse}${fullResponse.length > 280 ? '...' : ''}`, 'ai_suggestion');
      }
    } catch (err) {
      console.error('Error requesting meetup:', err);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const scrollToBottom = (smooth = false) => {
    setTimeout(() => {
      const messagesContainer = document.querySelector('[data-messages-container]');
      if (messagesContainer) {
        messagesContainer.scrollTo({
          top: messagesContainer.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }, 50);
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      
      // Send typing status
      const typingChannel = supabase.channel(`typing-${conversationId}`);
      typingChannel.track({
        user_id: user?.id,
        typing: true,
        timestamp: Date.now()
      });
    }
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to stop typing
    const timeout = setTimeout(() => {
      setIsTyping(false);
      const typingChannel = supabase.channel(`typing-${conversationId}`);
      typingChannel.track({
        user_id: user?.id,
        typing: false,
        timestamp: Date.now()
      });
    }, 2000);
    
    setTypingTimeout(timeout);
  };

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading conversation...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {!isMobile && <Navigation />}
      
      <div className={cn(
        "container mx-auto px-4 max-w-4xl",
        isMobile ? "pt-4 pb-20" : "py-4"
      )}>
        {/* Chat Header */}
        <Card className="mb-4 rounded-xl shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/messages')}
                className="p-2 rounded-full"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                <AvatarImage src={otherUserProfile?.profile_picture_url} />
                <AvatarFallback className="bg-gradient-primary text-white">
                  {otherUserProfile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{otherUserProfile?.full_name}</h3>
                  {/* Always visible Report button on mobile */}
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReportDialog(true)}
                      className="p-1 h-6 w-6 rounded-full text-muted-foreground hover:text-destructive"
                      title="Report user"
                    >
                      <Flag className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {otherUserProfile?.city}, {otherUserProfile?.region}
                </div>
                <div className="flex gap-1 mt-1">
                  {otherUserProfile?.sports?.slice(0, 2).map((sport, index) => (
                    <Badge key={index} variant="secondary" className="text-xs rounded-full">
                      {sport}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                {!isMobile && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={requestMeetup}
                      className="rounded-full"
                      title="Get AI location & safety suggestions for a meetup"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Plan Meetup
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowSmartSuggestions(!showSmartSuggestions)}
                      className="rounded-full"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Assist
                    </Button>
                    {/* Desktop Report button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReportDialog(true)}
                      className="p-2 rounded-full text-muted-foreground hover:text-destructive"
                      title="Report user"
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <BlockReportDialog 
                  otherUserId={otherUserProfile?.user_id || ''}
                  otherUserName={otherUserProfile?.full_name || 'User'}
                  onBlock={() => navigate('/messages')}
                />
              </div>
            </div>
            
            {/* Mobile-only Plan Meetup button */}
            {isMobile && (
              <div className="flex gap-2 mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={requestMeetup}
                  className="flex-1 rounded-full"
                  title="Get AI location & safety suggestions for a meetup"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Plan Meetup
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSmartSuggestions(!showSmartSuggestions)}
                  className="flex-1 rounded-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Assist
                </Button>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Messages */}
        <Card className={cn(
          "flex flex-col rounded-xl shadow-sm bg-gradient-to-b from-background to-muted/20",
          isMobile ? "h-[calc(100vh-280px)]" : "h-[60vh]"
        )}>
          <CardContent 
            className="flex-1 overflow-y-auto p-4 space-y-4" 
            data-messages-container
            style={{
              scrollBehavior: 'smooth',
              overscrollBehavior: 'contain'
            }}
          >
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Start your conversation! Ask about their workout routine or suggest a meetup.</p>
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  const isOwn = message.sender_id === user?.id;
                  const isAiSuggestion = message.message_type === 'ai_suggestion';
                  const isLongContent = message.content.length > 280;
                  const isExpanded = expandedMeetup === message.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[85%] ${isMobile ? 'max-w-[90%]' : ''} rounded-2xl px-4 py-3 transition-all duration-200 ${
                          isAiSuggestion
                            ? 'bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl'
                            : isOwn
                            ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
                            : 'bg-muted rounded-2xl rounded-bl-md'
                        }`}
                      >
                        {isAiSuggestion && (
                          <div className="flex items-center gap-1 mb-2 text-xs text-primary font-medium">
                            <Sparkles className="h-3 w-3" />
                            AI Suggestion
                          </div>
                        )}
                        
                        <div>
                          {isAiSuggestion && isLongContent ? (
                            <>
                              <p className="whitespace-pre-wrap">
                                {isExpanded ? message.content : message.content.substring(0, 280) + '...'}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedMeetup(isExpanded ? null : message.id)}
                                className="mt-2 p-0 h-auto text-xs text-primary hover:text-primary/80"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="h-3 w-3 mr-1" />
                                    Show less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-3 w-3 mr-1" />
                                    View details
                                  </>
                                )}
                              </Button>
                            </>
                          ) : (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                        
                        <div className={`flex items-center justify-end gap-1 mt-2 text-xs ${
                          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          <Clock className="h-3 w-3" />
                          {formatTime(message.created_at)}
                          {/* Read receipt for own messages */}
                          {isOwn && message.read_at && (
                            <div className="flex items-center gap-1 ml-2">
                              <div className="w-1.5 h-1.5 bg-primary-foreground/50 rounded-full"></div>
                              <span className="text-[10px]">Read</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Typing Indicator */}
                <TypingIndicator 
                  userProfile={otherUserProfile} 
                  isVisible={otherUserTyping} 
                />
              </>
            )}
          </CardContent>

          {/* AI Suggestions */}
          {showSuggestions && aiSuggestions.length > 0 && (
            <div className="px-4 pb-2">
              <div className="flex items-center gap-2 mb-2 text-sm text-primary">
                <Sparkles className="h-4 w-4" />
                Quick replies:
              </div>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => sendMessage(suggestion.replace(/^\d+\.\s*/, ''))}
                  >
                    {suggestion.replace(/^\d+\.\s*/, '')}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className={cn(
            "p-4 border-t bg-background/80 backdrop-blur-sm",
            isMobile && "pb-6"
          )}>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="flex-shrink-0 rounded-full">
                <ImageIcon className="h-4 w-4" />
              </Button>
              
              <div className="flex-1 flex gap-3">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(newMessage);
                    }
                  }}
                  onFocus={() => {
                    if (messages.length > 0) {
                      const lastMessage = messages[messages.length - 1];
                      if (lastMessage.sender_id !== user?.id) {
                        getAiSuggestions(lastMessage.content);
                      }
                    }
                    // Scroll to bottom when focusing input on mobile
                    if (isMobile) {
                      setTimeout(() => scrollToBottom(true), 300);
                    }
                  }}
                  className={cn(
                    "rounded-full border-2 bg-background/80 backdrop-blur-sm transition-all",
                    isMobile && "min-h-[44px] text-base",
                    "focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  )}
                />
                <Button 
                  onClick={() => sendMessage(newMessage)}
                  disabled={!newMessage.trim() || sending}
                  size="icon"
                  className="rounded-full min-h-[44px] min-w-[44px]"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Smart AI Suggestions */}
        {showSmartSuggestions && currentUserProfile && otherUserProfile && (
          <div className="mt-4">
            <SmartSuggestions
              currentUser={currentUserProfile}
              otherUser={otherUserProfile}
              conversationHistory={messages}
              onSendMessage={sendMessage}
            />
          </div>
        )}

        {/* Safety Notice */}
        <Alert className="mt-4 rounded-xl border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <Shield className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            <strong>Stay Safe:</strong> Meet in public places, tell someone your plans, and trust your instincts. 
            <span className="text-muted-foreground">
              {' '}Tip: Report inappropriate behavior anytime.
            </span>
          </AlertDescription>
        </Alert>
      </div>
      
      {/* Safety Tips Sheet */}
      <SafetyTipsSheet
        isOpen={showSafetyTips}
        onClose={() => setShowSafetyTips(false)}
        onAccept={handleSafetyAccepted}
        meetupType="workout"
      />
      
      {/* Report Dialog */}
      <ReportUserDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        reportedUserId={otherUserProfile?.user_id || ''}
        reportedUserName={otherUserProfile?.full_name || 'User'}
      />
      
      {isMobile && <MobileNav />}
    </div>
  );
}