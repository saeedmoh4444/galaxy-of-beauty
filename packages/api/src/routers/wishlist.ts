import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { router, protectedProcedure } from '../trpc';

export const wishlistRouter = router({
  // ── List wishlist items ───────────────────────────────────────────────────
  list: protectedProcedure.query(async ({ ctx }) => {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        service: {
          select: {
            id: true,
            titleJson: true,
            basePrice: true,
            durationMin: true,
            imageUrl: true,
            category: { select: { id: true, nameJson: true } },
          },
        },
        technician: {
          select: {
            id: true,
            userId: true,
            ratingAvg: true,
            totalReviews: true,
            city: true,
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });

    return { items };
  }),

  // ── Add to wishlist ───────────────────────────────────────────────────────
  add: protectedProcedure
    .input(
      z.object({
        serviceId: z.number().optional(),
        technicianId: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { serviceId, technicianId } = input;

      if (!serviceId && !technicianId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'At least one of serviceId or technicianId is required',
        });
      }

      // Resolve technician profile (if given) and validate existence
      let technicianProfile: { id: number } | null = null;
      if (technicianId) {
        technicianProfile = await prisma.technician.findUnique({
          where: { userId: technicianId },
          select: { id: true },
        });
        if (!technicianProfile) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Technician not found' });
        }
      }

      // Validate service exists
      if (serviceId) {
        const service = await prisma.service.findUnique({
          where: { id: serviceId },
          select: { id: true },
        });
        if (!service) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Service not found' });
        }
      }

      // Check unique constraints
      if (serviceId) {
        const existing = await prisma.wishlistItem.findUnique({
          where: { userId_serviceId: { userId: ctx.user.id, serviceId } },
        });
        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Service is already in your wishlist',
          });
        }
      }

      if (technicianProfile) {
        const existing = await prisma.wishlistItem.findUnique({
          where: {
            userId_technicianId: {
              userId: ctx.user.id,
              technicianId: technicianProfile.id,
            },
          },
        });
        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Technician is already in your wishlist',
          });
        }
      }

      const item = await prisma.wishlistItem.create({
        data: {
          userId: ctx.user.id,
          serviceId: serviceId ?? null,
          technicianId: technicianProfile?.id ?? null,
        },
      });

      return item;
    }),

  // ── Remove from wishlist ──────────────────────────────────────────────────
  remove: protectedProcedure
    .input(z.object({ wishlistItemId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const item = await prisma.wishlistItem.findUnique({
        where: { id: input.wishlistItemId },
        select: { id: true, userId: true },
      });

      if (!item) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Wishlist item not found' });
      }

      if (item.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only remove items from your own wishlist',
        });
      }

      await prisma.wishlistItem.delete({
        where: { id: input.wishlistItemId },
      });

      return { success: true };
    }),

  // ── Check wishlist status ─────────────────────────────────────────────────
  check: protectedProcedure
    .input(
      z.object({
        serviceId: z.number().optional(),
        technicianId: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { serviceId, technicianId } = input;

      if (!serviceId && !technicianId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'At least one of serviceId or technicianId is required',
        });
      }

      let inWishlist = false;

      if (serviceId) {
        const existing = await prisma.wishlistItem.findUnique({
          where: { userId_serviceId: { userId: ctx.user.id, serviceId } },
          select: { id: true },
        });
        if (existing) inWishlist = true;
      }

      if (technicianId && !inWishlist) {
        const technician = await prisma.technician.findUnique({
          where: { userId: technicianId },
          select: { id: true },
        });
        if (technician) {
          const existing = await prisma.wishlistItem.findUnique({
            where: {
              userId_technicianId: { userId: ctx.user.id, technicianId: technician.id },
            },
            select: { id: true },
          });
          if (existing) inWishlist = true;
        }
      }

      return { inWishlist };
    }),
});
