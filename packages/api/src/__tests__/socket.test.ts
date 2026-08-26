/**
 * Socket.IO Integration Tests
 *
 * Boots the real socket server (initializeSocket) on an ephemeral port
 * and drives it with socket.io-client: authentication middleware, room
 * authorization, waitlist event validation/acks, rate limiting, health
 * ping, and the emit helpers.
 *
 * Direct events (auth, acks, room joins) work without Redis. Broadcast
 * delivery tests (emitTo*) require a ready Redis adapter — they skip
 * when Redis is unavailable, mirroring the server's degraded mode.
 */
import http from 'http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { io as ioc, type Socket as ClientSocket } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import {
  initializeSocket,
  getIO,
  emitToUser,
  emitToTechnician,
  emitToAdmin,
  emitToWaitlist,
  checkSocketRateLimit,
} from '../socket/index';
import { getEnv } from '../lib/env';
import { getRedis } from '../lib/redis';

// ── Fixtures ────────────────────────────────────────────────

const ISSUER = 'galaxy-of-beauty';
const AUDIENCE = 'galaxy-of-beauty-api';

const customer = { id: 42, role: 'CUSTOMER', email: 'customer@test.local' };
const technician = { id: 5, role: 'TECHNICIAN', email: 'tech@test.local' };
const admin = { id: 1, role: 'ADMIN', email: 'admin@test.local' };

/** Sign an access token with the same shape as lib/jwt (verified by the middleware). */
function signToken(payload: { id: number; role: string; email: string }, expiresIn = '1h'): string {
  return jwt.sign(
    { ...payload, jti: 'test-jti', iss: ISSUER, aud: AUDIENCE, type: 'access' },
    getEnv().JWT_ACCESS_SECRET,
    { algorithm: 'HS256', expiresIn } as jwt.SignOptions,
  );
}

// ── Server lifecycle ────────────────────────────────────────

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

  // Broadcast delivery goes through the Redis pub/sub adapter — wait up
  // to 1.5s for it to become ready; emit* tests skip if it never does.
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
  // Per-test isolation: rooms accumulate on the server while sockets
  // stay connected, so drop every client between tests.
  for (const client of clients.splice(0)) client.disconnect();
  await tick();
});

afterAll(async () => {
  for (const client of clients) client.disconnect();
  const io = getIO();
  io.close();
  await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  try {
    const adapter = io.of('/').adapter as unknown as { close?: () => Promise<void> | void };
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

// ── Helpers ─────────────────────────────────────────────────

function connect(opts: { token?: string; cookie?: string } = {}): Promise<ClientSocket> {
  return new Promise((resolve, reject) => {
    const socket = ioc(url, {
      auth: opts.token ? { token: opts.token } : undefined,
      extraHeaders: opts.cookie ? { Cookie: opts.cookie } : undefined,
      reconnection: false,
      forceNew: true,
    });
    clients.push(socket);
    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', (err) => reject(err));
  });
}

/** Resolve with the error from connect_error (for rejection-path tests). */
function expectConnectError(opts: { token?: string; cookie?: string } = {}): Promise<Error> {
  return new Promise((resolve) => {
    const socket = ioc(url, {
      auth: opts.token ? { token: opts.token } : undefined,
      extraHeaders: opts.cookie ? { Cookie: opts.cookie } : undefined,
      reconnection: false,
      forceNew: true,
    });
    clients.push(socket);
    socket.on('connect_error', (err) => resolve(err));
  });
}

function emitAck(
  socket: ClientSocket,
  event: string,
  payload: unknown,
): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    socket.emit(event, payload, (ack: Record<string, unknown>) => resolve(ack));
  });
}

function once(socket: ClientSocket, event: string): Promise<unknown> {
  return new Promise((resolve) => socket.once(event, resolve));
}

function rooms(): Set<string> {
  const adapter = getIO().of('/').adapter;
  return new Set((adapter.rooms as Map<string, unknown>).keys());
}

const tick = (ms = 50) => new Promise((r) => setTimeout(r, ms));

// ── Authentication middleware ───────────────────────────────

describe('Socket.IO — Authentication', () => {
  it('rejects connection without token', async () => {
    const err = await expectConnectError();
    expect(err.message).toBe('Authentication required');
  });

  it('rejects connection with invalid token', async () => {
    const err = await expectConnectError({ token: 'not-a-valid-jwt' });
    expect(err.message).toBe('Invalid or expired token');
  });

  it('rejects connection with expired token', async () => {
    const expired = signToken(customer, '-10s');
    const err = await expectConnectError({ token: expired });
    expect(err.message).toContain('Token expired');
  });

  it('accepts connection with valid token via auth (mobile)', async () => {
    const socket = await connect({ token: signToken(customer) });
    expect(socket.connected).toBe(true);
  });

  it('accepts connection with valid token via gob_access cookie (web)', async () => {
    const socket = await connect({ cookie: `gob_access=${signToken(customer)}` });
    expect(socket.connected).toBe(true);
  });
});

// ── Room authorization ──────────────────────────────────────

describe('Socket.IO — Room Authorization', () => {
  it('joins personal room for every authenticated user', async () => {
    await connect({ token: signToken(customer) });
    await tick();
    expect(rooms().has('user:42')).toBe(true);
  });

  it('joins technician room for technician role', async () => {
    await connect({ token: signToken(technician) });
    await tick();
    expect(rooms().has('technician:5')).toBe(true);
  });

  it('joins admin room for admin role', async () => {
    await connect({ token: signToken(admin) });
    await tick();
    expect(rooms().has('admin')).toBe(true);
  });

  it('does NOT join technician or admin rooms for customer role', async () => {
    await connect({ token: signToken(customer) });
    await tick();
    expect(rooms().has('technician:42')).toBe(false);
    expect(rooms().has('admin')).toBe(false);
  });
});

