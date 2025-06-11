
import { ErrorDetails, ErrorType } from '@/types/error';

// Fallback error configurations for when database is unavailable
const fallbackErrors: Record<string, Omit<ErrorDetails, 'timestamp'>> = {
  'SYS_001': {
    error_code: 'SYS_001',
    type: 'system',
    title: 'System Error',
    message: 'An unexpected error occurred',
    description: 'The system encountered an unexpected error. Please try again.',
    possible_causes: ['System overload', 'Temporary service disruption'],
    action_items: ['Try again in a few moments', 'Contact support if problem persists'],
    is_retryable: true,
    severity: 'medium'
  }
};

export const createErrorFromCode = async (
  errorCode: string,
  customMessage?: string,
  customDetails?: string
): Promise<ErrorDetails> => {
  try {
    // Use type assertion to bypass TypeScript limitation with new table
    const { data: config } = await (supabase as any)
      .from('error_configurations')
      .select('*')
      .eq('error_code', errorCode)
      .maybeSingle();

    if (config) {
      return {
        error_code: config.error_code,
        type: config.error_type as ErrorType,
        title: config.title,
        message: customMessage || config.message,
        description: customDetails || config.description,
        possible_causes: config.possible_causes,
        action_items: config.action_items,
        timestamp: new Date(),
        is_retryable: config.is_retryable,
        severity: config.severity as 'low' | 'medium' | 'high' | 'critical'
      };
    }
  } catch (error) {
    console.error('Failed to fetch error configuration:', error);
  }

  // Fallback to predefined error or generic error
  const fallback = fallbackErrors[errorCode] || fallbackErrors['SYS_001'];
  return {
    ...fallback,
    message: customMessage || fallback.message,
    description: customDetails || fallback.description,
    timestamp: new Date()
  };
};

// Add missing import
import { supabase } from '@/integrations/supabase/client';

export const createError = (
  type: ErrorType,
  title: string,
  message: string,
  description?: string,
  is_retryable: boolean = false,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): ErrorDetails => {
  return {
    error_code: 'CUSTOM_ERROR',
    type,
    title,
    message,
    description,
    timestamp: new Date(),
    is_retryable,
    severity,
  };
};

// Convenience functions for common errors
export const createValidationError = (message: string, description?: string): ErrorDetails => {
  return createError('validation', 'Validation Error', message, description, false, 'low');
};

export const createNetworkError = (message: string = 'Network request failed', description?: string): ErrorDetails => {
  return createError('network', 'Network Error', message, description, true, 'medium');
};

export const createAuthError = (message: string = 'Authentication failed', description?: string): ErrorDetails => {
  return createError('auth', 'Authentication Error', message, description, false, 'medium');
};

export const createSystemError = (message: string = 'An unexpected error occurred', description?: string): ErrorDetails => {
  return createError('system', 'System Error', message, description, true, 'high');
};

export const createPermissionError = (message: string = 'Access denied', description?: string): ErrorDetails => {
  return createError('permission', 'Permission Error', message, description, false, 'medium');
};

export const createTimeoutError = (message: string = 'Request timed out', description?: string): ErrorDetails => {
  return createError('timeout', 'Timeout Error', message, description, true, 'medium');
};
