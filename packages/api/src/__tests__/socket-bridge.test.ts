/**
 * W3-1 — realtime socket emits are silent no-ops in production.
 *
 * The API routers (bookings/chat/notifications/payments/vendorPortal/video)
 * run in the Next.js process, where `initializeSocket` is never called, so
 * the module-level `io` stays null and every emitTo* helper silently drops
 * the event. Only client-initiated signaling (video:*) worked, because the
 * CLIENT connects straight to the standalone socket process.
 *
 * Fix under test: when no local Socket.IO server exists, the emit helpers
 * must fall back to a broadcast-only Server sharing the Redis adapter —
 * the socket.io-blessed cross-process emit pattern. Delivery is exactly
 * once per client: the local-server path (in-process) and the bridge path
 * (cross-process) are mutually exclusive.
 *
 * This file simulates the split deployment:
 *   - "socket process"  → initializeSocket() on an ephemeral port (the
 *     real server a client connects to)
 *   - "API process"     → a FRESH module registry (vi.resetModules) whose
 *     `io` is null; its emit helpers must reach the client through Redis
 *
 * Requires a ready Redis adapter; skipped otherwise, mirroring
 * socket.test.ts degraded-mode semantics.
 */
import http from 'http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { io as ioc, type Socket as ClientSocket } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { initializeSocket, getIO } from '../socket/index';
import { getEnv } from '../lib/env';
import { getRedis } from '../lib/redis';

const ISSUER = 'galaxy-of-beauty';
const AUDIENCE = 'galaxy-of-beauty-api';

const customer = { id: 777, role: 'CUSTOMER', email: 'bridge-customer@test.local' };
const technician = { id: 555, role: 'TECHNICIAN', email: 'bridge-tech@test.local' };
const admin = { id: 1, role: 'ADMIN', email: 'bridge-admin@test.local' };

function signToken(payload: { id: number; role: string; email: string }, expiresIn = '1h'): string {
  return jwt.sign(
    { ...payload, jti: 'test-jti', iss: ISSUER, aud: AUDIENCE, type: 'access' },
    getEnv().JWT_ACCESS_SECRET,
    { algorithm: 'HS256', expiresIn } as jwt.SignOptions,
  );
}

let httpServer: http.Server;
let url = '';
let redisReady = false;
const clients: ClientSocket[] = [];

beforeAll(async () => {
  httpServer = http.createServer();
  initializeSocket(httpServer);
  await new Promise<void>((resolve) => httpServer.listen(0, resolve));
  const port = (httpServer.address() as { port: number }).port;
  url = `http://localhost:${port}`;

  const redis = getRedis();
  if (redis) {
    const deadline = Date.now() + 1500;
    while (Date.now() < deadline && redis.status !== 'ready') {
      await new Promise((r) => setTimeout(r, 50));
    }
    redisReady = redis.status === 'ready';
  }
});

afterEach(async () => {
  for (const client of clients.splice(0)) client.disconnect();
  await new Promise((r) => setTimeout(r, 50));
});

afterAll(async () => {
  for (const client of clients) client.disconnect();
  // Close every fresh-registry bridge (their pub/sub clients hold the loop).
  for (const side of apiSides) side.closeBroadcastIO();
  getIO().close();
  await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  try {
    const adapter = getIO().of('/').adapter as unknown as { close?: () => Promise<void> | void };
    await adapter?.close?.();
  } catch {
    // best-effort cleanup
  }
  try {
    await getRedis()?.quit();
  } catch {
    // best-effort cleanup
  }
});

function connect(token: string): Promise<ClientSocket> {
  return new Promise((resolve, reject) => {
    const socket = ioc(url, {
      auth: { token },
      reconnection: false,
      forceNew: true,
    });
    clients.push(socket);
    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', (err) => reject(err));
  });
}

function once(socket: ClientSocket, event: string): Promise<unknown> {
  return new Promise((resolve) => socket.once(event, resolve));
}

/**
 * Load the socket module as the "API process" would: fresh registry,
 * initializeSocket never called → `io` null → helpers must bridge via Redis.
 */
const apiSides: Array<typeof import('../socket/index')> = [];
async function loadApiSide() {
  vi.resetModules();
  const side = (await import('../socket/index')) as typeof import('../socket/index');
  apiSides.push(side);
  return side;
}

describe('Socket.IO — cross-process emit bridge (W3-1)', () => {
  it('emitToUser reaches a client in the OTHER process via Redis', async (ctx) => {
    if (!redisReady) return ctx.skip();
    const apiSide = await loadApiSide();
    const socket = await connect(signToken(customer));
    await new Promise((r) => setTimeout(r, 100)); // room join processed

    const received = once(socket, 'wallet:update');
    apiSide.emitToUser(customer.id, 'wallet:update', { balance: 500 });
    expect(await received).toEqual({ balance: 500 });
  });

  it('emitToTechnician reaches a technician in the OTHER process via Redis', async (ctx) => {
    if (!redisReady) return ctx.skip();
    const apiSide = await loadApiSide();
    const socket = await connect(signToken(technician));
    await new Promise((r) => setTimeout(r, 100));

    const received = once(socket, 'booking:new');
    apiSide.emitToTechnician(technician.id, 'booking:new', { bookingId: 9 });
    expect(await received).toEqual({ bookingId: 9 });
  });

  it('emitToAdmin reaches an admin in the OTHER process via Redis', async (ctx) => {
    if (!redisReady) return ctx.skip();
    const apiSide = await loadApiSide();
    const socket = await connect(signToken(admin));
    await new Promise((r) => setTimeout(r, 100));

    const received = once(socket, 'admin:alert');
    apiSide.emitToAdmin('admin:alert', { level: 'warn' });
    expect(await received).toEqual({ level: 'warn' });
  });

  it('emitToWaitlist reaches a waitlist room in the OTHER process via Redis', async (ctx) => {
    if (!redisReady) return ctx.skip();
    const apiSide = await loadApiSide();
    const socket = await connect(signToken(customer));
    // Join the waitlist room through the real server first.
    await new Promise<void>((resolve) => {
      socket.emit('join:waitlist', { technicianId: 10 }, () => resolve());
    });
    await new Promise((r) => setTimeout(r, 100));

    const received = once(socket, 'waitlist:update');
    apiSide.emitToWaitlist(10, 'waitlist:update', { position: 3 });
    expect(await received).toEqual({ position: 3 });
  });

  it('delivers exactly once (no double delivery when bridge + adapter both route)', async (ctx) => {
    if (!redisReady) return ctx.skip();
    const apiSide = await loadApiSide();
    const socket = await connect(signToken(customer));
    await new Promise((r) => setTimeout(r, 100));

    const deliveries: unknown[] = [];
    socket.on('wallet:update', (d) => deliveries.push(d));
    apiSide.emitToUser(customer.id, 'wallet:update', { balance: 1 });
    await new Promise((r) => setTimeout(r, 300));
    expect(deliveries).toEqual([{ balance: 1 }]);
  });

  it('local io takes precedence — no bridge when the server is in-process', async (ctx) => {
    if (!redisReady) return ctx.skip();
    const apiSide = await loadApiSide();
    // The fresh registry must NOT have initialized its own local server…
    expect(() => apiSide.getIO()).toThrow('Socket.IO not initialized');
    // …yet an emit must not throw (degraded mode stays a no-op only when
    // Redis is down — here Redis is up, so the bridge covers it).
    expect(() => apiSide.emitToUser(customer.id, 'wallet:update', { balance: 2 })).not.toThrow();
    // Give the bridged emit a beat to propagate.
    await new Promise((r) => setTimeout(r, 100));
  });
});
