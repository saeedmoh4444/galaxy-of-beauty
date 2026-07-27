import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { protectedProcedure, customerProcedure, adminProcedure, router } from '../trpc';

// Generate a gift card code: GIFT-XXXX-XXXX
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion
  const a = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const b = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `GIFT-${a}-${b}`;
}

export const giftCardRouter = router({
  // Purchase a gift card (customer)
  purchase: customerProcedure
    .input(z.object({
      amount: z.number().min(50).max(5000),
      recipientEmail: z.string().email().optional(),
      recipientName: z.string().max(100).optional(),
      message: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const code = generateCode();
      const card = await prisma.giftCard.create({
        data: {
          code,
          amount: input.amount,
          balance: input.amount,
          purchaserId: ctx.user.id,
          recipientEmail: input.recipientEmail,
          recipientName: input.recipientName,
          message: input.message,
          expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000), // 1 year
        },
      });
      return { id: card.id, code: card.code, amount: Number(card.amount), message: input.message || '' };
    }),

  // Check balance by code (public)
  checkBalance: protectedProcedure
    .input(z.object({ code: z.string().min(1) }))
    .query(async ({ input }) => {
      const card = await prisma.giftCard.findUnique({ where: { code: input.code.toUpperCase() } });
      if (!card) throw new TRPCError({ code: 'NOT_FOUND', message: 'بطاقة الهدية غير موجودة' });
      if (card.status !== 'ACTIVE') throw new TRPCError({ code: 'BAD_REQUEST', message: 'البطاقة غير نشطة' });
      if (card.expiresAt && card.expiresAt < new Date()) throw new TRPCError({ code: 'BAD_REQUEST', message: 'انتهت صلاحية البطاقة' });
      return { code: card.code, balance: Number(card.balance), originalAmount: Number(card.amount), recipientName: card.recipientName };
    }),

  // Redeem a gift card against a booking (customer)
  redeem: customerProcedure
    .input(z.object({ code: z.string().min(1), amount: z.number().positive(), bookingId: z.number().optional() }))
    .mutation(async ({ input }) => {
      const card = await prisma.giftCard.findUnique({ where: { code: input.code.toUpperCase() } });
      if (!card) throw new TRPCError({ code: 'NOT_FOUND', message: 'بطاقة الهدية غير موجودة' });
      if (card.status !== 'ACTIVE') throw new TRPCError({ code: 'BAD_REQUEST', message: 'البطاقة غير نشطة أو مستخدمة' });
      if (card.expiresAt && card.expiresAt < new Date()) throw new TRPCError({ code: 'BAD_REQUEST', message: 'انتهت صلاحية البطاقة' });
      if (Number(card.balance) < input.amount) throw new TRPCError({ code: 'BAD_REQUEST', message: 'رصيد البطاقة غير كاف' });

      const newBalance = Number(card.balance) - input.amount;
      await prisma.$transaction([
        prisma.giftCard.update({
          where: { id: card.id },
          data: { balance: newBalance, status: newBalance <= 0 ? 'REDEEMED' : 'ACTIVE' },
        }),
        prisma.giftCardTransaction.create({
          data: { giftCardId: card.id, bookingId: input.bookingId, amount: input.amount },
        }),
      ]);

      return { redeemed: input.amount, remainingBalance: newBalance };
    }),

  // My purchased gift cards
  myCards: customerProcedure.query(async ({ ctx }) => {
    const cards = await prisma.giftCard.findMany({
      where: { purchaserId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return cards.map(c => ({ ...c, amount: Number(c.amount), balance: Number(c.balance) }));
  }),

  // Admin: list all gift cards
  listAll: adminProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const [items, total] = await Promise.all([
        prisma.giftCard.findMany({
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.giftCard.count(),
      ]);
      return { items: items.map(c => ({ ...c, amount: Number(c.amount), balance: Number(c.balance) })), total, page: input.page, limit: input.limit };
    }),
});
