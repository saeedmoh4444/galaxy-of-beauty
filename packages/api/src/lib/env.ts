import { z } from 'zod';

const envSchema = z.object({
  // ── Required ──────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  // ── Optional with defaults ────────────────────────────
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  PORT: z.coerce.number().int().positive().default(3000),

  // ── Optional service integrations ─────────────────────
  OPENAI_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.string().optional(),
  ZATCA_VAT_NUMBER: z.string().optional(),
  ZATCA_API_KEY: z.string().optional(),
  ZATCA_API_SECRET: z.string().optional(),
  ZATCA_API_URL: z.string().optional(),
  ZATCA_SIMULATE: z.string().optional(),
  PLATFORM_FEE_SAR: z.string().optional(),
  REFERRAL_CAMPAIGN_START: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  NEXT_PUBLIC_SOCKET_URL: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  LOG_LEVEL: z.string().optional(),

  // ── Email ──────────────────────────────────────────────
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // ── Payments (PayFort/APS) ─────────────────────────────
  PAYFORT_MERCHANT_ID: z.string().optional(),
  PAYFORT_ACCESS_CODE: z.string().optional(),
  PAYFORT_SHA_REQUEST_PHRASE: z.string().optional(),
  PAYFORT_SHA_RESPONSE_PHRASE: z.string().optional(),
  PAYFORT_SANDBOX: z.string().optional(),

  // ── SMS (Twilio/Unifonic) ──────────────────────────────
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // ── Google OAuth + Calendar ────────────────────────────
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // ── AWS S3 (Uploads) ──────────────────────────────────
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),

  // ── Expo (Mobile CI/CD) ───────────────────────────────
  EXPO_ACCESS_TOKEN: z.string().optional(),

  // ── Socket.IO ─────────────────────────────────────────
  SOCKET_PORT: z.string().optional(),

  // ── Business Config ───────────────────────────────────
  BUSINESS_NAME_AR: z.string().optional(),
  UPLOAD_DIR: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (!_env) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
      process.exit(1);
    }
    _env = parsed.data;
  }
  return _env;
}
