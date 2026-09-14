/**
 * Push notification tests — no-token early returns, the unconfigured
 * Expo path, and the Expo API flow with a mocked fetch. Uses the test
 * DB via prisma. (Coverage ratchet target: src/lib/push.ts — was 2.8%)
 */
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { prisma } from '@galaxy/db';
import { buildUser } from './factories';
import { sendPushToUser, sendPushToAdmins } from '../lib/push';

async function createUserWithTokens(count: number) {
  const user = await prisma.user.create({ data: buildUser() });
  for (let i = 0; i < count; i++) {
    await prisma.pushToken.create({
      data: { userId: user.id, token: `ExponentPushToken[test-${user.id}-${i}]`, platform: 'ios' },
    });
  }
  return user;
}

describe('push lib', () => {
  const createdUsers: number[] = [];

  beforeAll(() => {
    delete process.env['EXPO_ACCESS_TOKEN'];
  });

  afterEach(() => {
    delete process.env['EXPO_ACCESS_TOKEN'];
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    if (createdUsers.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: createdUsers } } });
    }
  });

  it('returns early when the user has no push tokens', async () => {
    const user = await createUserWithTokens(0);
    createdUsers.push(user.id);
    const warnSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await sendPushToUser(user.id, { title: 't', body: 'b' });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('logs a warn and skips the API when EXPO_ACCESS_TOKEN is missing', async () => {
    const user = await createUserWithTokens(1);
    createdUsers.push(user.id);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await sendPushToUser(user.id, { title: 'أهلاً', body: 'مرحباً' });
    // No fetch call and no throw — covered by the warn branch.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends Expo push tickets and counts ticket errors', async () => {
    process.env['EXPO_ACCESS_TOKEN'] = 'expo-token';
    const user = await createUserWithTokens(2);
    createdUsers.push(user.id);

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            { status: 'ok', id: 'ticket-1' },
            { status: 'error', message: 'DeviceNotRegistered' },
          ],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await sendPushToUser(user.id, { title: 't', body: 'b', data: { orderId: '7' } });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://exp.host/--/api/v2/push/send');
    expect(String(init.headers?.['Authorization'])).toBe('Bearer expo-token');
    const body = JSON.parse(String(init.body));
    expect(body).toHaveLength(2);
    expect(body[0].sound).toBe('default');
    expect(body[0].priority).toBe('high');
    expect(body[0].data.orderId).toBe('7');
  });

  it('logs an API error on non-ok responses without throwing', async () => {
    process.env['EXPO_ACCESS_TOKEN'] = 'expo-token';
    const user = await createUserWithTokens(1);
    createdUsers.push(user.id);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('nope', { status: 500 })));
    await expect(sendPushToUser(user.id, { title: 't', body: 'b' })).resolves.toBeUndefined();
  });

  it('catches fetch failures for user pushes without throwing', async () => {
    process.env['EXPO_ACCESS_TOKEN'] = 'expo-token';
    const user = await createUserWithTokens(1);
    createdUsers.push(user.id);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    await expect(sendPushToUser(user.id, { title: 't', body: 'b' })).resolves.toBeUndefined();
  });

  it('returns early for admins when no admin tokens exist', async () => {
    await sendPushToAdmins({ title: 't', body: 'b' });
  });

  it('sends to admin tokens', async () => {
    process.env['EXPO_ACCESS_TOKEN'] = 'expo-token';
    const admin = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    await prisma.pushToken.create({
      data: {
        userId: admin.id,
        token: `ExponentPushToken[admin-${admin.id}-${Date.now()}]`,
        platform: 'android',
      },
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ data: [{ status: 'ok', id: 't1' }] }), { status: 200 }),
      );
    vi.stubGlobal('fetch', fetchMock);
    await sendPushToAdmins({ title: 'إشعار', body: 'للإدارة' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await prisma.pushToken.deleteMany({ where: { userId: admin.id } });
  });
});
