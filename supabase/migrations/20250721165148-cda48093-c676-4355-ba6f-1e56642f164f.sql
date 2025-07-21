-- Security Fix 1: Update all database functions with secure search paths
-- This prevents search path injection attacks

-- Fix expire_old_flash_runs function
CREATE OR REPLACE FUNCTION public.expire_old_flash_runs()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
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

-- Fix has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Fix get_user_roles function
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
 RETURNS SETOF app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
$function$;

-- Fix complete_branded_challenge function
CREATE OR REPLACE FUNCTION public.complete_branded_challenge(p_user_id uuid, p_challenge_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

-- Fix log_role_change function
CREATE OR REPLACE FUNCTION public.log_role_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.user_role_audit (
      user_id, role, action, assigned_by, reason
    ) VALUES (
      NEW.user_id, NEW.role, 'assigned', NEW.assigned_by, 'Role assigned'
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.user_role_audit (
      user_id, role, action, assigned_by, reason
    ) VALUES (
      OLD.user_id, OLD.role, 'revoked', auth.uid(), 'Role revoked'
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Fix assign_user_role function
CREATE OR REPLACE FUNCTION public.assign_user_role(target_user_id uuid, target_role app_role, assignment_reason text DEFAULT 'Administrative assignment'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Check if the current user is an admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can assign roles';
  END IF;
  
  -- Prevent duplicate role assignments
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = target_user_id AND role = target_role
  ) THEN
    RAISE EXCEPTION 'User already has this role';
  END IF;
  
  -- Insert the role assignment
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (target_user_id, target_role, auth.uid());
  
  -- Log the assignment with reason
  UPDATE public.user_role_audit 
  SET reason = assignment_reason
  WHERE user_id = target_user_id 
    AND role = target_role 
    AND action = 'assigned'
    AND assigned_at = (
      SELECT MAX(assigned_at) 
      FROM public.user_role_audit 
      WHERE user_id = target_user_id AND role = target_role
    );
  
  RETURN TRUE;
END;
$function$;

-- Fix revoke_user_role function
CREATE OR REPLACE FUNCTION public.revoke_user_role(target_user_id uuid, target_role app_role, revocation_reason text DEFAULT 'Administrative revocation'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Check if the current user is an admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can revoke roles';
  END IF;
  
  -- Check if the role exists
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = target_user_id AND role = target_role
  ) THEN
    RAISE EXCEPTION 'User does not have this role';
  END IF;
  
  -- Delete the role assignment (trigger will handle audit logging)
  DELETE FROM public.user_roles 
  WHERE user_id = target_user_id AND role = target_role;
  
  RETURN TRUE;
END;
$function$;

-- Fix get_user_role_history function
CREATE OR REPLACE FUNCTION public.get_user_role_history(target_user_id uuid)
 RETURNS TABLE(role app_role, action text, assigned_by uuid, assigned_at timestamp with time zone, reason text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Only admins or the user themselves can view role history
  IF NOT (has_role(auth.uid(), 'admin') OR auth.uid() = target_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot view role history for this user';
  END IF;
  
  RETURN QUERY
  SELECT 
    ura.role,
    ura.action,
    ura.assigned_by,
    ura.assigned_at,
    ura.reason
  FROM public.user_role_audit ura
  WHERE ura.user_id = target_user_id
  ORDER BY ura.assigned_at DESC;
END;
$function$;

-- Security Fix 2: Secure organization signup process
-- Remove automatic role assignment and require admin verification

CREATE OR REPLACE FUNCTION public.handle_organization_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  org_id UUID;
BEGIN
  -- Check if this is an organization signup
  IF NEW.raw_user_meta_data->>'is_organization' = 'true' THEN
    -- Create organization record with pending verification
    INSERT INTO public.organizations (
      name,
      organization_type,
      verification_status,
      contact_email
    ) VALUES (
      NEW.raw_user_meta_data->>'organization_name',
      NEW.raw_user_meta_data->>'organization_type',
      'pending', -- Always start as pending
      NEW.email
    ) RETURNING id INTO org_id;
    
    -- DO NOT automatically assign club_organiser role
    -- This must be done by an admin after verification
    
    -- Update profile with organization reference
    UPDATE public.profiles 
    SET 
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name),
      email = NEW.email
    WHERE user_id = NEW.id;
    
    -- Log organization signup attempt for security monitoring
    INSERT INTO public.user_role_audit (
      user_id, 
      role, 
      action, 
      assigned_by, 
      reason
    ) VALUES (
      NEW.id, 
      'club_organiser', 
      'requested', 
      NEW.id, 
      'Organization signup - awaiting admin verification'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  RETURN NEW;
END;
$function$;

-- Fix update_conversation_timestamp function
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  UPDATE public.conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;

-- Fix get_or_create_conversation function
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(user1_id uuid, user2_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  conversation_id UUID;
BEGIN
  -- Check if conversation already exists (either direction)
  SELECT id INTO conversation_id
  FROM public.conversations
  WHERE (participant_1_id = user1_id AND participant_2_id = user2_id)
     OR (participant_1_id = user2_id AND participant_2_id = user1_id);
  
  -- If conversation doesn't exist, create it
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (participant_1_id, participant_2_id)
    VALUES (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id))
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$function$;

-- Security Fix 3: Add admin function to securely assign club organiser roles
CREATE OR REPLACE FUNCTION public.verify_organization_and_assign_role(
  target_user_id uuid, 
  organization_id uuid,
  verification_reason text DEFAULT 'Admin verification completed'
)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Only admins can verify organizations
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can verify organizations';
  END IF;
  
  -- Verify the organization exists and is pending
  IF NOT EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id AND verification_status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Organization not found or already verified';
  END IF;
  
  -- Update organization to verified
  UPDATE public.organizations 
  SET 
    verification_status = 'verified',
    verified_at = now(),
    verified_by = auth.uid()
  WHERE id = organization_id;
  
  -- Assign club_organiser role
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (target_user_id, 'club_organiser', auth.uid());
  
  -- Update audit log
  UPDATE public.user_role_audit 
  SET 
    action = 'assigned',
    assigned_by = auth.uid(),
    reason = verification_reason,
    assigned_at = now()
  WHERE user_id = target_user_id 
    AND role = 'club_organiser' 
    AND action = 'requested';
  
  RETURN TRUE;
END;
$function$;