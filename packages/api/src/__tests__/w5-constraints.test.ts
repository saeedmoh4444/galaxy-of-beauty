/**
 * W5-1/3/4 — database-level integrity contracts (hand-written migration
 * 20261115151317_w5_db_constraints):
 *  - money-adjacent FKs (gift_cards.purchaserId, flash_deal_claims.userId)
 *  - Dispute exactly-one-target CHECK
 *  - NULLS NOT DISTINCT uniques (promo_usages, wishlist_items)
 *  - AvailabilitySlot overlap exclusion (tsrange, btree_gist)
 */
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdSlotIds: number[] = [];

let techUserId: number;
let customerId: number;
let techProfileId: number;

beforeAll(async () => {
  const [tu, cu] = await Promise.all([
    prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) }),
    prisma.user.create({ data: buildUser() }),
  ]);
  techUserId = tu.id;
  customerId = cu.id;
  createdUserIds.push(tu.id, cu.id);
  const profile = await prisma.technician.create({
    data: { userId: tu.id, city: 'الرياض', bioJson: { ar: 't', en: 't' } },
  });
  techProfileId = profile.id;
}, 30000);

afterAll(async () => {
  await prisma.promoUsage.deleteMany({ where: { userId: customerId } });
  await prisma.wishlistItem.deleteMany({ where: { userId: customerId } });
  await prisma.availabilitySlot.deleteMany({ where: { id: { in: createdSlotIds } } });
  await prisma.technician.deleteMany({ where: { id: techProfileId } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

async function expectRejected(fn: () => Promise<unknown>): Promise<void> {
  let rejected = false;
  try {
    await fn();
  } catch {
    rejected = true;
  }
  expect(rejected, 'expected the database to reject the row').toBe(true);
}

describe('W5 DB integrity contracts', () => {
  it('gift_cards.purchaserId is FK-constrained (W5-1)', async () => {
    await expectRejected(() =>
      prisma.giftCard.create({
        data: { code: `W5GC-${Date.now()}`, amount: 50, balance: 50, purchaserId: 999999999 },
      }),
    );
  });

  it('flash_deal_claims.userId is FK-constrained (W5-1)', async () => {
    const deal = await prisma.flashDeal.findFirst();
    if (!deal) return;
    await expectRejected(() =>
      prisma.flashDealClaim.create({ data: { dealId: deal.id, userId: 999999999 } }),
    );
  });

  it('disputes reject both targets set and both targets null (W5-4)', async () => {
    await expectRejected(() =>
      prisma.dispute.create({
        data: { raisedBy: customerId, reason: 't', bookingId: 1, storeOrderId: 1 },
      }),
    );
    await expectRejected(() =>
      prisma.dispute.create({
        data: { raisedBy: customerId, reason: 't', bookingId: null, storeOrderId: null },
      }),
    );
  });

  it('promo_usages unique is NULLS NOT DISTINCT (W5-4)', async () => {
    const promo = await prisma.promoCode.findFirst();
    if (!promo) return;
    await prisma.promoUsage.create({
      data: { promoCodeId: promo.id, userId: customerId, bookingId: null, discountAmount: 5 },
    });
    await expectRejected(() =>
      prisma.promoUsage.create({
        data: { promoCodeId: promo.id, userId: customerId, bookingId: null, discountAmount: 5 },
      }),
    );
  });

  it('wishlist_items uniques are NULLS NOT DISTINCT (W5-4)', async () => {
    await prisma.wishlistItem.create({
      data: { userId: customerId, serviceId: null, technicianId: null },
    });
    await expectRejected(() =>
      prisma.wishlistItem.create({
        data: { userId: customerId, serviceId: null, technicianId: null },
      }),
    );
  });

  // W5-3 (slot overlap exclusion) ships as its own PR with the fixture
  // sweep — 23 test slot-creation sites need unique times first.
});
