/**
 * addresses router tests — CRUD + setDefault with owner-only guards.
 * Fresh users per test keep "exactly one default" and list assertions
 * deterministic. (Coverage ratchet target: src/routers/addresses.ts)
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';

let admin: JwtPayload;

let uid = 0;
const unique = (prefix: string) => `${prefix}-${Date.now()}-${uid++}`;

const created = {
  userIds: [] as number[],
  addressIds: [] as number[],
};

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function makeCustomer() {
  const n = ++uid;
  const user = await prisma.user.create({
    data: {
      email: `addr-${Date.now()}-${n}@example.com`,
      phone: `+9665${String(10000000 + ((Math.floor(Math.random() * 89999999) + n) % 89999999))}`,
      name: `Address Test ${n}`,
      role: 'CUSTOMER',
      passwordHash: '$2b$10$placeholderhashfortestingpurposesonly',
      isActive: true,
      emailVerified: true,
    },
  });
  created.userIds.push(user.id);
  return user;
}

function authOf(user: { id: number; email: string }): JwtPayload {
  return { id: user.id, role: 'CUSTOMER', email: user.email };
}

const validAddress = {
  label: 'المنزل',
  city: 'الرياض',
  area: 'العليا',
  street: 'شارع التحلية',
  building: 'برج 1',
  floor: '3',
  apartment: '12',
  lat: 24.7136,
  lng: 46.6753,
};

describe('addresses router', () => {
  beforeAll(async () => {
    const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    admin = { id: adminUser.id, role: 'ADMIN', email: adminUser.email };
  }, 15000);

  it('rejects anonymous callers on every procedure', async () => {
    const c = await caller(null);
    await expect(c.addresses.list()).rejects.toThrow();
    await expect(c.addresses.create({ ...validAddress })).rejects.toThrow();
    await expect(c.addresses.update({ id: 1, label: 'x' })).rejects.toThrow();
    await expect(c.addresses.delete({ id: 1 })).rejects.toThrow();
    await expect(c.addresses.setDefault({ id: 1 })).rejects.toThrow();
  });

  it('lists an empty array for a fresh user', async () => {
    const user = await makeCustomer();
    const list = await (await caller(authOf(user))).addresses.list();
    expect(list).toEqual([]);
  });

  it('creates an address owned by the caller', async () => {
    const user = await makeCustomer();
    const c = await caller(authOf(user));
    const address = await c.addresses.create({ ...validAddress, label: 'العمل' });
    created.addressIds.push(address.id);

    expect(address.userId).toBe(user.id);
    expect(address.isDefault).toBe(false);
    expect(address.city).toBe('الرياض');
    expect(address.building).toBe('برج 1');

    const list = await c.addresses.list();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(address.id);
    expect(list[0].label).toBe('العمل');
  });

  it('keeps exactly one default address when creating with isDefault', async () => {
    const user = await makeCustomer();
    const c = await caller(authOf(user));
    const a1 = await c.addresses.create({ ...validAddress, label: 'أ' });
    const a2 = await c.addresses.create({ ...validAddress, label: 'ب', isDefault: true });
    const a3 = await c.addresses.create({ ...validAddress, label: 'ج', isDefault: true });
    created.addressIds.push(a1.id, a2.id, a3.id);

    const list = await c.addresses.list();
    const defaults = list.filter((a: { isDefault: boolean }) => a.isDefault);
    expect(defaults).toHaveLength(1);
    expect(defaults[0].id).toBe(a3.id);
    expect(list.find((a: { id: number }) => a.id === a1.id).isDefault).toBe(false);
    expect(list.find((a: { id: number }) => a.id === a2.id).isDefault).toBe(false);
  });

  it('updates an owned address', async () => {
    const user = await makeCustomer();
    const c = await caller(authOf(user));
    const address = await c.addresses.create({ ...validAddress });
    created.addressIds.push(address.id);

    const updated = await c.addresses.update({
      id: address.id,
      label: 'البيت الجديد',
      city: 'جدة',
    });
    expect(updated.label).toBe('البيت الجديد');
    expect(updated.city).toBe('جدة');
    expect(updated.isDefault).toBe(false);

    const setDefault = await c.addresses.update({ id: address.id, isDefault: true });
    expect(setDefault.isDefault).toBe(true);
  });

  it("rejects updating another user's address", async () => {
    const owner = await makeCustomer();
    const intruder = await makeCustomer();
    const address = await (await caller(authOf(owner))).addresses.create({ ...validAddress });
    created.addressIds.push(address.id);

    await expect(
      (await caller(authOf(intruder))).addresses.update({ id: address.id, label: 'سرقة' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('rejects updating or deleting a nonexistent address', async () => {
    const user = await makeCustomer();
    const c = await caller(authOf(user));
    const address = await c.addresses.create({ ...validAddress });
    created.addressIds.push(address.id);
    await c.addresses.delete({ id: address.id }); // removed — id no longer exists

    await expect(c.addresses.update({ id: address.id, label: 'x' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    await expect(c.addresses.delete({ id: address.id })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    await expect(c.addresses.setDefault({ id: address.id })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('deletes an owned address', async () => {
    const user = await makeCustomer();
    const c = await caller(authOf(user));
    const address = await c.addresses.create({ ...validAddress });
    created.addressIds.push(address.id);

    const result = await c.addresses.delete({ id: address.id });
    expect(result).toEqual({ deleted: true, id: address.id });
    expect(await c.addresses.list()).toEqual([]);
  });

  it("rejects deleting another user's address (ownership guard)", async () => {
    const owner = await makeCustomer();
    const intruder = await makeCustomer();
    const address = await (await caller(authOf(owner))).addresses.create({ ...validAddress });
    created.addressIds.push(address.id);

    await expect(
      (await caller(authOf(intruder))).addresses.delete({ id: address.id }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    // Owner's address is untouched
    const ownerList = await (await caller(authOf(owner))).addresses.list();
    expect(ownerList.some((a: { id: number }) => a.id === address.id)).toBe(true);
  });

  it('sets a single default and unsets the previous one', async () => {
    const user = await makeCustomer();
    const c = await caller(authOf(user));
    const a1 = await c.addresses.create({ ...validAddress, label: 'أ', isDefault: true });
    const a2 = await c.addresses.create({ ...validAddress, label: 'ب' });
    created.addressIds.push(a1.id, a2.id);

    const updated = await c.addresses.setDefault({ id: a2.id });
    expect(updated.isDefault).toBe(true);

    const list = await c.addresses.list();
    expect(list.filter((a: { isDefault: boolean }) => a.isDefault)).toHaveLength(1);
    expect(list.find((a: { id: number }) => a.id === a1.id).isDefault).toBe(false);
    expect(list.find((a: { id: number }) => a.id === a2.id).isDefault).toBe(true);
  });

  it("rejects setDefault on another user's address", async () => {
    const owner = await makeCustomer();
    const intruder = await makeCustomer();
    const address = await (await caller(authOf(owner))).addresses.create({ ...validAddress });
    created.addressIds.push(address.id);

    await expect(
      (await caller(authOf(intruder))).addresses.setDefault({ id: address.id }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('rejects invalid input (zod validation)', async () => {
    const user = await makeCustomer();
    const c = await caller(authOf(user));
    await expect(
      c.addresses.create({ label: '', city: 'الرياض', area: 'أ', street: 'ب' }),
    ).rejects.toThrow();
    await expect(
      c.addresses.create({ label: 'أ', city: '', area: '', street: '' }),
    ).rejects.toThrow();
    await expect(
      c.addresses.create({ ...validAddress, lat: 'not-a-number' as any }),
    ).rejects.toThrow();
    await expect(c.addresses.update({ id: 0, label: 'x' })).rejects.toThrow();
    await expect(c.addresses.update({ id: -5, city: 'جدة' })).rejects.toThrow();
    await expect(c.addresses.update({ id: 1, label: '' })).rejects.toThrow();
    await expect(c.addresses.delete({ id: 0 })).rejects.toThrow();
    await expect(c.addresses.setDefault({ id: 0 })).rejects.toThrow();
  });

  it('is reachable by admins as an ordinary authenticated user', async () => {
    const list = await (await caller(admin)).addresses.list();
    expect(Array.isArray(list)).toBe(true);
  });
});

afterAll(async () => {
  if (created.addressIds.length > 0) {
    await prisma.address.deleteMany({ where: { id: { in: created.addressIds } } });
  }
  if (created.userIds.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: created.userIds } } });
  }
});
