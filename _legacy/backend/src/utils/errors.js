/**
 * Custom application error class with HTTP status code and error code.
 * Use this throughout the app for consistent error handling.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code
   * @param {string} errorCode - Machine-readable error code (e.g., 'BOOKING_SLOT_TAKEN')
   * @param {object} [details] - Additional error details
   */
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', details = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true; // Marks as expected error (vs programmer error)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error codes for consistent API responses.
 */
export const ErrorCodes = {
  // Auth
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  PHONE_ALREADY_EXISTS: 'PHONE_ALREADY_EXISTS',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Booking
  SLOT_NOT_AVAILABLE: 'SLOT_NOT_AVAILABLE',
  BOOKING_INVALID_STATE: 'BOOKING_INVALID_STATE',
  BOOKING_TIMEOUT: 'BOOKING_TIMEOUT',
  BOOKING_NOT_FOUND: 'BOOKING_NOT_FOUND',

  // Payment
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_AUTHORIZATION_FAILED: 'PAYMENT_AUTHORIZATION_FAILED',
  PAYMENT_CAPTURE_FAILED: 'PAYMENT_CAPTURE_FAILED',
  PAYMENT_REFUND_FAILED: 'PAYMENT_REFUND_FAILED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  INVALID_WITHDRAWAL: 'INVALID_WITHDRAWAL',

  // Wallet
  WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
  BELOW_MINIMUM_BALANCE: 'BELOW_MINIMUM_BALANCE',

  // Idempotency
  IDEMPOTENCY_KEY_REUSED: 'IDEMPOTENCY_KEY_REUSED',

  // Waitlist
  WAITLIST_FULL: 'WAITLIST_FULL',
  WAITLIST_EXPIRED: 'WAITLIST_EXPIRED',

  // Rate limit
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
};
