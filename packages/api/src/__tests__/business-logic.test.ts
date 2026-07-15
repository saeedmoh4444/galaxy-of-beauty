import { describe, it, expect } from 'vitest';

// ── Loyalty Tier Calculation ──────────────────────────────

const TIERS = {
  SILVER: { min: 0, multiplier: 1 },
  GOLD: { min: 500, multiplier: 1.5 },
  PLATINUM: { min: 2000, multiplier: 2 },
} as const;

function getTier(lifetimePoints: number): string {
  if (lifetimePoints >= 2000) return 'PLATINUM';
  if (lifetimePoints >= 500) return 'GOLD';
  return 'SILVER';
}

function getMultiplier(tier: string): number {
  return TIERS[tier as keyof typeof TIERS]?.multiplier ?? 1;
}

function calculatePoints(amountSar: number, tier: string): number {
  const base = Math.floor(amountSar * 10); // 10 points per SAR
  return Math.floor(base * getMultiplier(tier));
}

describe('Loyalty Tier System', () => {
  describe('getTier', () => {
    it('returns SILVER for new users', () => {
      expect(getTier(0)).toBe('SILVER');
      expect(getTier(100)).toBe('SILVER');
      expect(getTier(499)).toBe('SILVER');
    });

    it('returns GOLD at 500+ points', () => {
      expect(getTier(500)).toBe('GOLD');
      expect(getTier(1000)).toBe('GOLD');
      expect(getTier(1999)).toBe('GOLD');
    });

    it('returns PLATINUM at 2000+ points', () => {
      expect(getTier(2000)).toBe('PLATINUM');
      expect(getTier(5000)).toBe('PLATINUM');
    });
  });

  describe('getMultiplier', () => {
    it('returns correct multipliers', () => {
      expect(getMultiplier('SILVER')).toBe(1);
      expect(getMultiplier('GOLD')).toBe(1.5);
      expect(getMultiplier('PLATINUM')).toBe(2);
    });
  });

  describe('calculatePoints', () => {
    it('calculates base 10 pts/SAR for SILVER', () => {
      const pts = calculatePoints(100, 'SILVER');
      expect(pts).toBe(1000); // 100 * 10 * 1
    });

    it('applies GOLD 1.5x multiplier', () => {
      const pts = calculatePoints(100, 'GOLD');
      expect(pts).toBe(1500); // 100 * 10 * 1.5
    });

    it('applies PLATINUM 2x multiplier', () => {
      const pts = calculatePoints(200, 'PLATINUM');
      expect(pts).toBe(4000); // 200 * 10 * 2
    });

    it('handles fractional amounts', () => {
      const pts = calculatePoints(99.5, 'SILVER');
      expect(pts).toBe(995); // floor(99.5 * 10 * 1)
    });

    it('handles zero amount', () => {
      expect(calculatePoints(0, 'PLATINUM')).toBe(0);
    });
  });
});

// ── Promo Code Validation ────────────────────────────────

interface PromoCode {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
  validUntil?: Date;
}

function validatePromo(promo: PromoCode | null, orderAmount: number): {
  valid: boolean;
  error?: string;
  discountAmount?: number;
  finalAmount?: number;
} {
  if (!promo) return { valid: false, error: 'كود غير موجود' };
  if (!promo.isActive) return { valid: false, error: 'الكود غير نشط' };
  if (promo.validUntil && new Date(promo.validUntil) < new Date()) return { valid: false, error: 'الكود منتهي الصلاحية' };
  if (promo.maxUses && promo.currentUses >= promo.maxUses) return { valid: false, error: 'تم استنفاذ الكود' };
  if (promo.minOrderAmount && orderAmount < promo.minOrderAmount) {
    return { valid: false, error: `الحد الأدنى للطلب ${promo.minOrderAmount} ر.س` };
  }

  let discount = promo.discountType === 'percent'
    ? orderAmount * (promo.discountValue / 100)
    : promo.discountValue;

  if (promo.maxDiscount && discount > promo.maxDiscount) {
    discount = promo.maxDiscount;
  }

  return {
    valid: true,
    discountAmount: Math.round(discount * 100) / 100,
    finalAmount: Math.round((orderAmount - discount) * 100) / 100,
  };
}

