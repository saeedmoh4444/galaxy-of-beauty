import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Environment variable validation schema.
 * Application will refuse to start if required vars are missing.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().default('localhost'),
  API_PREFIX: z.string().default('/api'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_PASSWORD: z.string().optional(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // PayFort
  PAYFORT_MERCHANT_ID: z.string().optional(),
  PAYFORT_ACCESS_KEY: z.string().optional(),
  PAYFORT_SHA_REQUEST_PHRASE: z.string().optional(),
  PAYFORT_SHA_RESPONSE_PHRASE: z.string().optional(),
  PAYFORT_SANDBOX: z.coerce.boolean().default(true),
  PAYFORT_CURRENCY: z.string().default('SAR'),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),

  // Google Calendar
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Twilio (SMS)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // AWS S3
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('me-south-1'),
  AWS_S3_BUCKET: z.string().optional(),

  // Sentry
  SENTRY_DSN: z.string().url().optional(),

  // ZATCA
  ZATCA_CSID: z.string().optional(),
  ZATCA_PRIVATE_KEY_PATH: z.string().optional(),

  // Terms versioning
  TERMS_VERSION: z.string().default('1.0'),

  // Platform config
  PLATFORM_FEE_SAR: z.coerce.number().positive().default(11),
  PLATFORM_FEE_PERCENT: z.coerce.number().default(0),
  CASHBACK_FIRST_BOOKING_PERCENT: z.coerce.number().default(40),
  CASHBACK_SUBSEQUENT_PERCENT: z.coerce.number().default(5),
  WALLET_USAGE_MAX_PERCENT: z.coerce.number().default(10),
  TECHNICIAN_EARNINGS_PERCENT: z.coerce.number().default(99),
  TECHNICIAN_WALLET_SHARE_PERCENT: z.coerce.number().default(1),
  TECHNICIAN_PLATFORM_FEE_SHARE_PERCENT: z.coerce.number().default(25),
  MIN_WITHDRAWAL_BALANCE: z.coerce.number().positive().default(200),
  MIN_WITHDRAWAL_AMOUNT: z.coerce.number().positive().default(100),
  WITHDRAWAL_FEE_PERCENT: z.coerce.number().default(5),
  SUBSCRIPTION_BONUS: z.coerce.number().positive().default(50),
  BOOKING_REQUEST_TIMEOUT_MIN: z.coerce.number().positive().default(30),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX_GENERAL: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_MAX_AUTH: z.coerce.number().int().positive().default(20),
  RATE_LIMIT_MAX_ADMIN: z.coerce.number().int().positive().default(200),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export default env;
