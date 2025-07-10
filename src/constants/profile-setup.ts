import { ProfileStep, ProfileData } from '@/types/profile';

export const PROFILE_SETUP_STEPS: ProfileStep[] = [
  { id: 'basic', title: 'Basic Info', description: 'Tell us about yourself' },
  { id: 'sports', title: 'Sports & Goals', description: 'Your activities and experience' },
  { id: 'location', title: 'Location & Preferences', description: 'Where and with whom you want to train' },
  { id: 'availability', title: 'Availability', description: 'When are you free to workout?' },
  { id: 'fitness', title: 'Fitness Details', description: 'Help us find your perfect workout buddy' },
  { id: 'review', title: 'Review', description: 'Confirm your profile details' }
];

export const DEFAULT_PROFILE_DATA: ProfileData = {
  full_name: '',
  bio: '',
  sports: [],
  experience_level: '',
  pace_metrics: {},
  fitness_goals: [],
  fitness_details: {},
  city: '',
  region: '',
  location_visible: true,
  availability: {},
  age_range_min: 18,
  age_range_max: 65,
  gender_preference: 'any',
  is_mentor_available: false,
  years_experience: 0,
  mentor_specialties: []
};