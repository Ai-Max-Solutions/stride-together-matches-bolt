-- Security Enhancement: Fix Role Elevation Vulnerability
-- This migration addresses the critical security issue where users could potentially self-assign admin roles

-- 1. Create audit log table for role changes
CREATE TABLE IF NOT EXISTS public.user_role_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('assigned', 'revoked')),
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT,
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on audit table
ALTER TABLE public.user_role_audit ENABLE ROW LEVEL SECURITY;

-- 2. Update user_roles table to make assigned_by NOT NULL for new records
-- First, update existing records that have NULL assigned_by
UPDATE public.user_roles 
SET assigned_by = user_id 
WHERE assigned_by IS NULL;

-- Add constraint to prevent NULL assigned_by for future records
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_assigned_by_required 
CHECK (assigned_by IS NOT NULL);

-- 3. Create security function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger for role change logging
DROP TRIGGER IF EXISTS trigger_log_role_changes ON public.user_roles;
CREATE TRIGGER trigger_log_role_changes
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_role_change();

-- 5. Drop existing permissive policies and create restrictive ones
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create new restrictive policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can assign admin roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  -- Only admins can assign admin roles
  (role = 'admin' AND has_role(auth.uid(), 'admin')) OR
  -- Only admins can assign club_organiser roles
  (role = 'club_organiser' AND has_role(auth.uid(), 'admin')) OR
  -- Users cannot assign any roles to themselves (prevent self-elevation)
  FALSE
);

CREATE POLICY "Only admins can revoke roles" 
ON public.user_roles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "No updates allowed on roles" 
ON public.user_roles 
FOR UPDATE 
USING (FALSE);

-- 6. Create secure role assignment function that only admins can use
CREATE OR REPLACE FUNCTION public.assign_user_role(
  target_user_id UUID,
  target_role app_role,
  assignment_reason TEXT DEFAULT 'Administrative assignment'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- 7. Create secure role revocation function
CREATE OR REPLACE FUNCTION public.revoke_user_role(
  target_user_id UUID,
  target_role app_role,
  revocation_reason TEXT DEFAULT 'Administrative revocation'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- 8. Create audit policies (admins can view all audit logs)
CREATE POLICY "Admins can view all role audit logs" 
ON public.user_role_audit 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own role audit logs" 
ON public.user_role_audit 
FOR SELECT 
USING (auth.uid() = user_id);

-- 9. Create indexes for performance and security monitoring
CREATE INDEX IF NOT EXISTS idx_user_role_audit_user_id ON public.user_role_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_audit_assigned_by ON public.user_role_audit(assigned_by);
CREATE INDEX IF NOT EXISTS idx_user_role_audit_assigned_at ON public.user_role_audit(assigned_at DESC);

-- 10. Create function to get role assignment history
CREATE OR REPLACE FUNCTION public.get_user_role_history(target_user_id UUID)
RETURNS TABLE (
  role app_role,
  action TEXT,
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE,
  reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;