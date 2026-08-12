import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, adminProcedure, router } from '../trpc';

export const groupBookingRouter = router({
  // Create a group booking
  create: customerProcedure
    .input(
      z.object({
        name: z.string().min(2).max(200),
        theme: z.enum(['bridal', 'birthday', 'girls_night', 'family', 'other']).optional(),
        discountPercent: z.number().min(0).max(30).default(10),
        members: z
          .array(
            z.object({
              name: z.string().min(2),
              serviceId: z.number().int().positive(),
              technicianId: z.number().int().positive().optional(),
            }),
          )
          .min(2)
          .max(20),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const group = await prisma.groupBooking.create({
        data: {
          organizerId: ctx.user.id,
          name: input.name,
          theme: input.theme || 'other',
          discountPercent: input.discountPercent,
          members: {
            create: input.members.map((m) => ({
              name: m.name,
              serviceId: m.serviceId,
              technicianId: m.technicianId,
            })),
          },
        },
        include: { members: true },
      });
      return group;
    }),

  // My group bookings (customer)
  myGroups: customerProcedure.query(async ({ ctx }) => {
    const groups = await prisma.groupBooking.findMany({
      where: { organizerId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
      include: { members: true },
    });
    return groups.map((g) => ({ ...g, totalAmount: Number(g.totalAmount) }));
  }),

  // Get group booking by ID
  getById: customerProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const group = await prisma.groupBooking.findUnique({
        where: { id: input.id },
        include: { members: true },
      });
      if (!group) throw new Error('Group booking not found');
      return { ...group, totalAmount: Number(group.totalAmount) };
    }),

  // Admin: list all group bookings
  listAll: adminProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const [items, total] = await Promise.all([
        prisma.groupBooking.findMany({
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
          include: { members: true },
        }),
        prisma.groupBooking.count(),
      ]);
      return { items: items.map((g) => ({ ...g, totalAmount: Number(g.totalAmount) })), total };
    }),
});