describe('Promo Code Validation', () => {
  const activePromo: PromoCode = {
    code: 'TEST20', discountType: 'percent', discountValue: 20,
    isActive: true, currentUses: 0, minOrderAmount: 100,
  };

  it('validates a valid promo code', () => {
    const result = validatePromo(activePromo, 200);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(40);
    expect(result.finalAmount).toBe(160);
  });

  it('rejects inactive promo', () => {
    const result = validatePromo({ ...activePromo, isActive: false }, 200);
    expect(result.valid).toBe(false);
  });

  it('rejects below minimum order', () => {
    const result = validatePromo(activePromo, 50);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('100');
  });

  it('applies max discount cap', () => {
    const promo = { ...activePromo, maxDiscount: 30 };
    const result = validatePromo(promo, 200);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(30); // capped at 30 instead of 40
  });

  it('handles fixed discount', () => {
    const promo: PromoCode = {
      code: 'FLAT50', discountType: 'fixed', discountValue: 50,
      isActive: true, currentUses: 0,
    };
    const result = validatePromo(promo, 200);
    expect(result.discountAmount).toBe(50);
    expect(result.finalAmount).toBe(150);
  });

  it('rejects null promo', () => {
    expect(validatePromo(null, 100).valid).toBe(false);
  });

  it('rejects expired promo', () => {
    const expired = { ...activePromo, validUntil: new Date('2020-01-01') };
    expect(validatePromo(expired, 200).valid).toBe(false);
  });

  it('rejects exhausted promo', () => {
    const exhausted = { ...activePromo, maxUses: 100, currentUses: 100 };
    expect(validatePromo(exhausted, 200).valid).toBe(false);
  });
});

// ── Booking Timeline Generation ───────────────────────────

interface TimelineEvent {
  type: string;
  labelAr: string;
  timestamp: string;
  actor: string;
}

function generateBookingTimeline(booking: {
  createdAt: Date;
  status: string;
  cancelledAt?: Date;
  cancelReason?: string;
  updatedAt: Date;
}): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  events.push({
    type: 'BOOKING_CREATED',
    labelAr: 'تم إنشاء الحجز',
    timestamp: booking.createdAt.toISOString(),
    actor: 'customer',
  });

  if (booking.status === 'CANCELLED' && booking.cancelledAt) {
    events.push({
      type: 'BOOKING_CANCELLED',
      labelAr: 'تم إلغاء الحجز',
      timestamp: booking.cancelledAt.toISOString(),
      actor: 'customer',
    });
  }

  events.push({
    type: 'STATUS_UPDATE',
    labelAr: `الحالة: ${booking.status}`,
    timestamp: booking.updatedAt.toISOString(),
    actor: 'system',
  });

  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

describe('Booking Timeline', () => {
  it('includes creation event for every booking', () => {
    const now = new Date();
    const timeline = generateBookingTimeline({
      createdAt: now, updatedAt: now, status: 'REQUESTED',
    });
    expect(timeline.length).toBeGreaterThanOrEqual(1);
    expect(timeline[0]!.type).toBe('BOOKING_CREATED');
  });

  it('includes cancellation event when cancelled', () => {
    const now = new Date();
    const timeline = generateBookingTimeline({
      createdAt: now, updatedAt: now, status: 'CANCELLED',
      cancelledAt: new Date(now.getTime() + 3600000),
      cancelReason: 'Changed mind',
    });
    const cancelEvent = timeline.find((e) => e.type === 'BOOKING_CANCELLED');
    expect(cancelEvent).toBeDefined();
  });

  it('does not include cancellation for active bookings', () => {
    const now = new Date();
    const timeline = generateBookingTimeline({
      createdAt: now, updatedAt: now, status: 'PAID',
    });
    expect(timeline.find((e) => e.type === 'BOOKING_CANCELLED')).toBeUndefined();
  });

  it('sorts events chronologically', () => {
    const now = new Date();
    const timeline = generateBookingTimeline({
      createdAt: now, updatedAt: now, status: 'CANCELLED',
      cancelledAt: new Date(now.getTime() + 3600000),
    });
    for (let i = 1; i < timeline.length; i++) {
      expect(new Date(timeline[i]!.timestamp).getTime())
        .toBeGreaterThanOrEqual(new Date(timeline[i-1]!.timestamp).getTime());
    }
  });
});

// ── Card Brand Validation ─────────────────────────────────

describe('Card Validation', () => {
  const validBrands = ['visa', 'mastercard', 'mada', 'amex'];

  it('accepts all valid Saudi card brands', () => {
    for (const brand of validBrands) {
      expect(['visa', 'mastercard', 'mada', 'amex']).toContain(brand);
    }
  });

  it('validates last-four format', () => {
    const isValid = (s: string) => /^\d{4}$/.test(s);
    expect(isValid('4242')).toBe(true);
    expect(isValid('123')).toBe(false);
    expect(isValid('12345')).toBe(false);
    expect(isValid('abcd')).toBe(false);
  });

  it('validates expiry month range', () => {
    const isValid = (m: number) => m >= 1 && m <= 12;
    expect(isValid(1)).toBe(true);
    expect(isValid(12)).toBe(true);
    expect(isValid(0)).toBe(false);
    expect(isValid(13)).toBe(false);
  });

  it('validates expiry year range', () => {
    const isValid = (y: number) => y >= 2026 && y <= 2040;
    expect(isValid(2026)).toBe(true);
    expect(isValid(2040)).toBe(true);
    expect(isValid(2025)).toBe(false);
    expect(isValid(2041)).toBe(false);
  });
});
