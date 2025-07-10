export type AppRole = 'user' | 'club_organiser' | 'admin';

export interface Organization {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  contact_email?: string;
  organization_type: 'club' | 'charity' | 'community_group';
  verification_status: 'pending' | 'verified' | 'rejected';
  verified_at?: string;
  verified_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ClubEvent {
  id: string;
  organization_id: string;
  organiser_id: string;
  title: string;
  description?: string;
  event_date: string;
  distance: string;
  meeting_point: string;
  meeting_coordinates?: any;
  max_participants: number;
  cause_description?: string;
  registration_deadline?: string;
  event_status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  organization?: Organization;
  participant_count?: number;
  is_joined?: boolean;
}

export interface ClubEventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  joined_at: string;
  attendance_status: 'registered' | 'attended' | 'no_show';
  distance_logged?: number;
  distance_verified: boolean;
  logged_at?: string;
}

export interface CharityMiles {
  id: string;
  user_id: string;
  event_id: string;
  distance: number;
  event_date: string;
  organization_name: string;
  cause_description?: string;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_at: string;
  assigned_by?: string;
}