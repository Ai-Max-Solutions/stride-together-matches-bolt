-- Add brand-related columns to challenges table
ALTER TABLE public.challenges 
ADD COLUMN brand_name TEXT,
ADD COLUMN brand_logo_url TEXT,
ADD COLUMN target_distance NUMERIC,
ADD COLUMN coupon_url TEXT,
ADD COLUMN coupon_code TEXT;

-- Update user_challenge_progress to track distance instead of just count
ALTER TABLE public.user_challenge_progress 
ADD COLUMN current_distance NUMERIC DEFAULT 0,
ADD COLUMN total_activities INTEGER DEFAULT 0;

-- Create function to award branded challenge completion
CREATE OR REPLACE FUNCTION public.complete_branded_challenge(
  p_user_id UUID,
  p_challenge_id UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge challenges%ROWTYPE;
  v_progress user_challenge_progress%ROWTYPE;
  v_achievement_id UUID;
  v_result JSON;
BEGIN
  -- Get challenge details
  SELECT * INTO v_challenge FROM public.challenges 
  WHERE id = p_challenge_id AND brand_name IS NOT NULL;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Challenge not found');
  END IF;
  
  -- Get user progress
  SELECT * INTO v_progress FROM public.user_challenge_progress 
  WHERE user_id = p_user_id AND challenge_id = p_challenge_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User not participating in challenge');
  END IF;
  
  -- Check if already completed
  IF v_progress.completed_at IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Challenge already completed');
  END IF;
  
  -- Check if target reached
  IF v_progress.current_distance < v_challenge.target_distance THEN
    RETURN json_build_object('success', false, 'error', 'Target distance not reached');
  END IF;
  
  -- Mark as completed
  UPDATE public.user_challenge_progress 
  SET completed_at = now(), updated_at = now()
  WHERE user_id = p_user_id AND challenge_id = p_challenge_id;
  
  -- Award points to user profile
  UPDATE public.profiles 
  SET total_points = COALESCE(total_points, 0) + v_challenge.points_reward
  WHERE user_id = p_user_id;
  
  -- Create achievement badge (we'll create a branded challenge achievement)
  SELECT id INTO v_achievement_id FROM public.achievements 
  WHERE type = 'community_builder' LIMIT 1;
  
  IF v_achievement_id IS NOT NULL THEN
    INSERT INTO public.user_achievements (user_id, achievement_id)
    VALUES (p_user_id, v_achievement_id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Return success with coupon info
  v_result := json_build_object(
    'success', true,
    'points_awarded', v_challenge.points_reward,
    'coupon_code', v_challenge.coupon_code,
    'coupon_url', v_challenge.coupon_url,
    'brand_name', v_challenge.brand_name
  );
  
  RETURN v_result;
END;
$$;

-- Insert sample branded challenges
INSERT INTO public.challenges (
  title, 
  description, 
  type, 
  target_count, 
  target_distance,
  points_reward, 
  starts_at, 
  ends_at, 
  status,
  brand_name,
  brand_logo_url,
  coupon_code,
  coupon_url
) VALUES 
(
  'Nike Run Club: 20K Challenge',
  'Complete 20 kilometers of running in 2 weeks and earn exclusive Nike rewards',
  'weekly',
  1,
  20.0,
  500,
  now(),
  now() + interval '2 weeks',
  'active',
  'Nike',
  'https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png',
  'NIKE20K2024',
  'https://nike.com/rewards'
),
(
  'Adidas Three Stripes Challenge',
  'Run 30K in 3 weeks to unlock special Adidas gear discounts',
  'monthly', 
  1,
  30.0,
  750,
  now(),
  now() + interval '3 weeks',
  'active',
  'Adidas',
  'https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png',
  'ADIDAS30K',
  'https://adidas.com/challenge-rewards'
);