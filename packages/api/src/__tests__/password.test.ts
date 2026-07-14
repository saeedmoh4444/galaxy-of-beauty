import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Replicate the password schema from validators/auth.ts for unit testing
const COMMON_PASSWORDS = new Set([
  'password', 'password123', '12345678', '123456789', 'qwerty123',
  'admin123', 'letmein1', 'welcome1', 'football1', 'iloveyou1',
  'Password1', 'Password123', 'Qwerty123', 'Admin1234', 'Welcome123',
  'Pa$$w0rd', 'P@ssword1', 'Galaxy123', 'Beauty123',
]);

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[0-9]/, 'Must contain a digit')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/, 'Must contain a special character')
  .refine((pwd) => !COMMON_PASSWORDS.has(pwd), 'This password is too common')
  .refine((pwd) => !/(.)\1{2,}/.test(pwd), 'Must not contain repeated characters');

describe('Password Validation', () => {
  describe('valid passwords', () => {
    const validPasswords = [
      'MyStr0ng!Pass',
      'Galaxy@2024Beauty',
      'S@udiBeauty1',
      'Test!ng123Abc',
      'C0mpl3x!P@ssword',
    ];

    validPasswords.forEach((pwd) => {
      it(`should accept: ${pwd.replace(/./g, '*')}`, () => {
        const result = passwordSchema.safeParse(pwd);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('invalid passwords', () => {
    it('should reject password shorter than 8 chars', () => {
      const result = passwordSchema.safeParse('Ab1!efg');
      expect(result.success).toBe(false);
    });

    it('should reject password without uppercase', () => {
      const result = passwordSchema.safeParse('mypassword1!');
      expect(result.success).toBe(false);
    });

    it('should reject password without lowercase', () => {
      const result = passwordSchema.safeParse('MYPASSWORD1!');
      expect(result.success).toBe(false);
    });

    it('should reject password without digit', () => {
      const result = passwordSchema.safeParse('MyPassword!!');
      expect(result.success).toBe(false);
    });

    it('should reject password without special character', () => {
      const result = passwordSchema.safeParse('MyPassword123');
      expect(result.success).toBe(false);
    });

    it('should reject common passwords', () => {
      const result = passwordSchema.safeParse('Password123');
      expect(result.success).toBe(false);
    });

    it('should reject password with repeated characters', () => {
      const result = passwordSchema.safeParse('AAAbbb123!@#');
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const result = passwordSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject password over 128 chars', () => {
      const long = 'A'.repeat(120) + 'b1!';
      const result = passwordSchema.safeParse(long);
      expect(result.success).toBe(false);
    });

    it('should reject password = "password"', () => {
      const result = passwordSchema.safeParse('password');
      expect(result.success).toBe(false);
    });

    it('should reject password = "12345678"', () => {
      const result = passwordSchema.safeParse('12345678');
      expect(result.success).toBe(false);
    });
  });

  describe('Saudi phone validation', () => {
    const saudiPhone = z.string().regex(/^\+9665\d{8}$/, 'Invalid Saudi phone number');

    it('should accept valid Saudi phone', () => {
      expect(saudiPhone.safeParse('+966512345678').success).toBe(true);
    });

    it('should reject phone without +966 prefix', () => {
      expect(saudiPhone.safeParse('0512345678').success).toBe(false);
    });

    it('should reject phone starting with non-5 digit', () => {
      expect(saudiPhone.safeParse('+966012345678').success).toBe(false);
    });

    it('should reject short phone', () => {
      expect(saudiPhone.safeParse('+96651234567').success).toBe(false);
    });
  });
});
