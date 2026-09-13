/**
 * TDD for the shared service-detail trust layer helper.
 * Mirrors the web ServiceDetailClient trust computation so mobile can reuse it
 * (RN service-detail mirror — Phase 3 sprint 2 parity).
 */
import { describe, it, expect } from 'vitest';
import { buildServiceTrust } from '@galaxy/shared';

const LABELS = {
  safeSpace: 'مساحة آمنة',
  womenOnly: 'فريق نسائي',
  privateSuite: 'جناح خاص',
  verified: 'موثقة',
  rating: 'التقييم',
  pregnancySafe: 'آمن للحمل',
  mommyFriendly: 'مناسب للأمهات',
};

describe('buildServiceTrust', () => {
  it('returns only the safe-space badge when nothing else applies', () => {
    const { items, stageChips } = buildServiceTrust({
      isWomenOnlyStaff: false,
      isPrivateSuite: false,
      isPregnancySafe: false,
      isMommyFriendly: false,
      technicians: [],
      labels: LABELS,
    });
    expect(items).toEqual([{ variant: 'safeSpace', label: LABELS.safeSpace }]);
    expect(stageChips).toEqual([]);
  });

  it('adds women-only and private-suite badges when flagged', () => {
    const { items } = buildServiceTrust({
      isWomenOnlyStaff: true,
      isPrivateSuite: true,
      isPregnancySafe: false,
      isMommyFriendly: false,
      technicians: [],
      labels: LABELS,
    });
    expect(items.map((i) => i.variant)).toEqual(['safeSpace', 'womenOnly', 'private']);
  });

  it('adds verified + best-rating items from technicians, ignoring non-verified', () => {
    const { items } = buildServiceTrust({
      isWomenOnlyStaff: false,
      isPrivateSuite: false,
      isPregnancySafe: false,
      isMommyFriendly: false,
      technicians: [
        { kycStatus: 'VERIFIED', ratingAvg: 4.2 },
        { kycStatus: 'PENDING', ratingAvg: 4.8 },
      ],
      labels: LABELS,
    });
    expect(items.map((i) => i.variant)).toEqual(['safeSpace', 'verified', 'rating']);
    const rating = items.find((i) => i.variant === 'rating');
    expect(rating?.value).toBe('4.8');
  });

  it('treats null kycStatus as not verified; rating shows 0.0 when a technician has no rating', () => {
    const { items } = buildServiceTrust({
      isWomenOnlyStaff: false,
      isPrivateSuite: false,
      isPregnancySafe: false,
      isMommyFriendly: false,
      technicians: [{ kycStatus: null, ratingAvg: null }],
      labels: LABELS,
    });
    // web parity: a mapped technician means the rating item renders, 0.0 when unrated
    expect(items.map((i) => i.variant)).toEqual(['safeSpace', 'rating']);
    expect(items.find((i) => i.variant === 'rating')?.value).toBe('0.0');
  });

  it('returns stage chips for pregnancy-safe and mommy-friendly services', () => {
    const { stageChips } = buildServiceTrust({
      isWomenOnlyStaff: false,
      isPrivateSuite: false,
      isPregnancySafe: true,
      isMommyFriendly: true,
      technicians: [],
      labels: LABELS,
    });
    expect(stageChips).toEqual([LABELS.pregnancySafe, LABELS.mommyFriendly]);
  });
});
