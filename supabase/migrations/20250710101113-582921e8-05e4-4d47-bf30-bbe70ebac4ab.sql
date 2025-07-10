
-- Add mentor fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_mentor_available BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mentor_specialties TEXT[] DEFAULT '{}';

-- Create mentorships table to track mentor-mentee relationships
CREATE TABLE IF NOT EXISTS public.mentorships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  CHECK (mentor_id != mentee_id),
  CHECK (status IN ('active', 'completed', 'paused'))
);

-- Create unique constraint to ensure one active mentor per mentee per sport
CREATE UNIQUE INDEX IF NOT EXISTS idx_mentorships_active_unique 
ON public.mentorships (mentee_id, sport) 
WHERE status = 'active';

-- Enable RLS on mentorships table
ALTER TABLE public.mentorships ENABLE ROW LEVEL SECURITY;

-- RLS policies for mentorships
CREATE POLICY "Users can view their own mentorships" 
ON public.mentorships 
FOR SELECT 
USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

CREATE POLICY "Users can create mentorships as mentee" 
ON public.mentorships 
FOR INSERT 
WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Mentors and mentees can update their mentorships" 
ON public.mentorships 
FOR UPDATE 
USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_mentorships_mentor_id ON public.mentorships(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentee_id ON public.mentorships(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_status ON public.mentorships(status);
