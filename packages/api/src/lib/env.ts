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
