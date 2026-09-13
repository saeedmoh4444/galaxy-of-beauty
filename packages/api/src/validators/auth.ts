import { z } from 'zod';

// Saudi phone: +9665xxxxxxxx
const saudiPhone = z.string().regex(/^\+9665\d{8}$/, 'Invalid Saudi phone number');

// Common passwords blocklist (top 25 most breached)
const COMMON_PASSWORDS = new Set([
  'password',
  'password123',
  '12345678',
  '123456789',
  'qwerty123',
  'admin123',
  'letmein1',
  'welcome1',
  'football1',
  'iloveyou1',
  'Password1',
  'Password123',
  'Qwerty123',
  'Admin1234',
  'Welcome123',
  'Pa$$w0rd',
  'P@ssword1',
  'Galaxy123',
  'Beauty123',
]);

// Password: 8+ chars, uppercase, lowercase, digit, special char
const password = z
  .string()
  .min(8, 'كلمة المرور يجب أن تكون ٨ أحرف على الأقل')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير (A-Z)')
  .regex(/[a-z]/, 'يجب أن تحتوي على حرف صغير (a-z)')
  .regex(/[0-9]/, 'يجب أن تحتوي على رقم')
  .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/, 'يجب أن تحتوي على رمز خاص')
  .refine(
    (pwd) => !COMMON_PASSWORDS.has(pwd),
    'كلمة المرور شائعة جدا. الرجاء اختيار كلمة مرور أقوى.',
  )
  .refine((pwd) => !/(.)\1{2,}/.test(pwd), 'يجب ألا تحتوي على أحرف متكررة (٣ مرات متتالية)');

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
