-- Function to handle organization signup and role assignment
CREATE OR REPLACE FUNCTION public.handle_organization_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Check if this is an organization signup
  IF NEW.raw_user_meta_data->>'is_organization' = 'true' THEN
    -- Create organization record
    INSERT INTO public.organizations (
      name,
      organization_type,
      verification_status,
      contact_email
    ) VALUES (
      NEW.raw_user_meta_data->>'organization_name',
      NEW.raw_user_meta_data->>'organization_type',
      'pending',
      NEW.email
    ) RETURNING id INTO org_id;
    
    -- Assign club_organiser role
    INSERT INTO public.user_roles (user_id, role, assigned_by)
    VALUES (NEW.id, 'club_organiser', NEW.id);
    
    -- Update profile with organization reference
    UPDATE public.profiles 
    SET 
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name),
      email = NEW.email
    WHERE user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for organization signup
CREATE TRIGGER on_organization_signup
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_organization_signup();