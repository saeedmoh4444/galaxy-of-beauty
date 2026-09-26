import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import crypto from 'crypto';
import { publicProcedure, protectedProcedure, adminProcedure, router } from '../trpc';
import { prisma } from '@galaxy/db';

/** Deterministic-ish unique code: INF- + 6 uppercase base36 chars. */
function generateInfluencerCode(): string {
  return `INF-${crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6)}`;
}

const influencerFields = {
  name: z.string().min(2).max(100),
  socialHandle: z.string().max(100).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  code: z.string().min(4).max(32).optional(),
  userId: z.number().int().positive().optional(),
};

const serialize = (row: {
  id: number;
  code: string;
  name: string;
  socialHandle: string | null;
  commissionRate: { toNumber(): number } | number;
  userId: number | null;
  totalBookings: number;
  totalCommission: { toNumber(): number } | number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: row.id,
  code: row.code,
  name: row.name,
  socialHandle: row.socialHandle,
  commissionRate:
    typeof row.commissionRate === 'number' ? row.commissionRate : row.commissionRate.toNumber(),
  userId: row.userId,
  totalBookings: row.totalBookings,
  totalCommission:
    typeof row.totalCommission === 'number' ? row.totalCommission : row.totalCommission.toNumber(),
  isActive: row.isActive,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const influencerRouter = router({
  // Public — booking flow resolves the code entered at checkout.
  resolve: publicProcedure
    .input(z.object({ code: z.string().min(4).max(32) }))
    .query(async ({ input }) => {
      const influencer = await prisma.influencer.findUnique({
        where: { code: input.code.trim().toUpperCase() },
      });
      if (!influencer || !influencer.isActive) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Influencer code not found' });
      }
      return {
        code: influencer.code,
        name: influencer.name,
        socialHandle: influencer.socialHandle,
        commissionRate: influencer.commissionRate.toNumber(),
      };
    }),

  // Admin CRUD
  create: adminProcedure.input(z.object(influencerFields)).mutation(async ({ input }) => {
    const code = (input.code ?? generateInfluencerCode()).trim().toUpperCase();
    const exists = await prisma.influencer.findUnique({ where: { code } });
    if (exists) {
      throw new TRPCError({ code: 'CONFLICT', message: 'Code already in use' });
    }
    const created = await prisma.influencer.create({
      data: {
        code,
        name: input.name,
        socialHandle: input.socialHandle ?? null,
        commissionRate: input.commissionRate ?? 10,
        userId: input.userId ?? null,
      },
    });
    return serialize(created);
  }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string().min(2).max(100).optional(),
        socialHandle: z.string().max(100).nullable().optional(),
        commissionRate: z.number().min(0).max(100).optional(),
        isActive: z.boolean().optional(),
        userId: z.number().int().positive().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updated = await prisma.influencer.update({ where: { id }, data });
      return serialize(updated);
    }),

  list: adminProcedure.query(async () => {
    const rows = await prisma.influencer.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(serialize);
  }),

  // The influencer's own dashboard (linked account).
  stats: protectedProcedure.query(async ({ ctx }) => {
    const influencer = await prisma.influencer.findFirst({
      where: { userId: ctx.user.id },
    });
    if (!influencer) return null;
    return serialize(influencer);
  }),
});
