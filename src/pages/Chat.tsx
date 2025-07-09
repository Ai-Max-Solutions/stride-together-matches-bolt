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
  Clock
} from 'lucide-react';
import Navigation from '@/components/Navigation';

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
    const channel = supabase
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
          setMessages(prev => [...prev, newMessage]);
          
          // Mark as read if not from current user
          if (newMessage.sender_id !== user?.id) {
            supabase
              .from('messages')
              .update({ read_at: new Date().toISOString() })
              .eq('id', newMessage.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
        await sendMessage(`🏃‍♀️ Meetup Suggestion:\n\n${data.response}`, 'ai_suggestion');
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
      <Navigation />
      
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* Chat Header */}
        <Card className="mb-4">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/messages')}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <Avatar className="h-12 w-12">
                <AvatarImage src={otherUserProfile?.profile_picture_url} />
                <AvatarFallback>
                  {otherUserProfile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="font-semibold">{otherUserProfile?.full_name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {otherUserProfile?.city}, {otherUserProfile?.region}
                </div>
                <div className="flex gap-1 mt-1">
                  {otherUserProfile?.sports?.slice(0, 2).map((sport, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {sport}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={requestMeetup}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Plan Meetup
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        <Card className="flex flex-col h-[60vh]">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Start your conversation! Ask about their workout routine or suggest a meetup.</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.sender_id === user?.id;
                const isAiSuggestion = message.message_type === 'ai_suggestion';
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isAiSuggestion
                          ? 'bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20'
                          : isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {isAiSuggestion && (
                        <div className="flex items-center gap-1 mb-2 text-xs text-primary">
                          <Sparkles className="h-3 w-3" />
                          AI Suggestion
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                        isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        <Clock className="h-3 w-3" />
                        {formatTime(message.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })
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
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <ImageIcon className="h-4 w-4" />
              </Button>
              
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
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
                  }}
                />
                <Button 
                  onClick={() => sendMessage(newMessage)}
                  disabled={!newMessage.trim() || sending}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Safety Notice */}
        <Alert className="mt-4">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Stay Safe:</strong> Meet in public places, tell someone your plans, and trust your instincts. 
            Report any inappropriate behavior.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}