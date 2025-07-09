import { useCallback } from 'react';
import { z } from 'zod';

const profileValidationSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  sports: z.array(z.string()).min(1, 'Please select at least one sport'),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'Please select your experience level'
  }),
  city: z.string().min(2, 'Please enter a valid city').optional(),
  region: z.string().min(2, 'Please enter a valid region').optional(),
  age_range_min: z.number().min(18, 'Minimum age must be 18').max(100),
  age_range_max: z.number().min(18, 'Maximum age must be 18').max(100),
  gender_preference: z.enum(['any', 'male', 'female'])
});

type ProfileData = z.infer<typeof profileValidationSchema>;

export function useProfileValidation() {
  const validateField = useCallback((field: keyof ProfileData, value: any) => {
    try {
      const fieldSchema = profileValidationSchema.shape[field];
      fieldSchema.parse(value);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || 'Invalid value';
      }
      return 'Invalid value';
    }
  }, []);

  const validateProfile = useCallback((data: Partial<ProfileData>) => {
    try {
      profileValidationSchema.parse(data);
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          errors[field] = err.message;
        });
        return { isValid: false, errors };
      }
      return { isValid: false, errors: { general: 'Validation failed' } };
    }
  }, []);

  const validateAgeRange = useCallback((min: number, max: number) => {
    if (min >= max) {
      return 'Minimum age must be less than maximum age';
    }
    if (max - min < 5) {
      return 'Age range should be at least 5 years';
    }
    return null;
  }, []);

  const validateSportsSelection = useCallback((sports: string[]) => {
    if (sports.length === 0) {
      return 'Please select at least one sport';
    }
    if (sports.length > 5) {
      return 'Please select no more than 5 sports';
    }
    return null;
  }, []);

  return {
    validateField,
    validateProfile,
    validateAgeRange,
    validateSportsSelection,
    schema: profileValidationSchema
  };
}