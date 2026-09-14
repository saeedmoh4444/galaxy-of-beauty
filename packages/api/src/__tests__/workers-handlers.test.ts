/**
 * Worker handler tests — the BullMQ job handlers (wallet cashback,
 * loyalty points, notifications, integration sync) without spawning
 * real workers. Handlers live in workers/handlers.ts precisely so
 * these tests don't need Redis/BullMQ side effects.
 * (Coverage ratchet target: src/workers)
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { Job } from 'bullmq';
import { prisma } from '@galaxy/db';
import {
  handleWalletJob,
  handleLoyaltyJob,
  handleNotificationJob,
  handleIntegrationJob,
} from '../workers/handlers';
import { buildUser, buildWallet, buildCategory, buildService, buildBooking } from './factories';

// The Google Calendar API is mocked at the module boundary — the handler
// under test must go through these functions and never talk to Google.
vi.mock('../lib/googleCalendar', () => ({
  createGoogleCalendarEvent: vi.fn(),
  updateGoogleCalendarEvent: vi.fn(),
  deleteGoogleCalendarEvent: vi.fn(),
  refreshGoogleToken: vi.fn(),
}));

import {
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  refreshGoogleToken,
} from '../lib/googleCalendar';

function job<T>(data: T): Job<T> {
  return { data } as Job<T>;
}

const userIds: number[] = [];
const accountIds: number[] = [];

async function createUser(): Promise<number> {
  const user = await prisma.user.create({ data: buildUser() });
  userIds.push(user.id);
  return user.id;
}

beforeAll(async () => {
  // Warm the connection pool so per-test timing isn't skewed by setup.
  await prisma.$queryRaw`SELECT 1`;
});

afterAll(async () => {
  const now = Date.now();
  await prisma.walletTransaction.deleteMany({
    where: { idempotencyKey: { startsWith: `wtest-${now}` } },
  });
  await prisma.loyaltyTransaction.deleteMany({
    where: { accountId: { in: accountIds } },
  });
  await prisma.loyaltyAccount.deleteMany({ where: { id: { in: accountIds } } });
  await prisma.wallet.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
});

// ── Wallet cashback ─────────────────────────────────────────

describe('handleWalletJob', () => {
  it('credits bonus balance and records a transaction', async () => {
    const userId = await createUser();
    const wallet = await prisma.wallet.create({ data: buildWallet({ userId }) });
    const idem = `wtest-${Date.now()}-cashback-1`;

    await handleWalletJob(job({ userId, bookingId: 9001, amount: 25.5, idempotencyKey: idem }));

    const updated = await prisma.wallet.findUnique({ where: { userId } });
    expect(Number(updated?.bonusBalance)).toBe(25.5);

    const txn = await prisma.walletTransaction.findFirst({ where: { idempotencyKey: idem } });
    expect(txn).toBeTruthy();
    expect(txn?.walletId).toBe(wallet.id);
    expect(txn?.type).toBe('CREDIT');
    expect(txn?.source).toBe('CASHBACK');
    expect(txn?.referenceId).toBe('booking_9001');
  });

  it('derives an idempotency key from the booking when none is given', async () => {
    const userId = await createUser();
    await prisma.wallet.create({ data: buildWallet({ userId }) });

    await handleWalletJob(job({ userId, bookingId: 9002, amount: 10 }));

    const txn = await prisma.walletTransaction.findFirst({
      where: { referenceId: 'booking_9002' },
    });
    expect(txn?.idempotencyKey).toBe('cashback_9002');
  });

  it('throws when the user has no wallet', async () => {
    const userId = await createUser();
    await expect(handleWalletJob(job({ userId, bookingId: 9003, amount: 10 }))).rejects.toThrow(
      `Wallet not found for user ${userId}`,
    );
  });
});

// ── Loyalty points ──────────────────────────────────────────

describe('handleLoyaltyJob', () => {
  it('creates a SILVER account when none exists and awards points', async () => {
    const userId = await createUser();

    await handleLoyaltyJob(job({ userId, bookingId: 9101, points: 50, reason: 'booking_reward' }));

    const account = await prisma.loyaltyAccount.findUnique({ where: { userId } });
    accountIds.push(account!.id);
    expect(account?.points).toBe(50);
    expect(account?.lifetimePoints).toBe(50);
    expect(account?.tier).toBe('SILVER');

    const txn = await prisma.loyaltyTransaction.findFirst({
      where: { accountId: account!.id },
    });
    expect(txn?.points).toBe(50);
    expect(txn?.referenceId).toBe('booking_9101');
  });

  it('adds to an existing account without resetting lifetime', async () => {
    const userId = await createUser();
    await prisma.loyaltyAccount.create({
      data: { userId, points: 100, lifetimePoints: 400, tier: 'SILVER' },
    });

    await handleLoyaltyJob(job({ userId, bookingId: 9102, points: 50, reason: 'booking_reward' }));

    const account = await prisma.loyaltyAccount.findUnique({ where: { userId } });
    accountIds.push(account!.id);
    expect(account?.points).toBe(150);
    expect(account?.lifetimePoints).toBe(450);
    expect(account?.tier).toBe('SILVER');
  });

  it('promotes to GOLD at 500 lifetime points', async () => {
    const userId = await createUser();
    await prisma.loyaltyAccount.create({
      data: { userId, points: 0, lifetimePoints: 490, tier: 'SILVER' },
    });

    await handleLoyaltyJob(job({ userId, bookingId: 9103, points: 20, reason: 'booking_reward' }));

    const account = await prisma.loyaltyAccount.findUnique({ where: { userId } });
    accountIds.push(account!.id);
    expect(account?.tier).toBe('GOLD');
    expect(account?.lifetimePoints).toBe(510);
  });

  it('promotes to PLATINUM at 2000 lifetime points', async () => {
    const userId = await createUser();
    await prisma.loyaltyAccount.create({
      data: { userId, points: 0, lifetimePoints: 1990, tier: 'GOLD' },
    });

    await handleLoyaltyJob(job({ userId, bookingId: 9104, points: 15, reason: 'booking_reward' }));

    const account = await prisma.loyaltyAccount.findUnique({ where: { userId } });
    accountIds.push(account!.id);
    expect(account?.tier).toBe('PLATINUM');
  });
});

// ── Notifications ───────────────────────────────────────────

describe('handleNotificationJob', () => {
  it('creates an in-app notification with localized content', async () => {
    const userId = await createUser();

    await handleNotificationJob(
      job({
        userId,
        type: 'BOOKING_CONFIRMED',
        titleAr: 'تم تأكيد الحجز',
        titleEn: 'Booking confirmed',
        bodyAr: 'حجزك مؤكد',
        bodyEn: 'Your booking is confirmed',
        channels: ['push'],
      }),
    );

    const notif = await prisma.notification.findFirst({
      where: { userId, type: 'BOOKING_CONFIRMED' },
    });
    expect(notif).toBeTruthy();
    expect(notif?.titleJson).toEqual({ ar: 'تم تأكيد الحجز', en: 'Booking confirmed' });
    expect(notif?.sentVia).toEqual(['push']);
  });

  it('defaults sentVia to in_app when channels is empty', async () => {
    const userId = await createUser();

    await handleNotificationJob(
      job({
        userId,
        type: 'SYSTEM',
        titleAr: 'تنبيه',
        titleEn: 'Notice',
        bodyAr: 'رسالة',
        bodyEn: 'Message',
        channels: [],
      }),
    );

    const notif = await prisma.notification.findFirst({
      where: { userId, type: 'SYSTEM' },
    });
    expect(notif?.sentVia).toEqual(['in_app']);
  });

  it('records all requested channels', async () => {
    const userId = await createUser();

    await handleNotificationJob(
      job({
        userId,
        type: 'PROMO',
        titleAr: 'عرض',
        titleEn: 'Offer',
        bodyAr: 'خصم',
        bodyEn: 'Discount',
        channels: ['email', 'sms', 'push'],
      }),
    );

    const notif = await prisma.notification.findFirst({
      where: { userId, type: 'PROMO' },
    });
    expect(notif?.sentVia).toEqual(['email', 'sms', 'push']);
  });
});

// ── Integration sync — booking auto-sync to Google Calendar ─
// (E9 follow-up: the handler previously only logged. These tests pin the
// real contract: create/update/cancel against both connected sides,
// event-id persistence, token refresh, and graceful degradation.)

describe('handleIntegrationJob', () => {
  const createdBookingIds: number[] = [];
  const createdUserIds: number[] = [];
  const createdServiceIds: number[] = [];
  const createdAddressIds: number[] = [];
  const createdCategoryIds: number[] = [];

  const mockedCreate = vi.mocked(createGoogleCalendarEvent);
  const mockedUpdate = vi.mocked(updateGoogleCalendarEvent);
  const mockedDelete = vi.mocked(deleteGoogleCalendarEvent);
  const mockedRefresh = vi.mocked(refreshGoogleToken);

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
    await prisma.beautyIntegration.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.address.deleteMany({ where: { id: { in: createdAddressIds } } });
    await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
    await prisma.category.deleteMany({ where: { id: { in: createdCategoryIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  });

  beforeEach(() => {
    mockedCreate.mockReset();
    mockedUpdate.mockReset();
    mockedDelete.mockReset();
    mockedRefresh.mockReset();
  });

  async function createFixture(
    sides: Array<'customer' | 'technician'>,
    opts: {
      googleEventId?: string | null;
      technicianGoogleEventId?: string | null;
      tokenExpiry?: Date;
      integrationStatus?: string;
    } = {},
  ) {
    const customer = await prisma.user.create({ data: buildUser({ role: 'CUSTOMER' }) });
    const technician = await prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) });
    createdUserIds.push(customer.id, technician.id);
    const category = await prisma.category.create({ data: buildCategory() });
    createdCategoryIds.push(category.id);
    const service = await prisma.service.create({
      data: buildService({ categoryId: category.id }),
    });
    createdServiceIds.push(service.id);
    const address = await prisma.address.create({
      data: { userId: customer.id, label: 'منزل', city: 'الرياض', area: 'الملز', street: 'تجريبي' },
    });
    createdAddressIds.push(address.id);
    const booking = await prisma.booking.create({
      data: {
        ...buildBooking({
          customerId: customer.id,
          technicianId: technician.id,
          serviceId: service.id,
          status: 'REQUESTED',
        }),
        addressId: address.id,
        googleEventId: opts.googleEventId ?? null,
        technicianGoogleEventId: opts.technicianGoogleEventId ?? null,
      },
    });
    createdBookingIds.push(booking.id);
    for (const side of sides) {
      const userId = side === 'customer' ? customer.id : technician.id;
      await prisma.beautyIntegration.create({
        data: {
          userId,
          provider: 'google_calendar',
          accessToken: 'tok',
          refreshToken: 'ref',
          tokenExpiry: opts.tokenExpiry ?? new Date(Date.now() + 3_600_000),
          status: opts.integrationStatus ?? 'CONNECTED',
        },
      });
    }
    return { customer, technician, booking };
  }

  it('create pushes an event for every connected side and persists the ids', async () => {
    const { customer, technician, booking } = await createFixture(['customer', 'technician']);
    mockedCreate.mockResolvedValueOnce('evt-customer').mockResolvedValueOnce('evt-technician');

    await handleIntegrationJob(
      job({
        bookingId: booking.id,
        customerId: customer.id,
        technicianId: technician.id,
        action: 'create',
      }),
    );

    expect(mockedCreate).toHaveBeenCalledTimes(2);
    // customer processed first, then technician (deterministic order)
    expect(mockedCreate.mock.calls[0]![0]).toBe('tok');
    expect(mockedCreate.mock.calls[0]![1]?.summary).toContain(booking.bookingCode);
    const updated = await prisma.booking.findUnique({ where: { id: booking.id } });
    expect(updated?.googleEventId).toBe('evt-customer');
    expect(updated?.technicianGoogleEventId).toBe('evt-technician');
  });

  it('cancel deletes the stored events and clears the ids', async () => {
    const { customer, technician, booking } = await createFixture(['customer', 'technician'], {
      googleEventId: 'evt-customer',
      technicianGoogleEventId: 'evt-technician',
    });
    mockedDelete.mockResolvedValue(true);

    await handleIntegrationJob(
      job({
        bookingId: booking.id,
        customerId: customer.id,
        technicianId: technician.id,
        action: 'cancel',
      }),
    );

    expect(mockedDelete).toHaveBeenCalledWith('tok', 'evt-customer');
    expect(mockedDelete).toHaveBeenCalledWith('tok', 'evt-technician');
    const updated = await prisma.booking.findUnique({ where: { id: booking.id } });
    expect(updated?.googleEventId).toBeNull();
    expect(updated?.technicianGoogleEventId).toBeNull();
  });

  it('update patches an existing event, and creates when no id is stored', async () => {
    const { customer, technician, booking } = await createFixture(['customer', 'technician'], {
      googleEventId: 'evt-customer',
    });
    mockedUpdate.mockResolvedValue(true);
    mockedCreate.mockResolvedValue('evt-technician');

    await handleIntegrationJob(
      job({
        bookingId: booking.id,
        customerId: customer.id,
        technicianId: technician.id,
        action: 'update',
        startAt: '2026-10-01T10:00:00.000Z',
        endAt: '2026-10-01T11:00:00.000Z',
      }),
    );

    // customer has a stored id → patched in place
    expect(mockedUpdate).toHaveBeenCalledTimes(1);
    expect(mockedUpdate.mock.calls[0]![0]).toBe('tok');
    expect(mockedUpdate.mock.calls[0]![1]).toBe('evt-customer');
    expect(mockedUpdate.mock.calls[0]![2]?.start).toBe('2026-10-01T10:00:00.000Z');

    // technician is connected but has no stored id → falls back to create
    expect(mockedCreate).toHaveBeenCalledTimes(1);
    const updated = await prisma.booking.findUnique({ where: { id: booking.id } });
    expect(updated?.technicianGoogleEventId).toBe('evt-technician');
  });

  it('skips silently when no integration is connected', async () => {
    const { customer, technician, booking } = await createFixture([]);

    await handleIntegrationJob(
      job({
        bookingId: booking.id,
        customerId: customer.id,
        technicianId: technician.id,
        action: 'create',
      }),
    );

    expect(mockedCreate).not.toHaveBeenCalled();
    expect(mockedUpdate).not.toHaveBeenCalled();
    expect(mockedDelete).not.toHaveBeenCalled();
  });

  it('ignores a non-CONNECTED integration', async () => {
    const { customer, technician, booking } = await createFixture(['customer'], {
      integrationStatus: 'DISCONNECTED',
    });

    await handleIntegrationJob(
      job({
        bookingId: booking.id,
        customerId: customer.id,
        technicianId: technician.id,
        action: 'create',
      }),
    );

    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it('refreshes an expired token before calling Google', async () => {
    const { customer, technician, booking } = await createFixture(['customer'], {
      tokenExpiry: new Date(Date.now() - 60_000),
    });
    mockedRefresh.mockResolvedValue({
      accessToken: 'fresh-token',
      refreshToken: 'ref',
      expiryDate: Date.now() + 3_600_000,
    });
    mockedCreate.mockResolvedValue('evt-customer');

    await handleIntegrationJob(
      job({
        bookingId: booking.id,
        customerId: customer.id,
        technicianId: technician.id,
        action: 'create',
      }),
    );

    expect(mockedRefresh).toHaveBeenCalledWith('ref');
    expect(mockedCreate.mock.calls[0]![0]).toBe('fresh-token');
    const integration = await prisma.beautyIntegration.findUnique({
      where: { userId_provider: { userId: customer.id, provider: 'google_calendar' } },
    });
    expect(integration?.accessToken).toBe('fresh-token');
    expect(integration?.tokenExpiry?.getTime()).toBeGreaterThan(Date.now());
  });

  it('survives Google failures without throwing', async () => {
    const { customer, technician, booking } = await createFixture(['customer']);
    mockedCreate.mockResolvedValue(null);

    await expect(
      handleIntegrationJob(
        job({
          bookingId: booking.id,
          customerId: customer.id,
          technicianId: technician.id,
          action: 'create',
        }),
      ),
    ).resolves.toBeUndefined();

    const updated = await prisma.booking.findUnique({ where: { id: booking.id } });
    expect(updated?.googleEventId).toBeNull();
  });

  it('resolves without throwing for an unknown booking', async () => {
    await expect(
      handleIntegrationJob(job({ bookingId: 9_999_999, customerId: 1, action: 'create' })),
    ).resolves.toBeUndefined();
  });
});
