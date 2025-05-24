/**
 * Error Types
 * 
 * Definitions for error types used throughout the application
 */

/**
 * Error Type enum
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN'
}

/**
 * API Error interface
 */
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Validation Error interface
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Authentication Error interface
 */
export interface AuthError extends ApiError {
  expired?: boolean;
  requiresReauthentication?: boolean;
}

/**
 * TokenExpiredError class
 * Used to represent token expiration errors
 */
export class TokenExpiredError extends Error {
  constructor(message: string = 'Token has expired') {
    super(message);
    this.name = 'TokenExpiredError';
  }
}

/**
 * Error Severity enum
 */
export enum ErrorSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

/**
 * Error Response from API
 */
export interface ErrorResponse {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path?: string;
}

/**
 * Standard error object with consistent structure
 * Used for all error handling throughout the application
 */
export interface ApplicationError {
  message: string;
  code?: string;
  status?: number;
  validationErrors?: ValidationError[];
  originalError?: unknown;
  showUser?: boolean;
  retry?: boolean;
  timestamp?: string;
}

