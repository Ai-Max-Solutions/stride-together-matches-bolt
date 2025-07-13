// CSRF protection utilities

const CSRF_TOKEN_KEY = 'csrf_token';

export class CSRFError extends Error {
  constructor(message: string = 'CSRF token validation failed') {
    super(message);
    this.name = 'CSRFError';
  }
}

// Generate and store CSRF token
export function initCSRFToken(): string {
  if (typeof window === 'undefined') return '';
  
  let token = sessionStorage.getItem(CSRF_TOKEN_KEY);
  
  if (!token) {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  }
  
  return token;
}

// Get current CSRF token
export function getCSRFToken(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(CSRF_TOKEN_KEY) || '';
}

// Validate CSRF token
export function validateCSRFToken(token: string): boolean {
  const sessionToken = getCSRFToken();
  return token === sessionToken && token.length === 64;
}

// Enhanced Supabase client wrapper with CSRF protection
export function createSecureSupabaseCall<T = any>(
  operation: () => Promise<T>,
  requireCSRF: boolean = true
) {
  return async (): Promise<T> => {
    if (requireCSRF && typeof window !== 'undefined') {
      const token = getCSRFToken();
      if (!token) {
        throw new CSRFError('CSRF token not found');
      }
    }
    
    try {
      return await operation();
    } catch (error) {
      // Log security-related errors (but not sensitive data)
      if (error instanceof CSRFError) {
        console.warn('CSRF validation failed');
      }
      throw error;
    }
  };
}

// Add CSRF token to headers for API calls
export function getSecureHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (typeof window !== 'undefined') {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }
  
  return headers;
}