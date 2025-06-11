
import { ErrorDetails, ErrorType } from '@/types/error';

const generateErrorId = (): string => {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createError = (
  type: ErrorType,
  title: string,
  message: string,
  details?: string,
  actionable: boolean = true,
  retryable: boolean = false
): ErrorDetails => {
  return {
    id: generateErrorId(),
    type,
    title,
    message,
    details,
    timestamp: new Date(),
    actionable,
    retryable,
  };
};

export const createValidationError = (message: string, details?: string): ErrorDetails => {
  return createError(
    'validation',
    'Validation Error',
    message,
    details,
    true,
    false
  );
};

export const createNetworkError = (message: string = 'Network request failed', details?: string): ErrorDetails => {
  return createError(
    'network',
    'Network Error',
    message,
    details,
    true,
    true
  );
};

export const createAuthError = (message: string = 'Authentication failed', details?: string): ErrorDetails => {
  return createError(
    'auth',
    'Authentication Error',
    message,
    details,
    true,
    false
  );
};

export const createSystemError = (message: string = 'An unexpected error occurred', details?: string): ErrorDetails => {
  return createError(
    'system',
    'System Error',
    message,
    details,
    true,
    false
  );
};

export const createPermissionError = (message: string = 'Access denied', details?: string): ErrorDetails => {
  return createError(
    'permission',
    'Permission Error',
    message,
    details,
    true,
    false
  );
};

export const createTimeoutError = (message: string = 'Request timed out', details?: string): ErrorDetails => {
  return createError(
    'timeout',
    'Timeout Error',
    message,
    details,
    true,
    true
  );
};
