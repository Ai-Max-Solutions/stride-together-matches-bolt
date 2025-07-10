-- Phase 1: Gamification & Motivation System Database Setup

-- Create enum for achievement types
CREATE TYPE public.achievement_type AS ENUM (
  'first_connection',
  'social_butterfly', 
  'marathon_matcher',
  'early_bird',
  'consistent_connector',
  'meetup_master',
  'goal_achiever',
  'community_builder'
);

-- Create enum for challenge types
CREATE TYPE public.challenge_type AS ENUM (
  'weekly',
  'monthly',
  'seasonal'
);

-- Create enum for challenge status
CREATE TYPE public.challenge_status AS ENUM (
  'active',
  'completed',
  'expired'
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type achievement_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type challenge_type NOT NULL,
  target_count INTEGER NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status challenge_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_challenge_progress table
CREATE TABLE public.user_challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id),
  current_count INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Enable Row Level Security
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for achievements (public read)
CREATE POLICY "Achievements are viewable by everyone" 
ON public.achievements 
FOR SELECT 
USING (true);

-- Create policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for challenges (public read)
CREATE POLICY "Challenges are viewable by everyone" 
ON public.challenges 
FOR SELECT 
USING (true);

-- Create policies for user_challenge_progress
CREATE POLICY "Users can view their own challenge progress" 
ON public.user_challenge_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own challenge progress" 
ON public.user_challenge_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge progress" 
ON public.user_challenge_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_challenge_progress_updated_at
BEFORE UPDATE ON public.user_challenge_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial achievements
INSERT INTO public.achievements (type, title, description, icon, points) VALUES
('first_connection', 'First Connection', 'Connect with your first workout buddy', '🤝', 10),
('social_butterfly', 'Social Butterfly', 'Connect with 5+ people in a week', '🦋', 25),
('marathon_matcher', 'Marathon Matcher', 'Find 3+ people training for the same goal', '🏃‍♀️', 20),
('early_bird', 'Early Bird', 'Welcome to the community!', '🐣', 5),
('consistent_connector', 'Consistent Connector', 'Maintain a 7-day connection streak', '🔥', 30),
('meetup_master', 'Meetup Master', 'Complete 5 successful meetups', '⭐', 50),
('goal_achiever', 'Goal Achiever', 'Complete your first training goal', '🎯', 40),
('community_builder', 'Community Builder', 'Help 10 people find workout partners', '🏗️', 100);

-- Insert initial challenges
INSERT INTO public.challenges (title, description, type, target_count, points_reward, starts_at, ends_at) VALUES
('Weekly Connector', 'Find 2 new workout buddies this week', 'weekly', 2, 15, 
  date_trunc('week', now()), 
  date_trunc('week', now()) + interval '1 week'),
('Monthly Marathon', 'Complete 3 meetups in a month', 'monthly', 3, 50,
  date_trunc('month', now()),
  date_trunc('month', now()) + interval '1 month'),
('Social Sprint', 'Connect with 5 people this week', 'weekly', 5, 25,
  date_trunc('week', now()),
  date_trunc('week', now()) + interval '1 week');

-- Add training_goals field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN training_goals TEXT[] DEFAULT '{}';

-- Add trust_score field to profiles table  
ALTER TABLE public.profiles 
ADD COLUMN trust_score DECIMAL(3,2) DEFAULT 5.0;

-- Add total_points field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN total_points INTEGER DEFAULT 0;