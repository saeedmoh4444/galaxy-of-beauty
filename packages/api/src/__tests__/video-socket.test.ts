/**
 * A4 — video room signaling tests.
 *
 * video:join authorizes only the booking's customer/technician and ack's the
 * participant count; video:signal relays to the room; video:leave notifies
 * peers. Media negotiation itself is browser-side WebRTC and not testable here.
 */
import http from 'http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { io as ioc, type Socket as ClientSocket } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { prisma } from '@galaxy/db';
import { initializeSocket } from '../socket/index';
import { getEnv } from '../lib/env';
import { buildUser } from './factories';
import type { JwtPayload } from '../lib/jwt';

const ISSUER = 'galaxy-of-beauty';
const AUDIENCE = 'galaxy-of-beauty-api';

function signToken(payload: { id: number; role: string; email: string }): string {
  return jwt.sign(
    { ...payload, jti: 'test-jti', iss: ISSUER, aud: AUDIENCE, type: 'access' },
    getEnv().JWT_ACCESS_SECRET,
    { algorithm: 'HS256', expiresIn: '1h' } as jwt.SignOptions,
  );
}

let httpServer: http.Server;
let url = '';
const clients: ClientSocket[] = [];

function connect(user: JwtPayload): Promise<ClientSocket> {
  const socket = ioc(url, {
    transports: ['websocket'],
    auth: { token: signToken({ id: user.id, role: user.role, email: user.email }) },
  });
  clients.push(socket);
  return new Promise((resolve, reject) => {
    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', (err: Error) => reject(err));
  });
}

function emitAck(socket: ClientSocket, event: string, payload: unknown): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`no ack for ${event}`)), 8000);
    socket.emit(event, payload, (ack: unknown) => {
      clearTimeout(timer);
      resolve(ack);
    });
  });
}

let customer: JwtPayload;
let technician: JwtPayload;
let stranger: JwtPayload;
let bookingId: number;
const createdUserIds: number[] = [];

beforeAll(async () => {
  httpServer = http.createServer();
  initializeSocket(httpServer);
  await new Promise<void>((resolve) => httpServer.listen(0, resolve));
  const port = (httpServer.address() as { port: number }).port;
  url = `http://localhost:${port}`;

  const [cu, tu, su] = await Promise.all([
    prisma.user.create({ data: buildUser() }),
    prisma.user.create({ data: buildUser() }),
    prisma.user.create({ data: buildUser() }),
  ]);
  createdUserIds.push(cu.id, tu.id, su.id);
  customer = { id: cu.id, role: 'CUSTOMER', email: cu.email };
  technician = { id: tu.id, role: 'TECHNICIAN', email: tu.email };
  stranger = { id: su.id, role: 'CUSTOMER', email: su.email };

  const [service, address] = await Promise.all([
    prisma.service.findFirst({ select: { id: true } }),
    prisma.address.findFirst({ select: { id: true } }),
  ]);
  const booking = await prisma.booking.create({
    data: {
      bookingCode: `GOB-A4-${Date.now()}`,
      customerId: cu.id,
      technicianId: tu.id,
      serviceId: service?.id ?? 1,
      addressId: address?.id ?? 1,
      startAt: new Date(Date.now() + 86_400_000),
      endAt: new Date(Date.now() + 86_400_000 + 3_600_000),
      totalAmount: 100,
    },
  });
  bookingId = booking.id;
}, 30000);

afterAll(async () => {
  for (const c of clients) c.disconnect();
  await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  try {
    await prisma.booking.deleteMany({ where: { customerId: { in: createdUserIds } } });
  } catch {}
  try {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {}
});

describe('video room signaling (A4)', () => {
  it('customer and technician can join their booking room', async () => {
    const c1 = await connect(customer);
    const ack1 = await emitAck(c1, 'video:join', { bookingId });
    expect(ack1).toMatchObject({ ok: true });
    expect(ack1.participants).toBeGreaterThanOrEqual(1);

    const c2 = await connect(technician);
    const ack2 = await emitAck(c2, 'video:join', { bookingId });
    expect(ack2).toMatchObject({ ok: true });
    expect(ack2.participants).toBeGreaterThanOrEqual(2);
  });

  it('rejects a non-participant with FORBIDDEN', async () => {
    const c3 = await connect(stranger);
    const ack = await emitAck(c3, 'video:join', { bookingId });
    expect(ack).toMatchObject({ error: 'FORBIDDEN' });
  });

  it('rejects a missing booking with NOT_FOUND', async () => {
    const c = await connect(customer);
    const ack = await emitAck(c, 'video:join', { bookingId: 999_999_999 });
    expect(ack).toMatchObject({ error: 'NOT_FOUND' });
  });

  it('relays video:signal to the other room participant', async () => {
    const c1 = await connect(customer);
    await emitAck(c1, 'video:join', { bookingId });
    const c2 = await connect(technician);
    await emitAck(c2, 'video:join', { bookingId });

    const received = new Promise<{ from: number; kind: string }>((resolve) => {
      c2.on('video:signal', (signal: { from: number; kind: string }) => resolve(signal));
    });
    c1.emit('video:signal', { bookingId, kind: 'offer', payload: { type: 'offer', sdp: 'test' } });
    const signal = await received;
    expect(signal.from).toBe(customer.id);
    expect(signal.kind).toBe('offer');
  });

  it('notifies remaining participants on video:leave', async () => {
    const c1 = await connect(customer);
    await emitAck(c1, 'video:join', { bookingId });
    const c2 = await connect(technician);
    await emitAck(c2, 'video:join', { bookingId });

    const left = new Promise<{ userId: number; joined: boolean }>((resolve) => {
      c2.on('video:participant', (info: { userId: number; joined: boolean }) => resolve(info));
    });
    c1.emit('video:leave', { bookingId });
    const info = await left;
    expect(info).toMatchObject({ userId: customer.id, joined: false });
  });
});
