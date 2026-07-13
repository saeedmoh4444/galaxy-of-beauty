import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

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
    // SMTP not configured — log the email for development
    // eslint-disable-next-line no-console
    console.log(`[EMAIL] SMTP not configured. Would send to ${to}: "${subject}"`);
    // eslint-disable-next-line no-console
    console.log(`[EMAIL] Body preview: ${html.slice(0, 200)}`);
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
    // eslint-disable-next-line no-console
    console.error(`[EMAIL] Failed to send to ${to}:`, err);
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
