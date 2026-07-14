import { describe, it, expect } from 'vitest';

// ── Replicate Surprise Me scoring logic for unit testing ────

interface ScoredService {
  id: number;
  categoryId: number;
  titleAr: string;
  titleEn: string;
  basePrice: number;
  bookings: number;
}

function scoreService(
  s: ScoredService,
  context: {
    wishedIds: Set<number>;
    bookedIds: Set<number>;
    bookedCatIds: Set<number>;
    categoryRecency: Map<number, Date>;
    skinType?: string;
    budget?: number;
    quizStyle?: string;
    hour: number;
  },
): number {
  let score = 50;
  const titleAr = s.titleAr;
  const titleEn = s.titleEn;

  if (context.wishedIds.has(s.id)) score += 40;
  if (context.bookedIds.has(s.id)) score -= 50;
  if (!context.bookedCatIds.has(s.categoryId)) score += 25;

  const lastCatDate = context.categoryRecency.get(s.categoryId);
  if (lastCatDate) {
    const daysSince = (Date.now() - lastCatDate.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.min(20, daysSince * 2);
  }

  if (context.skinType) {
    const st = context.skinType.toLowerCase();
    if (st === 'dry' && /ترطيب|مرطب|مويست|هيدرا/i.test(titleAr)) score += 20;
    if (st === 'oily' && /تنظيف|مقشر|deep clean/i.test(titleAr)) score += 20;
    if (st === 'sensitive' && /لطيف|مهدئ|حساس|gentle|soothing/i.test(titleAr)) score += 20;
    if (st === 'combination' && /متوازن|balance/i.test(titleAr)) score += 15;
  }

  score += Math.min(15, s.bookings * 2);

  if (context.budget && s.basePrice <= context.budget) {
    score += Math.round((s.basePrice / context.budget) * 10);
  }

  const h = context.hour;
  if (h >= 6 && h < 12 && /morning|صباح|تنظيف|facial/i.test(titleAr + titleEn)) score += 5;
  if (h >= 17 && h < 22 && /مساج|massage|استرخاء|relax/i.test(titleAr + titleEn)) score += 8;
  if (h >= 20 && /مسائي|evening|مكياج|makeup/i.test(titleAr + titleEn)) score += 5;

  if (context.quizStyle === 'luxury' && s.basePrice > 200) score += 10;
  if (context.quizStyle === 'budget' && s.basePrice < 100) score += 10;
  if (context.quizStyle === 'natural' && /طبيعي|عضوي|organic|natural/i.test(titleAr + titleEn)) score += 10;

  score += 7.5; // midpoint of random 0-15
  return score;
}

// ── Fixtures ────────────────────────────────────────────────

const svc = (overrides: Partial<ScoredService> = {}): ScoredService => ({
  id: 1, categoryId: 1, titleAr: 'خدمة', titleEn: 'Service',
  basePrice: 100, bookings: 0, ...overrides,
});

const haircut     = svc({ id: 1, categoryId: 1, titleAr: 'قص شعر', titleEn: 'Haircut', basePrice: 80, bookings: 3 });
const facial      = svc({ id: 2, categoryId: 2, titleAr: 'تنظيف بشرة', titleEn: 'Facial Cleansing', basePrice: 120, bookings: 15 });
const massage     = svc({ id: 3, categoryId: 3, titleAr: 'مساج استرخاء', titleEn: 'Relaxation Massage', basePrice: 250, bookings: 20 });
const moisturize  = svc({ id: 4, categoryId: 2, titleAr: 'ترطيب البشرة', titleEn: 'Skin Moisturizing', basePrice: 100, bookings: 5 });
const makeup      = svc({ id: 5, categoryId: 4, titleAr: 'مكياج كامل', titleEn: 'Full Makeup', basePrice: 250, bookings: 8 });
const organic     = svc({ id: 6, categoryId: 2, titleAr: 'قناع طبيعي للوجه', titleEn: 'Organic Natural Face Mask', basePrice: 90, bookings: 3 });
const deepClean   = svc({ id: 7, categoryId: 2, titleAr: 'تنظيف عميق للبشرة', titleEn: 'Deep Clean Facial', basePrice: 150, bookings: 12 });
const gentle      = svc({ id: 8, categoryId: 2, titleAr: 'عناية لطيفة بالبشرة', titleEn: 'Gentle Soothing Facial', basePrice: 110, bookings: 6 });

const empty = {
  wishedIds: new Set<number>(),
  bookedIds: new Set<number>(),
  bookedCatIds: new Set<number>(),
  categoryRecency: new Map<number, Date>(),
  hour: 10,
};

// ── Tests ──────────────────────────────────────────────────

describe('Scoring Algorithm', () => {
  describe('baseline', () => {
    it('returns positive score for every service', () => {
      for (const s of [haircut, facial, massage, moisturize, makeup]) {
        expect(scoreService(s, empty)).toBeGreaterThan(0);
      }
    });

    it('gives higher scores to popular services', () => {
      expect(scoreService(massage, empty)).toBeGreaterThan(scoreService(haircut, empty));
    });

    it('zero-booking service gets no trending bonus', () => {
      const unknown = svc({ id: 99, bookings: 0 });
      expect(scoreService(unknown, empty)).toBeLessThan(scoreService(haircut, empty));
    });
  });

  describe('wishlist', () => {
    it('adds exactly 40 for wishlisted service', () => {
      const base = scoreService(haircut, empty);
      const boosted = scoreService(haircut, { ...empty, wishedIds: new Set([1]) });
      expect(boosted - base).toBe(40);
    });

    it('does not affect non-wishlisted services', () => {
      const base = scoreService(haircut, empty);
      const same = scoreService(haircut, { ...empty, wishedIds: new Set([99]) });
      expect(same).toBe(base);
    });
  });

  describe('booking history', () => {
    it('penalizes already-booked services', () => {
      // Isolate penalty: mark both booked AND category as booked
      const ctx = { ...empty, bookedIds: new Set([1]), bookedCatIds: new Set([1]) };
      const penalized = scoreService(haircut, ctx);
      const withNewCat = scoreService(haircut, empty);
      // Penalty (-50) + lost new-cat boost (-25) = 75 less
      expect(withNewCat - penalized).toBe(75);
    });

    it('boosts unbooked categories by 25', () => {
      const withBoost = scoreService(haircut, { ...empty, bookedCatIds: new Set([99]) });
      const withoutBoost = scoreService(haircut, { ...empty, bookedCatIds: new Set([1]) });
      expect(withBoost - withoutBoost).toBe(25);
    });
  });

  describe('category recency', () => {
    it('gives bigger boost for older bookings', () => {
      const old = new Date(Date.now() - 15 * 86400000);
      const recent = new Date(Date.now() - 2 * 86400000);
      const scoreOld = scoreService(haircut, { ...empty, categoryRecency: new Map([[1, old]]) });
      const scoreRecent = scoreService(haircut, { ...empty, categoryRecency: new Map([[1, recent]]) });
      expect(scoreOld).toBeGreaterThan(scoreRecent);
    });

    it('caps recency boost at 20', () => {
      const veryOld = new Date(Date.now() - 100 * 86400000); // 100 days → 200 but capped at 20
      const old = new Date(Date.now() - 30 * 86400000); // 30 days → 60 but capped at 20
      expect(scoreService(haircut, { ...empty, categoryRecency: new Map([[1, veryOld]]) }))
        .toBe(scoreService(haircut, { ...empty, categoryRecency: new Map([[1, old]]) }));
    });
  });

  describe('skin type', () => {
    it('boosts moisturizing for dry skin', () => {
      const base = scoreService(moisturize, empty);
      const boosted = scoreService(moisturize, { ...empty, skinType: 'dry' });
      expect(boosted).toBeGreaterThan(base);
    });

    it('boosts deep clean for oily skin', () => {
      expect(scoreService(deepClean, { ...empty, skinType: 'oily' }))
        .toBeGreaterThan(scoreService(deepClean, empty));
    });

    it('boosts gentle for sensitive skin', () => {
      expect(scoreService(gentle, { ...empty, skinType: 'sensitive' }))
        .toBeGreaterThan(scoreService(gentle, empty));
    });

    it('does not boost moisturizing for oily skin', () => {
      expect(scoreService(moisturize, { ...empty, skinType: 'oily' }))
        .toBe(scoreService(moisturize, empty));
    });

    it('boosts combination skin matching', () => {
      const combo = svc({ id: 9, categoryId: 2, titleAr: 'روتين متوازن', titleEn: 'Balanced Routine', bookings: 0 });
      expect(scoreService(combo, { ...empty, skinType: 'combination' }))
        .toBeGreaterThan(scoreService(combo, empty));
    });
  });

  describe('trending', () => {
    it('caps at 15', () => {
      const mega = svc({ id: 99, bookings: 100 }); // 100*2=200, capped at 15
      const mid = svc({ id: 98, bookings: 7 }); // 7*2=14
      // Mega gets 15, mid gets 14 — difference is 1
      const diff = scoreService(mega, empty) - scoreService(mid, empty);
      expect(diff).toBe(1);
    });
  });

  describe('budget', () => {
    it('boosts service that fills budget', () => {
      const within = scoreService(haircut, { ...empty, budget: 80 });
      const over = scoreService(haircut, { ...empty, budget: 50 });
      expect(within).toBeGreaterThan(over);
    });
  });

  describe('time of day', () => {
    it('boosts facial/morning services in AM', () => {
      const am = scoreService(facial, { ...empty, hour: 8 });
      const pm = scoreService(facial, { ...empty, hour: 14 });
      expect(am).toBeGreaterThan(pm);
    });

    it('boosts massage in evening', () => {
      const evening = scoreService(massage, { ...empty, hour: 19 });
      const morning = scoreService(massage, { ...empty, hour: 9 });
      expect(evening).toBeGreaterThan(morning);
    });

    it('boosts makeup late evening', () => {
      const late = scoreService(makeup, { ...empty, hour: 21 });
      const early = scoreService(makeup, { ...empty, hour: 18 });
      expect(late).toBeGreaterThan(early);
    });
  });

  describe('quiz preferences', () => {
    it('boosts expensive services for luxury preference', () => {
      const cheap = scoreService(haircut, { ...empty, quizStyle: 'luxury' }); // 80 SAR
      const lux = scoreService(massage, { ...empty, quizStyle: 'luxury' }); // 250 SAR
      expect(lux - cheap).toBeGreaterThan(0);
    });

    it('boosts budget services for budget preference', () => {
      const bud = scoreService(haircut, { ...empty, quizStyle: 'budget' });
      const noPref = scoreService(haircut, empty);
      expect(bud).toBeGreaterThan(noPref);
    });

    it('boosts organic/natural for natural preference', () => {
      const pref = scoreService(organic, { ...empty, quizStyle: 'natural' });
      const noPref = scoreService(organic, empty);
      expect(pref).toBeGreaterThan(noPref);
    });
  });

  describe('edge cases', () => {
    it('all scores remain finite', () => {
      for (const s of [haircut, facial, massage, moisturize, makeup, organic, deepClean, gentle]) {
        expect(isFinite(scoreService(s, empty))).toBe(true);
      }
    });

    it('minimum score is non-negative', () => {
      // Worst case: booked + cat booked + no bookings + no signals
      const worst = { ...empty, bookedIds: new Set([99]), bookedCatIds: new Set([99]) };
      const unknown = svc({ id: 99, categoryId: 99, bookings: 0 });
      expect(scoreService(unknown, worst)).toBeGreaterThanOrEqual(0);
    });

    it('all services receive distinct scores when contexts differ', () => {
      // Ensure scoring is not uniform — different contexts = different scores
      const s1 = scoreService(haircut, empty);
      const s2 = scoreService(haircut, { ...empty, wishedIds: new Set([1]) });
      expect(s1).not.toBe(s2);
    });
  });
});

describe('VAT Calculation', () => {
  const VAT = 0.15;

  function calcVat(total: number) {
    const vat = total * VAT / (1 + VAT);
    return { subtotal: total - vat, vat };
  }

  it('115 SAR → 100 subtotal + 15 VAT', () => {
    const r = calcVat(115);
    expect(r.subtotal).toBeCloseTo(100, 2);
    expect(r.vat).toBeCloseTo(15, 2);
  });

  it('subtotal + vat = total for many values', () => {
    for (const t of [57.5, 100, 115, 230, 345, 500, 1000]) {
      const r = calcVat(t);
      expect(r.subtotal + r.vat).toBeCloseTo(t, 2);
    }
  });

  it('0 total = 0 vat', () => {
    const r = calcVat(0);
    expect(r.vat).toBe(0);
    expect(r.subtotal).toBe(0);
  });
});
