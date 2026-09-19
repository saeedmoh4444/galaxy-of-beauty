/**
 * 6.5 — WhatsApp Business Cloud API transport.
 *
 * Proactive sends (booking reminders, subscription renewals) go through the
 * Cloud API when WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID are configured;
 * without credentials every call degrades to a silent no-op (returns false),
 * matching the failure-tolerant contract of the other notify channels
 * (email/sms/push — unconfigured providers log and return, never throw).
 *
 * User-initiated shares keep using the wa.me deep link (shared/whatsapp.ts)
 * and do not need this module.
 */

const WHATSAPP_API_BASE = 'https://graph.facebook.com/v21.0';

export function isWhatsAppConfigured(): boolean {
  return Boolean(process.env['WHATSAPP_TOKEN'] && process.env['WHATSAPP_PHONE_NUMBER_ID']);
}

/**
 * Normalize a phone to WhatsApp's required country-code format
 * (966xxxxxxxxx for KSA). Returns null for non-KSA numbers — the platform
 * is KSA-only, so foreign numbers are out of scope for proactive sends.
 */
export function normalizeKsaPhone(phone: string): string | null {
  let digits = phone.replace(/[^\d]/g, '');
  if (digits.startsWith('966')) return digits.length === 12 ? digits : null;
  if (digits.startsWith('0')) digits = `966${digits.slice(1)}`;
  else return null; // no KSA prefix — not a local/Saudi number
  return digits.length === 12 ? digits : null;
}

/**
 * Send a free-form text message through the WhatsApp Cloud API.
 * Never throws: unconfigured env, invalid numbers, non-ok responses and
 * network failures all log and return false.
 */
export async function sendWhatsAppText(phone: string, message: string): Promise<boolean> {
  const token = process.env['WHATSAPP_TOKEN'];
  const phoneNumberId = process.env['WHATSAPP_PHONE_NUMBER_ID'];
  if (!token || !phoneNumberId) return false;

  const to = normalizeKsaPhone(phone);
  if (!to) {
    console.warn(`[whatsapp] skip: non-KSA phone ${phone.slice(0, 6)}…`);
    return false;
  }

  try {
    const response = await fetch(`${WHATSAPP_API_BASE}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message.slice(0, 4096) },
      }),
    });
    if (!response.ok) {
      console.warn(`[whatsapp] Cloud API error ${response.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[whatsapp] send failed: ${(err as Error).message}`);
    return false;
  }
}
