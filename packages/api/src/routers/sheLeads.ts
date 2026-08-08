import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, adminProcedure, router } from '../trpc';
import { notFound } from '../lib/errors';

export const sheLeadsRouter = router({
  list: publicProcedure
    .input(z.object({ page: z.number().int().min(1).default(1), limit: z.number().int().min(1).max(50).default(12) }))
    .query(async ({ input }) => {
      const [items, total] = await Promise.all([
        prisma.sheLeadsMember.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' }, skip: (input.page - 1) * input.limit, take: input.limit }),
        prisma.sheLeadsMember.count({ where: { isActive: true } }),
      ]);
      return { items, total, page: input.page, pages: Math.ceil(total / input.limit) };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const member = await prisma.sheLeadsMember.findUnique({ where: { id: input.id } });
      if (!member) throw notFound('She Leads member', input.id);
      return member;
    }),

  register: customerProcedure
    .input(z.object({ role: z.string().min(2).max(100), city: z.string().optional(), yearsOfExperience: z.number().int().min(0).optional(), motivation: z.string().max(500).optional() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.sheLeadsMember.create({ data: { userId: ctx.user.id, role: input.role, city: input.city ?? null, yearsOfExperience: input.yearsOfExperience ?? null, status: 'PENDING' } });
    }),

  stats: publicProcedure.query(async () => {
    const [total, franchises, salonManagers] = await Promise.all([
      prisma.sheLeadsMember.count({ where: { isActive: true } }),
      prisma.sheLeadsMember.count({ where: { role: 'franchise_owner', isActive: true } }),
      prisma.sheLeadsMember.count({ where: { role: 'salon_manager', isActive: true } }),
    ]);
    return { total, franchises, salonManagers };
  }),

  adminList: adminProcedure
    .input(z.object({ status: z.string().optional(), limit: z.number().int().min(1).max(200).default(50) }))
    .query(async ({ input }) => {
      const where = input.status ? { status: input.status } : {};
      return prisma.sheLeadsMember.findMany({ where, take: input.limit, orderBy: { createdAt: 'desc' } });
    }),
});
