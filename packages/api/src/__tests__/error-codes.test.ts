/**
 * W1-13 (audit 2026-11-11): client errors must surface as tRPC 4xx codes,
 * not raw 500s. Representative routers from the raw-throw sweep.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';

const CSRF = 'a'.repeat(64);

async function anonCaller() {
  const ctx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  return (
    appRouter as never as { createCaller: (c: unknown) => Record<string, unknown> }
  ).createCaller(ctx) as Record<string, unknown>;
}

let customerCaller: Record<string, unknown>;
let customer: JwtPayload;

beforeAll(async () => {
  const anon = await anonCaller();
  const login = await (
    anon.auth as {
      login: (i: unknown) => Promise<{ user: { id: number; role: string; email: string } }>;
    }
  ).login({ email: 'customer@test.com', password: 'Admin@123456' });
  customer = { id: login.user.id, role: login.user.role, email: login.user.email };
  const ctx = await createTRPCContext({ user: customer, csrfCookie: CSRF, csrfHeader: CSRF });
  customerCaller = (
    appRouter as never as { createCaller: (c: unknown) => Record<string, unknown> }
  ).createCaller(ctx) as Record<string, unknown>;
}, 60000);

describe('W1 error codes — client errors are 4xx, not 500', () => {
  it('beautyAwards.vote for a missing category → NOT_FOUND', async () => {
    const caller = customerCaller as { beautyAwards: { vote: (i: unknown) => Promise<unknown> } };
    await expect(
      caller.beautyAwards.vote({ category: 'bogus-category', nomineeId: -1 }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('blog.getBySlug for a missing post → NOT_FOUND', async () => {
    const anon = await anonCaller();
    const caller = anon as { blog: { getBySlug: (i: unknown) => Promise<unknown> } };
    await expect(caller.blog.getBySlug({ slug: 'no-such-post-xyz' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('eventTickets.reserve for a sold-out event → CONFLICT', async () => {
    let eventId = 0;
    try {
      // Create a sold-out event via prisma (no public create route needed).
      const event = await prisma.beautyEvent.create({
        data: {
          nameJson: { ar: 'sold-out-test', en: 'sold-out-test' },
          eventType: 'workshop',
          maxAttendees: 1,
          startsAt: new Date(Date.now() + 86400000),
          endsAt: new Date(Date.now() + 86400000 + 3600000),
          isPublished: true,
        },
      });
      eventId = event.id;
      await prisma.eventTicket.create({
        data: {
          attendeeName: 'someone',
          user: { connect: { id: customer.id } },
          event: { connect: { id: event.id } },
        },
      });

      const caller = customerCaller as {
        eventTickets: { reserve: (i: unknown) => Promise<unknown> };
      };
      await expect(
        caller.eventTickets.reserve({ eventId: event.id, attendeeName: 'test' }),
      ).rejects.toMatchObject({ code: 'CONFLICT' });
    } finally {
      await prisma.eventTicket.deleteMany({ where: { eventId } });
      await prisma.beautyEvent.deleteMany({ where: { id: eventId } });
    }
  });

  it('birthdayRewards.claim without a reward → NOT_FOUND', async () => {
    const caller = customerCaller as {
      birthdayRewards: { claim: (i: unknown) => Promise<unknown> };
    };
    await expect(caller.birthdayRewards.claim({})).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});
