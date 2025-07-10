export interface FlashRun {
  id: string;
  creator_id: string;
  title: string;
  distance: string;
  pace?: string;
  average_speed?: string;
  start_time: string;
  meeting_spot: string;
  meeting_coordinates?: any;
  max_participants: number;
  status: string;
  expires_at: string;
  created_at: string;
  sport_type: string;
  route_type?: string;
  creator?: {
    full_name: string;
    profile_picture_url?: string;
  };
  participants?: {
    id: string;
    user_id: string;
    status: string;
    user?: {
      full_name: string;
      profile_picture_url?: string;
    };
  }[];
  participant_count?: number;
  is_participant?: boolean;
}

export interface CreateFlashRunData {
  title: string;
  distance: string;
  pace?: string;
  average_speed?: string;
  start_time: string;
  meeting_spot: string;
  sport_type: string;
  route_type?: string;
  meeting_coordinates?: { lat: number; lng: number };
}