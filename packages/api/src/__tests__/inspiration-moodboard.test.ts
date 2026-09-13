/**
 * Inspiration & Mood Board flow integration tests.
 * Covers the drag-and-drop reorder persistence (UI/UX backlog 3.3).
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';

const CSRF = 'a'.repeat(64);

async function anonCaller() {
  const ctx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

async function authCaller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let customerCaller: any;

beforeAll(async () => {
  const anon = await anonCaller();
  const login = await anon.auth.login({ email: 'customer@test.com', password: 'Admin@123456' });
  customerCaller = await authCaller({
    id: login.user.id,
    role: login.user.role,
    email: login.user.email,
  });
}, 15000);

describe('Inspiration', () => {
  it('should list pins for the authenticated customer', async () => {
    const result = await customerCaller.inspiration.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should reject reorder without authentication', async () => {
    const caller = await anonCaller();
    await expect(caller.inspiration.reorder({ pinIds: [] })).rejects.toThrow();
  });

  it('should persist a reorder of owned pins', async () => {
    const result = await customerCaller.inspiration.reorder({ pinIds: [1, 2, 3] });
    expect(result).toEqual({ success: true });
  });
});

describe('Mood Board', () => {
  it('should list boards for the authenticated customer', async () => {
    const result = await customerCaller.moodBoard.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should reject reorderPins without authentication', async () => {
    const caller = await anonCaller();
    await expect(caller.moodBoard.reorderPins({ boardId: 1, pinIds: [] })).rejects.toThrow();
  });

  it('should reject reorderPins for a non-owned board', async () => {
    await expect(
      customerCaller.moodBoard.reorderPins({ boardId: 999999, pinIds: [1] }),
    ).rejects.toThrow('اللوحة غير موجودة');
  });

  it('should create a board, add pins, reorder, and reflect the new order', async () => {
    const name = `test-board-${Date.now()}`;
    const board = await customerCaller.moodBoard.create({ name });
    try {
      const pin1 = await customerCaller.moodBoard.addPin({
        boardId: board.id,
        imageUrl: 'https://images.unsplash.com/photo-1',
      });
      const pin2 = await customerCaller.moodBoard.addPin({
        boardId: board.id,
        imageUrl: 'https://images.unsplash.com/photo-2',
      });

      // Reverse the order
      await customerCaller.moodBoard.reorderPins({
        boardId: board.id,
        pinIds: [pin2.id, pin1.id],
      });

      const boards = await customerCaller.moodBoard.list();
      const updated = boards.find((b: any) => b.id === board.id);
      expect(updated).toBeDefined();
      expect(updated.pins.map((p: any) => p.id)).toEqual([pin2.id, pin1.id]);
    } finally {
      await customerCaller.moodBoard.delete({ boardId: board.id });
    }
  });
});
