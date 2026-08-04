/**
 * Typed error catalog for the Galaxy of Beauty API.
 *
 * Every tRPC procedure throws typed TRPCError instances.
 * Import from here to ensure consistent error codes and messages.
 *
 * Usage:
 *   throw notFound('User', userId);
 *   throw unauthorized('Authentication required');
 *   throw validationError({ email: 'Invalid email format' });
 *   throw paymentFailed('Card declined');
 */

import { TRPCError } from '@trpc/server';

// ── Error factories ──

export function notFound(resource: string, id?: unknown): TRPCError {
  return new TRPCError({
    code: 'NOT_FOUND',
    message: id != null ? `${resource} not found (id: ${id})` : `${resource} not found`,
  });
}

export function unauthorized(message = 'Authentication required'): TRPCError {
  return new TRPCError({ code: 'UNAUTHORIZED', message });
}

export function forbidden(message = 'Insufficient permissions'): TRPCError {
  return new TRPCError({ code: 'FORBIDDEN', message });
}

export function conflict(message: string): TRPCError {
  return new TRPCError({ code: 'CONFLICT', message });
}

export function validationError(fields: Record<string, string>): TRPCError {
  return new TRPCError({
    code: 'BAD_REQUEST',
    message: Object.entries(fields)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', '),
  });
}

export function badRequest(message: string): TRPCError {
  return new TRPCError({ code: 'BAD_REQUEST', message });
}

export function tooManyRequests(message = 'Too many requests. Please try again later.'): TRPCError {
  return new TRPCError({ code: 'TOO_MANY_REQUESTS', message });
}

export function internalError(message = 'Internal server error'): TRPCError {
  return new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
}

export function paymentFailed(message: string): TRPCError {
  return new TRPCError({ code: 'PRECONDITION_FAILED', message: `Payment failed: ${message}` });
}

export function require2FA(): TRPCError {
  return new TRPCError({ code: 'PRECONDITION_FAILED', message: '2FA_REQUIRED' });
}

// ── Error codes (for reference / API docs) ──

export const ErrorCodes = {
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  BAD_REQUEST: 'BAD_REQUEST',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  PRECONDITION_FAILED: 'PRECONDITION_FAILED',
} as const;
