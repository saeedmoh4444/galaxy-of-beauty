import { z } from 'zod';

/**
 * Saudi phone number regex: +9665XXXXXXXX or 05XXXXXXXX
 */
const saudiPhoneRegex = /^(\+9665\d{8}|05\d{8})$/;

/**
 * Password must be at least 8 chars, with uppercase, lowercase, and number.
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// =============================================================================
// Auth Schemas
// =============================================================================

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  phone: z.string().regex(saudiPhoneRegex, 'Invalid Saudi phone number (e.g., +9665XXXXXXXX)'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  password: passwordSchema,
  role: z.enum(['CUSTOMER', 'TECHNICIAN'], {
    errorMap: () => ({ message: 'Role must be CUSTOMER or TECHNICIAN' }),
  }),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
  // Technician-specific fields (optional for CUSTOMER)
  city: z.string().max(100).optional(),
  area: z.string().max(100).optional(),
  // Idempotency
  idempotencyKey: z.string().uuid().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

// =============================================================================
// Profile Schemas
// =============================================================================

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  phone: z.string().regex(saudiPhoneRegex, 'Invalid Saudi phone number').optional(),
  avatarUrl: z.string().url().optional().nullable(),
  preferredLanguage: z.enum(['ar', 'en']).optional(),
});

// =============================================================================
// Technician Schemas
// =============================================================================

export const updateTechnicianSchema = z.object({
  city: z.string().min(1).max(100).optional(),
  area: z.string().max(100).optional().nullable(),
  bioJson: z
    .object({
      ar: z.string().max(1000),
      en: z.string().max(1000),
    })
    .optional(),
  hourlyRate: z.number().positive().optional(),
});

// =============================================================================
// Address Schemas
// =============================================================================

export const createAddressSchema = z.object({
  label: z.string().min(1).max(50).trim(),
  city: z.string().min(1).max(100).trim(),
  area: z.string().min(1).max(100).trim(),
  street: z.string().min(1).max(200).trim(),
  building: z.string().max(50).optional().nullable(),
  floor: z.string().max(10).optional().nullable(),
  apartment: z.string().max(10).optional().nullable(),
  lat: z.number().min(-90).max(90).optional().nullable(),
  lng: z.number().min(-180).max(180).optional().nullable(),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();

// =============================================================================
// Admin Schemas
// =============================================================================

export const verifyKYCSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
  notes: z.string().max(500).optional(),
});

export const suspendUserSchema = z.object({
  reason: z.string().min(1).max(500),
});

// =============================================================================
// Export all schemas
// =============================================================================

export default {
  register: registerSchema,
  login: loginSchema,
  refreshToken: refreshTokenSchema,
  changePassword: changePasswordSchema,
  updateProfile: updateProfileSchema,
  updateTechnician: updateTechnicianSchema,
  createAddress: createAddressSchema,
  updateAddress: updateAddressSchema,
  verifyKYC: verifyKYCSchema,
  suspendUser: suspendUserSchema,
};
