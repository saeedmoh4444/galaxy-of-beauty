/**
 * Email template renderer.
 *
 * Renders MJML templates → HTML with variable interpolation.
 * Falls back to a simple HTML template if MJML compilation fails
 * (e.g., in environments without the mjml package or during dev).
 *
 * Templates are stored in src/templates/emails/ as .mjml files.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.join(__dirname, 'emails');

/**
 * Available email templates (maps template name → .mjml file).
 */
const TEMPLATE_MAP = {
  booking_request: 'booking-request.mjml',
  booking_created: 'booking-request.mjml', // Reuse for customer confirmation
  booking_accepted: 'booking-request.mjml',
  payment_success: 'booking-request.mjml',
  booking_reminder: 'booking-request.mjml',
  review_request: 'booking-request.mjml',
  email_verification: 'booking-request.mjml',
  password_reset: 'booking-request.mjml',
};

/**
 * Render an email template with given variables.
 *
 * @param {string} templateName - Template identifier (e.g., 'booking_request')
 * @param {object} vars - Template variables
 * @returns {Promise<string>} Rendered HTML
 */
export async function renderEmail(templateName, vars = {}) {
  const mjmlFile = TEMPLATE_MAP[templateName];

  if (!mjmlFile) {
    logger.warn('Unknown email template, using fallback', { templateName });
    return renderFallback(vars);
  }

  const filePath = path.join(TEMPLATES_DIR, mjmlFile);

  try {
    let html;

    // Try MJML compilation first
    try {
      const mjmlContent = fs.readFileSync(filePath, 'utf-8');
      const mjml2html = (await import('mjml')).default;
      const result = mjml2html(mjmlContent, { minify: true });
      html = result.html;
    } catch (mjmlError) {
      // MJML not available or compilation failed — use the simple fallback
      logger.debug('MJML compilation unavailable, using HTML fallback', { error: mjmlError.message });
      html = renderFallback(vars);
    }

    // Variable interpolation
    const mergedVars = {
      logoUrl: vars.logoUrl || 'https://galaxyofbeauty.sa/logo.png',
      year: new Date().getFullYear(),
      titleAr: vars.title?.ar || 'جالكسي بيوتي',
      titleEn: vars.title?.en || 'Galaxy of Beauty',
      ...vars,
    };

    return interpolateVars(html, mergedVars);
  } catch (error) {
    logger.error('Email template rendering failed', { templateName, error: error.message });
    return renderFallback(vars);
  }
}

/**
 * Build a simple HTML email body (used when MJML is unavailable).
 */
function renderFallback(vars) {
  const title = vars.title?.ar || vars.title?.en || 'Galaxy of Beauty';
  const body = vars.body?.ar || vars.body?.en || '';
  const link = vars.link || '';
  const year = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: Tahoma, Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background: #F3F4F6; }
      .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; padding: 32px 24px; text-align: center; }
      .header h1 { margin: 0; font-size: 24px; }
      .body { padding: 24px; }
      .body p { margin: 8px 0; }
      .detail-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
      .detail-table td { padding: 8px 16px; border-bottom: 1px solid #E5E7EB; }
      .detail-table td:first-child { font-weight: 700; color: #6B7280; }
      .btn { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 16px 0; }
      .footer { text-align: center; padding: 16px; font-size: 12px; color: #9CA3AF; }
    </style></head>
    <body>
      <div class="container">
        <div class="header"><h1>✨ ${title}</h1></div>
        <div class="body">
          <p>${body}</p>
          ${link ? `<a class="btn" href="${link}">عرض التفاصيل</a>` : ''}
        </div>
        <div class="footer">&copy; ${year} Galaxy of Beauty. All rights reserved.</div>
      </div>
    </body></html>`;
}

/**
 * Replace {{variableName}} placeholders in the template.
 */
function interpolateVars(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return vars[key] !== undefined ? String(vars[key]) : match;
  });
}

/**
 * Get list of available template names.
 */
export function getAvailableTemplates() {
  return Object.keys(TEMPLATE_MAP);
}

export default { renderEmail, getAvailableTemplates };
