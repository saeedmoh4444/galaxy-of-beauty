import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, technicianProcedure, router } from '../trpc';
import { notFound } from '../lib/errors';

export const safetyRouter = router({
  // ── Emergency Contacts ──
  getContacts: customerProcedure.query(async ({ ctx }) => {
    return prisma.emergencyContact.findMany({ where: { userId: ctx.user.id }, take: 5 });
  }),

  addContact: customerProcedure
    .input(z.object({ name: z.string().min(1).max(100), phone: z.string().min(7).max(20), relation: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.emergencyContact.create({ data: { userId: ctx.user.id, name: input.name, phone: input.phone, relation: input.relation ?? null } });
    }),

  deleteContact: customerProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const contact = await prisma.emergencyContact.findFirst({ where: { id: input.id, userId: ctx.user.id } });
      if (!contact) throw notFound('Emergency contact');
      await prisma.emergencyContact.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ── Panic Alerts ──
  triggerPanic: customerProcedure
    .input(z.object({ latitude: z.number().optional(), longitude: z.number().optional(), bookingId: z.number().int().positive().optional() }))
    .mutation(async ({ ctx, input }) => {
      const alert = await prisma.panicAlert.create({
        data: { userId: ctx.user.id, latitude: input.latitude ?? null, longitude: input.longitude ?? null, bookingId: input.bookingId ?? null },
      });
      // In production: trigger SMS/notification to emergency contacts via queue
      return { alertId: alert.id, message: 'Emergency alert activated. Help is on the way.' };
    }),

  // ── Walk Me To Car ──
  requestEscort: customerProcedure
    .input(z.object({ bookingId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const booking = await prisma.booking.findFirst({ where: { id: input.bookingId, customerId: ctx.user.id } });
      if (!booking) throw notFound('Booking', input.bookingId);

      const request = await prisma.escortRequest.create({ data: { userId: ctx.user.id, bookingId: input.bookingId, technicianId: booking.technicianId, status: 'REQUESTED' } });
      // Notify technician via socket/notification
      return { requestId: request.id, status: 'REQUESTED' };
    }),

  getEscortStatus: customerProcedure
    .input(z.object({ bookingId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return prisma.escortRequest.findFirst({ where: { bookingId: input.bookingId, userId: ctx.user.id }, orderBy: { createdAt: 'desc' } });
    }),

  // ── Location Sharing ──
  startSharing: customerProcedure
    .input(z.object({ bookingId: z.number().int().positive(), contactIds: z.array(z.number().int().positive()) }))
    .mutation(async ({ ctx, input }) => {
      const session = await prisma.locationShare.create({ data: { userId: ctx.user.id, bookingId: input.bookingId, active: true } });
      // In production: send SMS links to contacts
      return { sessionId: session.id, active: true };
    }),

  stopSharing: customerProcedure
    .input(z.object({ sessionId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const session = await prisma.locationShare.findFirst({ where: { id: input.sessionId, userId: ctx.user.id } });
      if (!session) throw notFound('Location session');
      await prisma.locationShare.update({ where: { id: input.sessionId }, data: { active: false, endedAt: new Date() } });
      return { success: true };
    }),

  // ── I'm Home Safe Check-in ──
  checkIn: customerProcedure
    .input(z.object({ bookingId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.safetyCheckIn.create({ data: { userId: ctx.user.id, bookingId: input.bookingId, type: 'HOME_SAFE' } });
    }),

  getCheckInStatus: customerProcedure
    .input(z.object({ bookingId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return prisma.safetyCheckIn.findFirst({ where: { bookingId: input.bookingId, userId: ctx.user.id }, orderBy: { createdAt: 'desc' } });
    }),
});
