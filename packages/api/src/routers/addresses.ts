import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { router, protectedProcedure } from '../trpc';
import { createAddressSchema, updateAddressSchema } from '../validators/payment';

// ---------------------------------------------------------------------------
// Additional input schemas
// ---------------------------------------------------------------------------

const idParam = z.object({
  id: z.number().int().positive(),
});

const updateAddressInputSchema = z.object({
  id: z.number().int().positive(),
}).merge(updateAddressSchema);

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const addressRouter = router({

  // -----------------------------------------------------------------------
  // list — All addresses for the current user, defaults first
  // -----------------------------------------------------------------------
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const addresses = await prisma.address.findMany({
        where: { userId: ctx.user.id },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });

      return addresses;
    } catch (err) {
      if (err instanceof TRPCError) throw err;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve addresses',
        cause: err,
      });
    }
  }),

  // -----------------------------------------------------------------------
  // create — Add a new address (optionally as default)
  // -----------------------------------------------------------------------
  create: protectedProcedure
    .input(createAddressSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // If setting as default, unset any existing default first
        if (input.isDefault) {
          await prisma.address.updateMany({
            where: { userId: ctx.user.id, isDefault: true },
            data: { isDefault: false },
          });
        }

        const address = await prisma.address.create({
          data: {
            userId: ctx.user.id,
            label: input.label,
            city: input.city,
            area: input.area,
            street: input.street,
            building: input.building,
            floor: input.floor,
            apartment: input.apartment,
            lat: input.lat,
            lng: input.lng,
            isDefault: input.isDefault,
          },
        });

        return address;
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create address',
          cause: err,
        });
      }
    }),

  // -----------------------------------------------------------------------
  // update — Modify an existing address (owner only)
  // -----------------------------------------------------------------------
  update: protectedProcedure
    .input(updateAddressInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify ownership
        const existing = await prisma.address.findUnique({
          where: { id: input.id },
        });

        if (!existing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Address not found',
          });
        }

        if (existing.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not own this address',
          });
        }

        // Destructure id out, apply remaining fields as the update payload
        const { id, ...data } = input;

        // If `isDefault` is explicitly being set to true, unset other defaults
        if (data.isDefault) {
          await prisma.address.updateMany({
            where: { userId: ctx.user.id, isDefault: true, id: { not: id } },
            data: { isDefault: false },
          });
        }

        const updated = await prisma.address.update({
          where: { id },
          data,
        });

        return updated;
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update address',
          cause: err,
        });
      }
    }),

  // -----------------------------------------------------------------------
  // delete — Remove an address (owner only)
  // -----------------------------------------------------------------------
  delete: protectedProcedure
    .input(idParam)
    .mutation(async ({ ctx, input }) => {
      try {
        const existing = await prisma.address.findUnique({
          where: { id: input.id },
        });

        if (!existing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Address not found',
          });
        }

        if (existing.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not own this address',
          });
        }

        await prisma.address.delete({
          where: { id: input.id },
        });

        return { deleted: true, id: input.id };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete address',
          cause: err,
        });
      }
    }),

  // -----------------------------------------------------------------------
  // setDefault — Set a specific address as the sole default
  // -----------------------------------------------------------------------
  setDefault: protectedProcedure
    .input(idParam)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify the address exists and belongs to the user
        const existing = await prisma.address.findUnique({
          where: { id: input.id },
        });

        if (!existing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Address not found',
          });
        }

        if (existing.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not own this address',
          });
        }

        // Unset all defaults for the user
        await prisma.address.updateMany({
          where: { userId: ctx.user.id, isDefault: true },
          data: { isDefault: false },
        });

        // Set the target address as default
        const updated = await prisma.address.update({
          where: { id: input.id },
          data: { isDefault: true },
        });

        return updated;
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to set default address',
          cause: err,
        });
      }
    }),
});
