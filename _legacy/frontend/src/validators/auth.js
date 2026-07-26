import { z } from 'zod';

/**
 * Saudi phone number: +9665XXXXXXXX or 05XXXXXXXX
 */
const saudiPhoneRegex = /^(\+9665\d{8}|05\d{8})$/;

const passwordSchema = z
  .string()
  .min(8, 'كلمة المرور يجب أن تكون ٨ أحرف على الأقل')
  .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير واحد على الأقل')
  .regex(/[a-z]/, 'يجب أن تحتوي على حرف صغير واحد على الأقل')
  .regex(/[0-9]/, 'يجب أن تحتوي على رقم واحد على الأقل');

// ---- Auth ----

export const registerSchema = z
  .object({
    name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100),
    email: z.string().email('بريد إلكتروني غير صالح'),
    phone: z.string().regex(saudiPhoneRegex, 'رقم جوال سعودي غير صالح'),
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.enum(['CUSTOMER', 'TECHNICIAN'], {
      errorMap: () => ({ message: 'يرجى اختيار الدور' }),
    }),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'يجب الموافقة على الشروط والأحكام' }),
    }),
    city: z.string().optional(),
    area: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(saudiPhoneRegex, 'رقم جوال غير صالح').optional(),
  preferredLanguage: z.enum(['ar', 'en']).optional(),
});

export const updateTechnicianSchema = z.object({
  city: z.string().min(1).max(100).optional(),
  area: z.string().max(100).optional().nullable(),
  hourlyRate: z.number().positive('يجب أن يكون السعر أكبر من صفر').optional(),
  bioJson: z
    .object({
      ar: z.string().max(1000, 'الوصف بالعربية لا يتجاوز ١٠٠٠ حرف'),
      en: z.string().max(1000),
    })
    .optional(),
});

export const createAddressSchema = z.object({
  label: z.string().min(1, 'الاسم مطلوب').max(50),
  city: z.string().min(1, 'المدينة مطلوبة').max(100),
  area: z.string().min(1, 'الحي مطلوب').max(100),
  street: z.string().min(1, 'الشارع مطلوب').max(200),
  building: z.string().max(50).optional().nullable(),
  floor: z.string().max(10).optional().nullable(),
  apartment: z.string().max(10).optional().nullable(),
  isDefault: z.boolean().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmNewPassword'],
  });
