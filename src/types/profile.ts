export interface FitnessDetails {
  running?: {
    fiveKTime?: string;
    averagePace?: string;
    longestRun?: string;
    preferredUnit?: 'km' | 'miles';
  };
  cycling?: {
    averageDistance?: string;
    averageSpeed?: string;
    preferredUnit?: 'km' | 'miles';
  };
  swimming?: {
    preferredStroke?: string;
    averageDistance?: string;
    comfortablePace?: string;
  };
  gym?: {
    workoutDuration?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
  };
}

export interface ProfileData {
  full_name: string;
  bio: string;
  sports: string[];
  experience_level: string;
  pace_metrics: Record<string, any>;
  fitness_goals: string[];
  fitness_details: FitnessDetails;
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