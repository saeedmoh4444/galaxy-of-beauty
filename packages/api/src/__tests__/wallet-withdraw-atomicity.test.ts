/**
 * A6 — wallet withdrawal atomicity + idempotency (audit M7).
 * The debit + ledger row + payout row were three separate writes: a
 * duplicate idempotency key failed on the unique ledger insert AFTER
 * the balance was already debited. These tests pin the transaction and
 * the replay behavior.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma, Prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, buildTechnician } from './factories';

const CSRF = 'a'.repeat(64);

async function caller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let tech: JwtPayload;
let userId: number;
let techRecordId: number;
const createdKeys: string[] = [];

beforeAll(async () => {
  const u = await prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) });
  userId = u.id;
  tech = { id: u.id, role: 'TECHNICIAN', email: u.email };
  const t = await prisma.technician.create({ data: buildTechnician({ userId: u.id }) });
  techRecordId = t.id;
}, 15000);

afterAll(async () => {
  await prisma.walletTransaction.deleteMany({ where: { idempotencyKey: { in: createdKeys } } });
  await prisma.payout.deleteMany({ where: { technicianId: userId } });
  await prisma.wallet.deleteMany({ where: { userId } });
  await prisma.technician.deleteMany({ where: { id: techRecordId } });
  await prisma.user.deleteMany({ where: { id: userId } });
});

async function fundWallet(balance: number): Promise<void> {
  await prisma.wallet.upsert({
    where: { userId },
    create: { userId, balance: new Prisma.Decimal(balance) },
    update: { balance: new Prisma.Decimal(balance) },
  });
}

async function balance(): Promise<number> {
  const w = await prisma.wallet.findUniqueOrThrow({ where: { userId } });
  return Number(w.balance);
}

describe('wallet.withdraw — atomicity and idempotency', () => {
  it('replays a duplicate idempotency key without a second debit', async () => {
    await fundWallet(500);
    const key = `wd_replay_${Date.now()}`;
    createdKeys.push(key);
    const c = await caller(tech);

    const first = await c.wallet.withdraw({ amount: 100, idempotencyKey: key });
    expect(await balance()).toBe(400);

    const second = await c.wallet.withdraw({ amount: 100, idempotencyKey: key });
    expect(second.id).toBe(first.id);
    expect(await balance()).toBe(400); // never double-debited

    const txns = await prisma.walletTransaction.count({ where: { idempotencyKey: key } });
    expect(txns).toBe(1);
    const payouts = await prisma.payout.count({ where: { technicianId: userId } });
    expect(payouts).toBe(1);
  });

  it('rejects a second withdrawal that would overdraw (atomic balance check)', async () => {
    // 250 passes the MINIMUM (200) pre-check for both 150-SAR attempts
    // but cannot cover both — only the conditional debit can decide the
    // race; the loser must leave the balance intact.
    await fundWallet(250);
    const keyA = `wd_race_a_${Date.now()}`;
    const keyB = `wd_race_b_${Date.now()}`;
    createdKeys.push(keyA, keyB);
    const c = await caller(tech);
    const payoutsBefore = await prisma.payout.count({ where: { technicianId: userId } });

    const [first, second] = await Promise.allSettled([
      c.wallet.withdraw({ amount: 150, idempotencyKey: keyA }),
      c.wallet.withdraw({ amount: 150, idempotencyKey: keyB }),
    ]);

    const ok = [first, second].filter((r) => r.status === 'fulfilled');
    const failed = [first, second].filter((r) => r.status === 'rejected');
    expect(ok.length).toBe(1);
    expect(failed.length).toBe(1);
    expect((failed[0] as PromiseRejectedResult).reason).toMatchObject({
      code: 'PRECONDITION_FAILED',
    });

    expect(await balance()).toBe(100); // exactly one debit — never negative
    const payouts = await prisma.payout.count({ where: { technicianId: userId } });
    expect(payouts).toBe(payoutsBefore + 1); // the failed attempt created nothing
  });

  it('creates the payout row with the fee-adjusted net amount', async () => {
    await fundWallet(200);
    const key = `wd_net_${Date.now()}`;
    createdKeys.push(key);
    const c = await caller(tech);

    await c.wallet.withdraw({ amount: 100, idempotencyKey: key });

    const payout = await prisma.payout.findFirstOrThrow({
      where: { technicianId: userId },
      orderBy: { id: 'desc' },
    });
    expect(Number(payout.amount)).toBeLessThan(100); // net = gross − fee
    expect(payout.status).toBe('PENDING');
  });
});
