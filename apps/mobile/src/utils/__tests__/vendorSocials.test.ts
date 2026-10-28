import { describe, it, expect } from 'vitest';
import { socialLinksPatch } from '../vendorSocials';

describe('socialLinksPatch', () => {
  it('returns only the networks that actually changed', () => {
    const patch = socialLinksPatch(
      { snapchat: 'https://snapchat.com/add/store', tiktok: 'https://tiktok.com/@store' },
      {
        snapchat: 'https://snapchat.com/add/store',
        tiktok: 'https://tiktok.com/@new-handle',
        instagram: 'https://instagram.com/store',
      },
    );
    expect(patch).toEqual({
      tiktok: 'https://tiktok.com/@new-handle',
      instagram: 'https://instagram.com/store',
    });
  });

  it("maps an emptied field to the remove sentinel ('')", () => {
    const patch = socialLinksPatch({ facebook: 'https://facebook.com/store' }, { facebook: '' });
    expect(patch).toEqual({ facebook: '' });
  });

  it('returns null when nothing changed (Save stays disabled)', () => {
    expect(
      socialLinksPatch({ x: 'https://x.com/store' }, { x: 'https://x.com/store', snapchat: '' }),
    ).toBeNull();
    expect(socialLinksPatch(null, {})).toBeNull();
  });

  it('treats missing stored links as empty and trims both sides', () => {
    const patch = socialLinksPatch(null, { instagram: '  https://instagram.com/store  ' });
    expect(patch).toEqual({ instagram: 'https://instagram.com/store' });
  });
});
