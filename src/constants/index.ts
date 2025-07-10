// Shared constants for the Stride Together app
export const SPORTS_OPTIONS = [
  'running', 'cycling', 'gym', 'swimming', 'tennis', 'basketball',
  'soccer', 'volleyball', 'hiking', 'yoga', 'crossfit', 'boxing'
];

export const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

export const FITNESS_GOALS = [
  'weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility',
  'general_fitness', 'competition_prep', 'stress_relief', 'first_marathon'
];

export const MENTOR_SPECIALTIES = [
  'pacing_strategies', 'injury_prevention', 'nutrition_planning', 
  'race_preparation', 'strength_training', 'form_technique',
  'mental_preparation', 'recovery_methods', 'goal_setting'
];

export const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

export const TIME_SLOTS = ['morning', 'afternoon', 'evening'];

export const BROWSE_SPORTS_OPTIONS = [
  'all', ...SPORTS_OPTIONS
];

export const BROWSE_EXPERIENCE_LEVELS = ['all', 'beginner', 'intermediate', 'advanced'];