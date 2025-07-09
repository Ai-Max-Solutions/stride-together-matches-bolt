-- Update profiles table to store detailed fitness metrics
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS fitness_details jsonb DEFAULT '{}'::jsonb;

-- Add index for better performance on fitness details queries
CREATE INDEX IF NOT EXISTS idx_profiles_fitness_details ON public.profiles USING GIN(fitness_details);

-- Add comment to explain the fitness_details structure
COMMENT ON COLUMN public.profiles.fitness_details IS 'Stores sport-specific fitness details like running pace, cycling speed, swimming stroke preferences, etc.';