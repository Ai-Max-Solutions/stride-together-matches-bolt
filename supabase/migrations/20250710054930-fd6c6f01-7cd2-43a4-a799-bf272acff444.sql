-- Add last_active_at timestamp to profiles table for presence tracking
ALTER TABLE public.profiles 
ADD COLUMN last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for efficient presence queries
CREATE INDEX idx_profiles_last_active_at ON public.profiles(last_active_at);

-- Update existing profiles to have a last_active_at value
UPDATE public.profiles SET last_active_at = now() WHERE last_active_at IS NULL;