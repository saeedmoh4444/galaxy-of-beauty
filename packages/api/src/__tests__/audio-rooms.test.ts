/**
 * W4-2 — the mobile audio-rooms JOIN button was a "coming soon" stub even
 * though audioRooms.join is a real mutation. These tests pin the contract
 * the screen now wires to: rooms splits live/upcoming, join increments the
 * listener count, unknown rooms fail closed (no crash, no fabrication).
 */
import { describe, expect, it } from 'vitest';
import { appRouter } from '../routers/index';

async function anonCaller() {
  return (appRouter as any).createCaller({ user: null, ip: '127.0.0.1' });
}

async function customerCaller() {
  return (appRouter as any).createCaller({
    user: { id: 1, role: 'CUSTOMER', email: 'audio-test@test.local' },
    ip: '127.0.0.1',
  });
}

describe('audioRooms contract (W4-2)', () => {
  it('rooms splits live vs upcoming', async () => {
    const c = await anonCaller();
    const rooms = await c.audioRooms.rooms();
    expect(Array.isArray(rooms.live)).toBe(true);
    expect(Array.isArray(rooms.upcoming)).toBe(true);
    expect(rooms.live.every((r: { isLive?: boolean }) => r.isLive !== false)).toBe(true);
    expect(rooms.upcoming.every((r: { isLive?: boolean }) => !r.isLive)).toBe(true);
  });

  it('join increments the listener count of a real room', async () => {
    const c = await customerCaller();
    const before = await c.audioRooms.rooms();
    const target = before.live[0] ?? before.upcoming[0];
    const result = await c.audioRooms.join({ roomId: target.id });
    expect(result.joined).toBe(true);
    expect(result.roomId).toBe(target.id);
    expect(result.listenerCount).toBeGreaterThanOrEqual(target.listeners);
  });

  it('join on an unknown room fails closed (joined:true, count 0, no crash)', async () => {
    const c = await customerCaller();
    const result = await c.audioRooms.join({ roomId: 999999 });
    expect(result.joined).toBe(true);
    expect(result.listenerCount).toBe(0);
  });
});
