import { SHARE_URLS } from '../constants';

/**
 * WhatsApp deep-link share URL (wa.me — works from web and native
 * without the WhatsApp Business API; the OS/app picker resolves it).
 */
export function buildWhatsAppShareUrl(message: string): string {
  return `${SHARE_URLS.whatsapp}${encodeURIComponent(message)}`;
}
