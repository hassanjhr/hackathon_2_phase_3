/**
 * Error Handling Utilities
 * Feature: 003-frontend-integration
 *
 * Provides centralized error handling and user-friendly error messages
 */

import { ApiError, ErrorResponse, hasValidationErrors, HttpStatus } from '@/types';

/**
 * Convert backend error response to user-friendly message
 */
export function getErrorMessage(error: unknown): string {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Connection failed. Please check your internet connection.';
  }

  // API errors with custom message
  if (isApiErrorResponse(error)) {
    return error.message;
  }

  // Backend error responses
  if (isErrorResponse(error)) {
    if (typeof error.detail === 'string') {
      return error.detail;
    }

    if (hasValidationErrors(error)) {
      // Return first validation error message
      return error.detail[0]?.msg || 'Validation error occurred';
    }
  }

  // Generic error
  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Get all validation error messages from backend response
 */
export function getValidationErrors(error: unknown): Record<string, string> {
  const errors: Record<string, string> = {};

  if (isErrorResponse(error) && hasValidationErrors(error)) {
    error.detail.forEach((validationError) => {
      // Extract field name from location array (e.g., ["body", "email"] -> "email")
      const fieldName = validationError.loc[validationError.loc.length - 1];
      errors[fieldName] = validationError.msg;
    });
  }

  return errors;
}

/**
 * Get user-friendly message for HTTP status code
 */
export function getStatusMessage(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'Invalid request. Please check your input.';
    case HttpStatus.UNAUTHORIZED:
      return 'Authentication required. Please sign in.';
    case HttpStatus.FORBIDDEN:
      return 'Access denied. You do not have permission.';
    case HttpStatus.NOT_FOUND:
      return 'Resource not found.';
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return 'Validation error. Please check your input.';
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'Too many requests. Please try again later.';
    case HttpStatus.INTERNAL_SERVER_ERROR:
      return 'Something went wrong on our end. Please try again.';
    case HttpStatus.SERVICE_UNAVAILABLE:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
}

/**
 * Create ApiError from response
 */
export function createApiError(status: number, message?: string, details?: unknown): ApiError {
  return {
    status,
    message: message || getStatusMessage(status),
    details: Array.isArray(details) ? details : undefined,
  };
}

/**
 * Type guard for ApiError
 */
function isApiErrorResponse(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error
  );
}

/**
 * Type guard for ErrorResponse
 */
function isErrorResponse(error: unknown): error is ErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'detail' in error
  );
}

/**
 * Handle API error and return appropriate action
 */
export function handleApiError(error: unknown): {
  message: string;
  shouldRedirect: boolean;
  redirectTo?: string;
} {
  const message = getErrorMessage(error);

  // Check if it's an unauthorized error
  if (isApiErrorResponse(error) && error.status === HttpStatus.UNAUTHORIZED) {
    return {
      message,
      shouldRedirect: true,
      redirectTo: '/signin',
    };
  }

  return {
    message,
    shouldRedirect: false,
  };
}

/**
 * Log error for debugging (only in development)
 */
export function logError(context: string, error: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error);
  }
}
