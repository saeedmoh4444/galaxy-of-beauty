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
    ? `
      <div dir="rtl" style="font-family: Tahoma, sans-serif; max-width: 480px; margin: auto; padding: 24px;">
        <h2 style="color: #7c3aed;">مرحباً ${name}،</h2>
        <p>لقد طلبتِ إعادة تعيين كلمة المرور لحسابك في <strong>جالكسي بيوتي</strong>.</p>
        <p>انقري على الزر أدناه لإعادة تعيين كلمة المرور (صالح لمدة ساعة واحدة):</p>
        <a href="${resetUrl}" style="display: inline-block; background: #7c3aed; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; margin: 16px 0;">إعادة تعيين كلمة المرور</a>
        <p style="color: #6b7280; font-size: 14px;">إذا لم تطلبي إعادة التعيين، يمكنك تجاهل هذا البريد الإلكتروني.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">جالكسي بيوتي — منصتكِ للجمال والعناية</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px;">
        <h2 style="color: #7c3aed;">Hello ${name},</h2>
        <p>You requested a password reset for your <strong>Galaxy of Beauty</strong> account.</p>
        <p>Click the button below to reset your password (valid for 1 hour):</p>
        <a href="${resetUrl}" style="display: inline-block; background: #7c3aed; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; margin: 16px 0;">Reset Password</a>
        <p style="color: #6b7280; font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">Galaxy of Beauty — Your beauty & grooming platform</p>
      </div>
    `;

  await sendEmail({ to, subject, html });
}

/**
 * Send welcome email to newly registered user.
 */
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const subject = '✨ مرحباً بكِ في جالكسي بيوتي';
  const html = `
    <div dir="rtl" style="max-width:600px;margin:0 auto;font-family:Tajawal,sans-serif;background:#faf5ff;padding:20px;border-radius:16px">
      <div style="text-align:center;padding:30px">
        <h1 style="color:#7c3aed;margin:0">✨ جالكسي بيوتي</h1>
        <p style="font-size:20px;color:#111827;margin-top:16px">مرحباً ${name}!</p>
        <p style="color:#6b7280;line-height:1.8">
          شكراً لانضمامكِ إلى جالكسي بيوتي — منصتكِ الأولى لحجز خدمات التجميل في السعودية.
        </p>
        <div style="background:white;border-radius:12px;padding:20px;margin:20px 0;text-align:right">
          <p style="font-weight:700;color:#7c3aed">🎁 هدية ترحيبية:</p>
          <p style="color:#111827">استخدمي كود <strong style="color:#7c3aed;font-size:18px">WELCOME20</strong> للحصول على خصم ٢٠٪ على أول حجز!</p>
        </div>
        <a href="${process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'}/bookings/create" style="display:inline-block;background:#7c3aed;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;margin-top:12px">احجزي موعدكِ الأول</a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">جالكسي بيوتي — منصة التجميل الأولى في السعودية</p>
      </div>
    </div>`;

  await sendEmail({ to, subject, html });
}
