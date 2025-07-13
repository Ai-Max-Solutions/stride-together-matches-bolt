// Input validation utilities for security

export const ValidationError = class extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
};

// Sanitize string input to prevent XSS
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// Validate profile input data
export function validateProfileData(data: {
  sports?: string[];
  experience_level?: string;
  bio?: string;
  city?: string;
  region?: string;
  full_name?: string;
}) {
  const errors: Record<string, string> = {};

  // Validate sports
  if (data.sports) {
    if (data.sports.length > 10) {
      errors.sports = 'Maximum 10 sports allowed';
    }
    
    for (const sport of data.sports) {
      if (sport.length > 50) {
        errors.sports = 'Sport names must be under 50 characters';
        break;
      }
      if (/[<>"'&]/.test(sport)) {
        errors.sports = 'Sport names contain invalid characters';
        break;
      }
    }
  }

  // Validate experience level
  if (data.experience_level && !['beginner', 'intermediate', 'advanced'].includes(data.experience_level)) {
    errors.experience_level = 'Invalid experience level';
  }

  // Validate bio
  if (data.bio) {
    if (data.bio.length > 500) {
      errors.bio = 'Bio must be under 500 characters';
    }
    if (/[<>]/.test(data.bio)) {
      errors.bio = 'Bio contains invalid characters';
    }
  }

  // Validate location fields
  if (data.city) {
    if (data.city.length > 100) {
      errors.city = 'City name must be under 100 characters';
    }
    if (/[<>"'&]/.test(data.city)) {
      errors.city = 'City name contains invalid characters';
    }
  }

  if (data.region) {
    if (data.region.length > 100) {
      errors.region = 'Region name must be under 100 characters';
    }
    if (/[<>"'&]/.test(data.region)) {
      errors.region = 'Region name contains invalid characters';
    }
  }

  // Validate full name
  if (data.full_name) {
    if (data.full_name.length > 100) {
      errors.full_name = 'Full name must be under 100 characters';
    }
    if (/[<>"'&]/.test(data.full_name)) {
      errors.full_name = 'Full name contains invalid characters';
    }
  }

  if (Object.keys(errors).length > 0) {
    const error = new ValidationError('Validation failed');
    (error as any).errors = errors;
    throw error;
  }

  // Return sanitized data
  return {
    ...data,
    bio: data.bio ? sanitizeString(data.bio) : data.bio,
    city: data.city ? sanitizeString(data.city) : data.city,
    region: data.region ? sanitizeString(data.region) : data.region,
    full_name: data.full_name ? sanitizeString(data.full_name) : data.full_name,
  };
}

// Validate chat message input
export function validateChatMessage(message: string): string {
  if (!message || message.trim().length === 0) {
    throw new ValidationError('Message cannot be empty');
  }

  if (message.length > 1000) {
    throw new ValidationError('Message must be under 1000 characters');
  }

  // Allow basic formatting but remove dangerous content
  return message
    .replace(/<script[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// CSRF token utilities
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length === 64;
}