
-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('user', 'club_organiser', 'admin');

-- Create user roles table
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    assigned_by UUID,
    UNIQUE (user_id, role)
);

-- Create organizations table for clubs/charities
CREATE TABLE public.organizations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    contact_email TEXT,
    organization_type TEXT NOT NULL DEFAULT 'club',
    verification_status TEXT NOT NULL DEFAULT 'pending',
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create club events table
CREATE TABLE public.club_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL,
    organiser_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    distance TEXT NOT NULL,
    meeting_point TEXT NOT NULL,
    meeting_coordinates JSONB,
    max_participants INTEGER DEFAULT 50,
    cause_description TEXT,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    event_status TEXT NOT NULL DEFAULT 'upcoming',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create club event participants table
CREATE TABLE public.club_event_participants (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL,
    user_id UUID NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    attendance_status TEXT NOT NULL DEFAULT 'registered',
    distance_logged NUMERIC,
    distance_verified BOOLEAN DEFAULT false,
    logged_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (event_id, user_id)
);

-- Create charity miles table
CREATE TABLE public.charity_miles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    event_id UUID NOT NULL,
    distance NUMERIC NOT NULL,
    event_date DATE NOT NULL,
    organization_name TEXT NOT NULL,
    cause_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_miles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create security definer function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS SETOF app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for organizations
CREATE POLICY "Everyone can view verified organizations" 
ON public.organizations 
FOR SELECT 
USING (verification_status = 'verified');

CREATE POLICY "Admins can manage all organizations" 
ON public.organizations 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for club_events
CREATE POLICY "Everyone can view upcoming club events" 
ON public.club_events 
FOR SELECT 
USING (event_status = 'upcoming' AND event_date > now());

CREATE POLICY "Club organisers can create events for their organizations" 
ON public.club_events 
FOR INSERT 
WITH CHECK (
    public.has_role(auth.uid(), 'club_organiser') 
    AND auth.uid() = organiser_id
    AND EXISTS (
        SELECT 1 FROM public.organizations 
        WHERE id = organization_id AND verification_status = 'verified'
    )
);

CREATE POLICY "Organisers can update their own events" 
ON public.club_events 
FOR UPDATE 
USING (auth.uid() = organiser_id);

CREATE POLICY "Admins can manage all club events" 
ON public.club_events 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for club_event_participants
CREATE POLICY "Users can view participants of events they joined" 
ON public.club_event_participants 
FOR SELECT 
USING (
    auth.uid() = user_id 
    OR EXISTS (
        SELECT 1 FROM public.club_event_participants p2 
        WHERE p2.event_id = club_event_participants.event_id 
        AND p2.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.club_events 
        WHERE id = club_event_participants.event_id 
        AND organiser_id = auth.uid()
    )
);

CREATE POLICY "Users can join club events" 
ON public.club_event_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" 
ON public.club_event_participants 
FOR UPDATE 
USING (
    auth.uid() = user_id 
    OR EXISTS (
        SELECT 1 FROM public.club_events 
        WHERE id = club_event_participants.event_id 
        AND organiser_id = auth.uid()
    )
);

CREATE POLICY "Users can leave events they joined" 
ON public.club_event_participants 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for charity_miles
CREATE POLICY "Users can view their own charity miles" 
ON public.charity_miles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own charity miles" 
ON public.charity_miles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_club_events_updated_at
    BEFORE UPDATE ON public.club_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_organizations_verification_status ON public.organizations(verification_status);
CREATE INDEX idx_club_events_event_date ON public.club_events(event_date);
CREATE INDEX idx_club_events_organization_id ON public.club_events(organization_id);
CREATE INDEX idx_club_events_organiser_id ON public.club_events(organiser_id);
CREATE INDEX idx_club_event_participants_event_id ON public.club_event_participants(event_id);
CREATE INDEX idx_club_event_participants_user_id ON public.club_event_participants(user_id);
CREATE INDEX idx_charity_miles_user_id ON public.charity_miles(user_id);
CREATE INDEX idx_charity_miles_event_date ON public.charity_miles(event_date);
