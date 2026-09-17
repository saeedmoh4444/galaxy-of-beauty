import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { logger } from './logger';

// ── Configuration ──────────────────────────────────────────

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

let transporter: Transporter | null = null;

function getEmailConfig(): EmailConfig | null {
  const host = process.env['SMTP_HOST'];
  const port = process.env['SMTP_PORT'];
  const user = process.env['SMTP_USER'];
  const pass = process.env['SMTP_PASS'];
  const from = process.env['EMAIL_FROM'] || 'noreply@galaxyofbeauty.sa';

  if (!host || !user || !pass) {
    // SMTP not configured — emails will be logged only
    return null;
  }

  return {
    host,
    port: Number(port) || 587,
    user,
    pass,
    from,
  };
}

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const config = getEmailConfig();
  if (!config) return null;

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  return transporter;
}

// ── Public API ─────────────────────────────────────────────

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email. If SMTP is not configured, logs to console instead.
 * Always returns successfully — errors are caught and logged.
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const transport = getTransporter();
  const config = getEmailConfig();

  if (!transport || !config) {
    // SMTP not configured — log metadata only (never the email body)
    logger.warn({ to, subject, htmlLen: html.length }, 'SMTP not configured — email not sent');
    return;
  }

  try {
    await transport.sendMail({
      from: config.from,
      to,
      subject,
      html,
    });
  } catch (err) {
    // Log but don't throw — email failures should not break the API
    logger.error({ err, to, subject }, 'Failed to send email');
  }
}

/**
 * Dark-mode-aware email shell (ENHANCEMENT_PLAN 5.3).
 *
 * Declares color-scheme support so dark email clients invert the page
 * chrome, then swaps the hardcoded light surfaces (lavender wash, white
 * cards, gray text) via prefers-color-scheme media queries. Every
 * outbound template should run its body through this helper.
 */
export function emailShell(inner: string, dir: 'rtl' | 'ltr' = 'rtl'): string {
  return `
    <!doctype html>
    <html lang="${dir === 'rtl' ? 'ar' : 'en'}" dir="${dir}">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>
          :root { color-scheme: light dark; }
          body { margin: 0; padding: 0; }
          .gob-shell { background: #faf5ff; padding: 20px; }
          .gob-card { background: #ffffff; }
          .gob-text-strong { color: #111827; }
          .gob-text-soft { color: #6b7280; }
          .gob-text-muted { color: #9ca3af; }
          .gob-divider { border-color: #e5e7eb; }
          @media (prefers-color-scheme: dark) {
            .gob-shell { background: #1f1235; }
            .gob-card { background: #2d1b4e; }
            .gob-text-strong { color: #f5f3ff; }
            .gob-text-soft { color: #c4b5fd; }
            .gob-text-muted { color: #a78bfa; }
            .gob-divider { border-color: #4c3a75; }
          }
        </style>
      </head>
      <body>
        ${inner}
      </body>
    </html>
  `;
}

/**
 * Send a password reset email.
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetToken: string,
  locale: 'ar' | 'en' = 'ar',
): Promise<void> {
  const resetUrl = `${process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const isAr = locale === 'ar';

  const subject = isAr
    ? 'إعادة تعيين كلمة المرور - جالكسي بيوتي'
    : 'Password Reset - Galaxy of Beauty';

  const html = isAr
    ? emailShell(`
      <div style="font-family: Tahoma, sans-serif; max-width: 480px; margin: auto; padding: 24px;">
        <h2 style="color: #a78bfa;">مرحباً ${name}،</h2>
        <p class="gob-text-strong">لقد طلبتِ إعادة تعيين كلمة المرور لحسابك في <strong>جالكسي بيوتي</strong>.</p>
        <p class="gob-text-soft">انقري على الزر أدناه لإعادة تعيين كلمة المرور (صالح لمدة ساعة واحدة):</p>
        <a href="${resetUrl}" style="display: inline-block; background: #7c3aed; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; margin: 16px 0;">إعادة تعيين كلمة المرور</a>
        <p class="gob-text-soft" style="font-size: 14px;">إذا لم تطلبي إعادة التعيين، يمكنك تجاهل هذا البريد الإلكتروني.</p>
        <hr class="gob-divider" style="border: none; border-top: 1px solid; margin: 24px 0;" />
        <p class="gob-text-muted" style="font-size: 12px;">جالكسي بيوتي — منصتكِ للجمال والعناية</p>
      </div>
    `)
    : emailShell(
        `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px;">
        <h2 style="color: #a78bfa;">Hello ${name},</h2>
        <p class="gob-text-strong">You requested a password reset for your <strong>Galaxy of Beauty</strong> account.</p>
        <p class="gob-text-soft">Click the button below to reset your password (valid for 1 hour):</p>
        <a href="${resetUrl}" style="display: inline-block; background: #7c3aed; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; margin: 16px 0;">Reset Password</a>
        <p class="gob-text-soft" style="font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
        <hr class="gob-divider" style="border: none; border-top: 1px solid; margin: 24px 0;" />
        <p class="gob-text-muted" style="font-size: 12px;">Galaxy of Beauty — Your beauty & grooming platform</p>
      </div>
    `,
        'ltr',
      );

  await sendEmail({ to, subject, html });
}

/**
 * Send welcome email to newly registered user.
 */
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const subject = 'مرحباً بكِ في جالكسي بيوتي';
  const html = emailShell(`
    <div class="gob-shell" style="max-width:600px;margin:0 auto;font-family:Tajawal,sans-serif;border-radius:16px">
      <div style="text-align:center;padding:30px">
        <h1 style="color:#a78bfa;margin:0"> جالكسي بيوتي</h1>
        <p class="gob-text-strong" style="font-size:20px;margin-top:16px">مرحباً ${name}!</p>
        <p class="gob-text-soft" style="line-height:1.8">
          شكراً لانضمامكِ إلى جالكسي بيوتي — منصتكِ الأولى لحجز خدمات التجميل في السعودية.
        </p>
        <div class="gob-card" style="border-radius:12px;padding:20px;margin:20px 0;text-align:right">
          <p style="font-weight:700;color:#a78bfa"> هدية ترحيبية:</p>
          <p class="gob-text-strong">استخدمي كود <strong style="color:#a78bfa;font-size:18px">WELCOME20</strong> للحصول على خصم ٢٠٪ على أول حجز!</p>
        </div>
        <a href="${process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'}/bookings/create" style="display:inline-block;background:#7c3aed;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;margin-top:12px">احجزي موعدكِ الأول</a>
        <p class="gob-text-muted" style="font-size:12px;margin-top:24px">جالكسي بيوتي — منصة التجميل الأولى في السعودية</p>
      </div>
    </div>`);

  await sendEmail({ to, subject, html });
}