// ── Waitlist events ─────────────────────────────────────────

describe('Socket.IO — Waitlist Authorization', () => {
  it('allows customer to join any waitlist room', async () => {
    const socket = await connect({ token: signToken(customer) });
    const ack = await emitAck(socket, 'join:waitlist', { technicianId: 10 });
    expect(ack).toEqual({ ok: true, room: 'waitlist:10' });
  });

  it('allows technician to join own waitlist room', async () => {
    const socket = await connect({ token: signToken(technician) });
    const ack = await emitAck(socket, 'join:waitlist', { technicianId: 5 });
    expect(ack).toEqual({ ok: true, room: 'waitlist:5' });
  });

  it('rejects technician joining another technician waitlist', async () => {
    const socket = await connect({ token: signToken(technician) });
    const ack = await emitAck(socket, 'join:waitlist', { technicianId: 10 });
    expect(ack).toEqual({ error: 'FORBIDDEN', message: 'Cannot join another technician waitlist' });
  });

  it('leaves a waitlist room on leave:waitlist', async () => {
    const socket = await connect({ token: signToken(customer) });
    await emitAck(socket, 'join:waitlist', { technicianId: 10 });
    const ack = await emitAck(socket, 'leave:waitlist', { technicianId: 10 });
    expect(ack).toEqual({ ok: true });
  });

  it('returns structured error for invalid payload', async () => {
    const socket = await connect({ token: signToken(customer) });
    const ack = await emitAck(socket, 'join:waitlist', { technicianId: -1 });
    expect(ack.error).toBe('VALIDATION_ERROR');
    expect(ack.message).toBe('Invalid payload');
    expect(ack.details).toBeDefined();
  });

  it('rate limits the 31st validated message on a socket', async () => {
    const socket = await connect({ token: signToken(customer) });
    const acks = await Promise.all(
      Array.from({ length: 31 }, () => emitAck(socket, 'join:waitlist', { technicianId: 10 })),
    );
    expect(acks[30]).toEqual({ error: 'RATE_LIMITED', message: 'Too many messages' });
  });
});

// ── Rate limiter (unit) ─────────────────────────────────────

describe('Socket.IO — checkSocketRateLimit', () => {
  it('allows the first 30 messages and rejects the 31st', () => {
    const id = 'unit-rate-a';
    for (let i = 0; i < 30; i++) expect(checkSocketRateLimit(id)).toBe(true);
    expect(checkSocketRateLimit(id)).toBe(false);
  });

  it('tracks each socket independently', () => {
    const a = 'unit-rate-b';
    for (let i = 0; i < 30; i++) checkSocketRateLimit(a);
    expect(checkSocketRateLimit(a)).toBe(false);
    expect(checkSocketRateLimit('unit-rate-c')).toBe(true);
  });

  it('resets the window after it expires', () => {
    vi.useFakeTimers();
    try {
      const id = 'unit-rate-d';
      for (let i = 0; i < 30; i++) expect(checkSocketRateLimit(id)).toBe(true);
      expect(checkSocketRateLimit(id)).toBe(false);
      vi.advanceTimersByTime(1001);
      expect(checkSocketRateLimit(id)).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

// ── Health ping ─────────────────────────────────────────────

describe('Socket.IO — Health Check', () => {
  it('responds to ping:health with ok, timestamp, and userId', async () => {
    const socket = await connect({ token: signToken(customer) });
    const ack = await emitAck(socket, 'ping:health', {});
    expect(ack.ok).toBe(true);
    expect(typeof ack.timestamp).toBe('number');
    expect(ack.userId).toBe(42);
  });
});

// ── Emit helpers (broadcast via Redis adapter) ──────────────

describe('Socket.IO — Emit Helpers', () => {
  it('emitToUser delivers to the target user room', async (ctx) => {
    if (!redisReady) return ctx.skip();
    const socket = await connect({ token: signToken(customer) });
    const received = once(socket, 'wallet:update');
    emitToUser(42, 'wallet:update', { balance: 100 });
    expect(await received).toEqual({ balance: 100 });
  });

  it('emitToTechnician delivers to the technician room', async (ctx) => {
    if (!redisReady) return ctx.skip();
    const socket = await connect({ token: signToken(technician) });
    const received = once(socket, 'booking:new');
    emitToTechnician(5, 'booking:new', { bookingId: 7 });
    expect(await received).toEqual({ bookingId: 7 });
  });

  it('emitToAdmin delivers to the admin room', async (ctx) => {
    if (!redisReady) return ctx.skip();
    const socket = await connect({ token: signToken(admin) });
    const received = once(socket, 'admin:alert');
    emitToAdmin('admin:alert', { level: 'warn' });
    expect(await received).toEqual({ level: 'warn' });
  });

  it('emitToWaitlist delivers to a waitlist room', async (ctx) => {
    if (!redisReady) return ctx.skip();
    const socket = await connect({ token: signToken(customer) });
    await emitAck(socket, 'join:waitlist', { technicianId: 10 });
    const received = once(socket, 'waitlist:update');
    emitToWaitlist(10, 'waitlist:update', { position: 3 });
    expect(await received).toEqual({ position: 3 });
  });
});

// ── getIO guard ─────────────────────────────────────────────

describe('Socket.IO — getIO guard', () => {
  it('throws when called before initialization', async () => {
    vi.resetModules();
    const fresh = await import('../socket/index');
    expect(() => fresh.getIO()).toThrow('Socket.IO not initialized');
  });
});
