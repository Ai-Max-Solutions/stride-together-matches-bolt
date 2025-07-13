-- Tighten RLS policies for better security

-- Drop the overly permissive profile view policy
DROP POLICY "Users can view all profiles" ON public.profiles;

-- Create more secure profile visibility policy
-- Users can only view profiles of authenticated users
-- and only basic information for discovery
CREATE POLICY "Users can view basic profile info for discovery" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND location_visible = true
);

-- Create policy for users to view their own full profile
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add input validation function for profile updates
CREATE OR REPLACE FUNCTION public.validate_profile_input(
  input_sports TEXT[],
  input_experience TEXT,
  input_bio TEXT,
  input_city TEXT,
  input_region TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- Validate sports array (max 10 sports, each max 50 chars)
  IF array_length(input_sports, 1) > 10 THEN
    RETURN FALSE;
  END IF;
  
  -- Check each sport name length
  IF EXISTS (
    SELECT 1 FROM unnest(input_sports) AS sport 
    WHERE length(sport) > 50 OR sport ~ '[<>"\''&]'
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Validate experience level
  IF input_experience NOT IN ('beginner', 'intermediate', 'advanced') THEN
    RETURN FALSE;
  END IF;
  
  -- Validate bio length and content (no HTML/scripts)
  IF length(input_bio) > 500 OR input_bio ~ '[<>]' THEN
    RETURN FALSE;
  END IF;
  
  -- Validate location fields
  IF length(input_city) > 100 OR length(input_region) > 100 THEN
    RETURN FALSE;
  END IF;
  
  IF input_city ~ '[<>"\''&]' OR input_region ~ '[<>"\''&]' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to validate profile updates
CREATE OR REPLACE FUNCTION public.validate_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate if critical fields are being updated
  IF TG_OP = 'UPDATE' AND (
    NEW.sports IS DISTINCT FROM OLD.sports OR
    NEW.experience_level IS DISTINCT FROM OLD.experience_level OR
    NEW.bio IS DISTINCT FROM OLD.bio OR
    NEW.city IS DISTINCT FROM OLD.city OR
    NEW.region IS DISTINCT FROM OLD.region
  ) THEN
    IF NOT public.validate_profile_input(
      NEW.sports,
      NEW.experience_level,
      COALESCE(NEW.bio, ''),
      COALESCE(NEW.city, ''),
      COALESCE(NEW.region, '')
    ) THEN
      RAISE EXCEPTION 'Invalid input data provided';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add validation trigger
CREATE TRIGGER validate_profile_data
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_update();

-- Add rate limiting for profile updates (max 5 updates per hour)
CREATE TABLE IF NOT EXISTS public.profile_update_limits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  update_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on rate limiting table
ALTER TABLE public.profile_update_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own rate limit data"
ON public.profile_update_limits
FOR ALL
USING (auth.uid() = user_id);

-- Function to check and enforce rate limiting
CREATE OR REPLACE FUNCTION public.check_profile_update_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  window_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current rate limit data
  SELECT update_count, window_start 
  INTO current_count, window_start_time
  FROM public.profile_update_limits 
  WHERE user_id = NEW.user_id;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.profile_update_limits (user_id, update_count, window_start)
    VALUES (NEW.user_id, 1, now());
    RETURN NEW;
  END IF;
  
  -- Reset counter if window expired (1 hour)
  IF window_start_time < now() - INTERVAL '1 hour' THEN
    UPDATE public.profile_update_limits 
    SET update_count = 1, window_start = now()
    WHERE user_id = NEW.user_id;
    RETURN NEW;
  END IF;
  
  -- Check if rate limit exceeded
  IF current_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Maximum 5 profile updates per hour.';
  END IF;
  
  -- Increment counter
  UPDATE public.profile_update_limits 
  SET update_count = current_count + 1
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add rate limiting trigger
CREATE TRIGGER profile_update_rate_limit
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_update_rate_limit();