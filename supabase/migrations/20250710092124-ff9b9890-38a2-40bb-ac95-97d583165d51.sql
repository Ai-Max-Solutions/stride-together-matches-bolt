-- Create flash_runs table
CREATE TABLE public.flash_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  distance TEXT NOT NULL,
  pace TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 minutes'),
  meeting_spot TEXT NOT NULL,
  meeting_coordinates JSONB,
  max_participants INTEGER NOT NULL DEFAULT 8,
  status TEXT NOT NULL DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flash_run_participants table
CREATE TABLE public.flash_run_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flash_run_id UUID NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'joined'
);

-- Add foreign key constraint
ALTER TABLE public.flash_run_participants
ADD CONSTRAINT flash_run_participants_flash_run_id_fkey 
FOREIGN KEY (flash_run_id) REFERENCES public.flash_runs(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.flash_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_run_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for flash_runs
CREATE POLICY "Users can view active flash runs" 
ON public.flash_runs 
FOR SELECT 
USING (status = 'active' AND expires_at > now());

CREATE POLICY "Users can create their own flash runs" 
ON public.flash_runs 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own flash runs" 
ON public.flash_runs 
FOR UPDATE 
USING (auth.uid() = creator_id);

-- RLS Policies for flash_run_participants
CREATE POLICY "Users can view flash run participants" 
ON public.flash_run_participants 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.flash_runs 
    WHERE flash_runs.id = flash_run_participants.flash_run_id 
    AND flash_runs.status = 'active' 
    AND flash_runs.expires_at > now()
  )
);

CREATE POLICY "Users can join flash runs" 
ON public.flash_run_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" 
ON public.flash_run_participants 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can leave flash runs" 
ON public.flash_run_participants 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_flash_runs_status_expires ON public.flash_runs(status, expires_at);
CREATE INDEX idx_flash_runs_creator ON public.flash_runs(creator_id);
CREATE INDEX idx_flash_run_participants_run_id ON public.flash_run_participants(flash_run_id);
CREATE INDEX idx_flash_run_participants_user_id ON public.flash_run_participants(user_id);

-- Create function to expire old flash runs
CREATE OR REPLACE FUNCTION public.expire_old_flash_runs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.flash_runs 
  SET status = 'expired'
  WHERE status = 'active' 
  AND expires_at <= now();
END;
$$;

-- Enable realtime for flash_runs
ALTER TABLE public.flash_runs REPLICA IDENTITY FULL;
ALTER TABLE public.flash_run_participants REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.flash_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.flash_run_participants;