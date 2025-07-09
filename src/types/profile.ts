export interface ProfileData {
  full_name: string;
  bio: string;
  sports: string[];
  experience_level: string;
  pace_metrics: Record<string, any>;
  fitness_goals: string[];
  city: string;
  region: string;
  location_visible: boolean;
  availability: Record<string, string[]>;
  age_range_min: number;
  age_range_max: number;
  gender_preference: string;
  profile_picture_url?: string;
}

export interface ProfileStep {
  id: string;
  title: string;
  description: string;
}