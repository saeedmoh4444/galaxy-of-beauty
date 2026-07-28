import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

// In-memory store — migrate to DB for production
export interface BoardPin {
  id: number;
  imageUrl: string;
  title: string;
  note: string;
  tags: string[];
  serviceId: number | null;
  createdAt: string;
}

export interface MoodBoard {
  id: number;
  name: string;
  description: string;
  coverUrl: string | null;
  pins: BoardPin[];
  createdAt: string;
}

// Legacy aliases for internal use
type Pin = BoardPin;
type Board = MoodBoard;

const boardStore = new Map<number, Board[]>();
function getUserBoards(userId: number): Board[] {
  if (!boardStore.has(userId)) boardStore.set(userId, []);
  return boardStore.get(userId)!;
}
let nextBoardId = 1;
let nextPinId = 1;

export const moodBoardRouter = router({
  // List all my boards
  list: customerProcedure.query(async ({ ctx }) => getUserBoards(ctx.user.id)),

  // Create a board
  create: customerProcedure
    .input(z.object({ name: z.string().min(1).max(100), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const board: Board = {
        id: nextBoardId++, name: input.name, description: input.description ?? '',
        coverUrl: null, pins: [], createdAt: new Date().toISOString(),
      };
      getUserBoards(ctx.user.id).push(board);
      return board;
    }),

  // Add a pin to a board
  addPin: customerProcedure
    .input(z.object({
      boardId: z.number(), imageUrl: z.string(),
      title: z.string().optional(), note: z.string().optional(),
      tags: z.array(z.string()).default([]), serviceId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const boards = getUserBoards(ctx.user.id);
      const board = boards.find((b) => b.id === input.boardId);
      if (!board) throw new Error('اللوحة غير موجودة');
      const pin: Pin = {
        id: nextPinId++, imageUrl: input.imageUrl,
        title: input.title ?? '', note: input.note ?? '',
        tags: input.tags, serviceId: input.serviceId ?? null,
        createdAt: new Date().toISOString(),
      };
      board.pins.push(pin);
      if (!board.coverUrl) board.coverUrl = input.imageUrl;
      return pin;
    }),

  // Remove a pin
  removePin: customerProcedure
    .input(z.object({ boardId: z.number(), pinId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const boards = getUserBoards(ctx.user.id);
      const board = boards.find((b) => b.id === input.boardId);
      if (!board) throw new Error('اللوحة غير موجودة');
      board.pins = board.pins.filter((p) => p.id !== input.pinId);
      if (board.coverUrl && board.pins.length === 0) board.coverUrl = null;
      return { success: true };
    }),

  // Delete a board
  delete: customerProcedure
    .input(z.object({ boardId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const boards = getUserBoards(ctx.user.id);
      const idx = boards.findIndex((b) => b.id === input.boardId);
      if (idx === -1) throw new Error('اللوحة غير موجودة');
      boards.splice(idx, 1);
      return { success: true };
    }),
});
