import { describe, it, expect } from 'vitest';
import { buildWhatsAppShareUrl } from '@galaxy/shared';

describe('buildWhatsAppShareUrl', () => {
  it('builds a wa.me share link with the encoded message', () => {
    const url = buildWhatsAppShareUrl('My booking is confirmed! Code: GOB-123456');
    expect(url).toBe('https://wa.me/?text=My%20booking%20is%20confirmed!%20Code%3A%20GOB-123456');
  });

  it('percent-encodes Arabic text as UTF-8', () => {
    const url = buildWhatsAppShareUrl('تم تأكيد الحجز');
    expect(url.startsWith('https://wa.me/?text=')).toBe(true);
    expect(url).not.toContain(' ');
    expect(url.includes('%D8%AA%D9%85')).toBe(true); // "تم" encoded
  });

  it('encodes URLs and special characters safely', () => {
    const url = buildWhatsAppShareUrl('See https://example.com/book?code=1&x=2');
    expect(url).not.toContain('&x='); // bare ampersand would truncate the message
    expect(url).toContain('%3F');
  });
});
