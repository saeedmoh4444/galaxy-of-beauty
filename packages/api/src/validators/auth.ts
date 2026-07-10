import { z } from 'zod';

// Saudi phone: +9665xxxxxxxx
const saudiPhone = z.string().regex(/^\+9665\d{8}$/, 'Invalid Saudi phone number');

// Password: 8+ chars, uppercase, lowercase, digit
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[0-9]/, 'Must contain a digit');

export const registerSchema = z.object({
  email: z.string().email(),
  phone: saudiPhone,
  password,
  name: z.string().min(2).max(100),
  role: z.enum(['CUSTOMER', 'TECHNICIAN']).default('CUSTOMER'),
  city: z.string().optional(),
  acceptedTerms: z.boolean().refine((v) => v === true, 'You must accept the terms'),
  termsVersion: z.string().default('1.0'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
  totpToken: z.string().length(6).optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: password,
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: password,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const twoFactorSetupSchema = z.object({
  // Returns secret + QR URI
});

export const twoFactorVerifySchema = z.object({
  token: z.string().length(6),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: saudiPhone.optional(),
  preferredLanguage: z.enum(['ar', 'en']).optional(),
  avatarUrl: z.string().url().optional(),
});

export const updateTechnicianSchema = z.object({
  city: z.string().optional(),
  area: z.string().optional(),
  bioAr: z.string().optional(),
  bioEn: z.string().optional(),
  isEcoFriendly: z.boolean().optional(),
  bufferMinutes: z.number().int().min(0).max(120).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateTechnicianInput = z.infer<typeof updateTechnicianSchema>;
