-- Extend flash_runs table to support multiple sports (flash_events)
-- Add new columns for sport-specific functionality
ALTER TABLE public.flash_runs 
ADD COLUMN sport_type TEXT NOT NULL DEFAULT 'running';

ALTER TABLE public.flash_runs 
ADD COLUMN route_type TEXT; -- For cycling: 'road', 'gravel', 'mixed'

ALTER TABLE public.flash_runs 
ADD COLUMN average_speed TEXT; -- For cycling speed in km/h

-- Create index for sport_type filtering
CREATE INDEX idx_flash_runs_sport_type ON public.flash_runs(sport_type);

-- Create index for sport_type and status filtering
CREATE INDEX idx_flash_runs_sport_status ON public.flash_runs(sport_type, status, expires_at);

-- Update the expire function to handle different expiration rules per sport
CREATE OR REPLACE FUNCTION public.expire_old_flash_runs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Update expired flash runs/rides based on sport-specific rules
  UPDATE public.flash_runs 
  SET status = 'expired'
  WHERE status = 'active' 
  AND (
    -- Running events: expire 1 hour after start
    (sport_type = 'running' AND start_time + INTERVAL '1 hour' <= now()) 
    OR 
    -- Cycling events: expire 2 hours after start
    (sport_type = 'cycling' AND start_time + INTERVAL '2 hours' <= now())
    OR
    -- All events: expire if past their original expires_at time
    expires_at <= now()
  );
END;
$function$;