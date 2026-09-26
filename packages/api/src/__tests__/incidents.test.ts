/**
 * 7.3 Observability 2.0 — incidents (slice 3).
 *
 * Drives: the Incident model, observability.incidents (public, open +
 * recently resolved), and the admin create/resolve mutations.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import { generateCsrfToken } from '../lib/csrf';
import { buildUser } from './factories';
import type { JwtPayload } from '../lib/jwt';

const CSRF = generateCsrfToken();
const ADMIN: JwtPayload = { id: 3, role: 'ADMIN', email: 'admin@galaxyofbeauty.sa' };

async function authCaller(user: JwtPayload | null) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

const SUFFIX = Date.now();
const createdUserIds: number[] = [];
let customer: JwtPayload;

beforeAll(async () => {
  const user = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(user.id);
  customer = { id: user.id, role: 'CUSTOMER', email: user.email };
}, 30000);

afterAll(async () => {
  try {
    await prisma.incident.deleteMany({
      where: { titleJson: { path: ['ar'], equals: `عطل تجريبي ${SUFFIX}` } },
    });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {
    // cleanup is best-effort
  }
});

describe('observability.incidents', () => {
  it('lists nothing when there are no incidents', async () => {
    const caller = await authCaller(null);
    const result = await caller.observability.incidents();
    expect(Array.isArray(result.open)).toBe(true);
    expect(Array.isArray(result.recentlyResolved)).toBe(true);
  });

  it('blocks customers from creating incidents', async () => {
    const caller = await authCaller(customer);
    await expect(
      caller.observability.createIncident({
        titleJson: { ar: `عطل تجريبي ${SUFFIX}`, en: `Test outage ${SUFFIX}` },
        severity: 'major',
      }),
    ).rejects.toThrow();
  });

  it('admin can create, list, and resolve an incident', async () => {
    const caller = await authCaller(ADMIN);
    const created = await caller.observability.createIncident({
      titleJson: { ar: `عطل تجريبي ${SUFFIX}`, en: `Test outage ${SUFFIX}` },
      descriptionJson: { ar: 'وصف', en: 'desc' },
      severity: 'major',
    });
    expect(created.status).toBe('open');

    const listed = await caller.observability.incidents();
    expect(listed.open.some((i: { id: number }) => i.id === created.id)).toBe(true);

    const resolved = await caller.observability.resolveIncident({ id: created.id });
    expect(resolved.status).toBe('resolved');
    expect(resolved.resolvedAt).not.toBeNull();

    const after = await caller.observability.incidents();
    expect(after.open.some((i: { id: number }) => i.id === created.id)).toBe(false);
    expect(after.recentlyResolved.some((i: { id: number }) => i.id === created.id)).toBe(true);
  });
});
