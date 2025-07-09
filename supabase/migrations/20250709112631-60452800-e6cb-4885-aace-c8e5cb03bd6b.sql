-- Create chatbot conversations table
CREATE TABLE public.chatbot_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id UUID DEFAULT gen_random_uuid()
);

-- Create chatbot feedback table
CREATE TABLE public.chatbot_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chatbot_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chatbot usage tracking table
CREATE TABLE public.chatbot_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  questions_used INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chatbot_conversations
CREATE POLICY "Users can view their own chatbot conversations" 
ON public.chatbot_conversations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chatbot conversations" 
ON public.chatbot_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for chatbot_feedback
CREATE POLICY "Users can view their own chatbot feedback" 
ON public.chatbot_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chatbot feedback" 
ON public.chatbot_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chatbot feedback" 
ON public.chatbot_feedback 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for chatbot_usage
CREATE POLICY "Users can view their own chatbot usage" 
ON public.chatbot_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chatbot usage" 
ON public.chatbot_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chatbot usage" 
ON public.chatbot_usage 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_chatbot_conversations_user_id ON public.chatbot_conversations(user_id);
CREATE INDEX idx_chatbot_conversations_session_id ON public.chatbot_conversations(session_id);
CREATE INDEX idx_chatbot_feedback_conversation_id ON public.chatbot_feedback(conversation_id);
CREATE INDEX idx_chatbot_usage_user_date ON public.chatbot_usage(user_id, date);