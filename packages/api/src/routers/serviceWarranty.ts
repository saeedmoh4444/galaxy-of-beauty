import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export interface WarrantyClaimRecord {
  id: number; userId: number; bookingId: number;
  reason: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPENSATED';
  compensation: number; createdAt: string;
}
type WarrantyClaim = WarrantyClaimRecord;

const claims: WarrantyClaim[] = [];
let claimId = 1;

export const serviceWarrantyRouter = router({
  policy: customerProcedure.query(() => ({
    coverage: [
      { emoji: '🔄', titleAr: 'إعادة الخدمة مجاناً', titleEn: 'Free Re-do', descAr: 'إذا لم تكوني راضية عن النتيجة، سنعيد الخدمة مجاناً خلال ٤٨ ساعة', descEn: 'If unsatisfied, we redo the service free within 48 hours' },
      { emoji: '💰', titleAr: 'استرداد كامل', titleEn: 'Full Refund', descAr: 'استرداد كامل للمبلغ في حالة عدم الرضا التام', descEn: 'Full refund in case of complete dissatisfaction' },
      { emoji: '🎫', titleAr: 'رصيد تعويضي', titleEn: 'Compensation Credit', descAr: 'رصيد إضافي في محفظتكِ للاستخدام في الخدمات المستقبلية', descEn: 'Extra wallet credit for future services' },
    ],
    eligibility: ['جميع الخدمات مشمولة', 'خلال ٤٨ ساعة من الخدمة', 'الخدمات التي تقدمها فنيات معتمدات'],
  })),

  checkEligibility: customerProcedure
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ ctx, input }) => {
      const booking = await db.booking.findUnique({ where: { id: input.bookingId } });
      if (!booking || booking.customerId !== ctx.user.id) throw new Error('الحجز غير موجود');
      if (booking.status !== 'COMPLETED') return { eligible: false, reason: 'الخدمة لم تكتمل بعد' };
      const completedAt = new Date(booking.completedAt || booking.updatedAt);
      const hoursSinceCompletion = (Date.now() - completedAt.getTime()) / 3600000;
      if (hoursSinceCompletion > 48) return { eligible: false, reason: 'انتهت فترة الضمان (٤٨ ساعة)' };
      const existing = claims.find((c) => c.bookingId === input.bookingId && c.userId === ctx.user.id);
      if (existing) return { eligible: false, reason: 'تم تقديم مطالبة سابقة لهذا الحجز' };
      return { eligible: true, reason: null };
    }),

  claim: customerProcedure
    .input(z.object({ bookingId: z.number(), reason: z.string().min(10).max(500), compensationType: z.enum(['redo', 'refund', 'credit']) }))
    .mutation(async ({ ctx, input }) => {
      const booking = await db.booking.findUnique({ where: { id: input.bookingId } });
      if (!booking || booking.customerId !== ctx.user.id) throw new Error('الحجز غير موجود');
      const compensationMap = { redo: 0, refund: Number(booking.totalAmount || 0), credit: Math.round(Number(booking.totalAmount || 0) * 0.3) };
      const claim: WarrantyClaim = {
        id: claimId++, userId: ctx.user.id, bookingId: input.bookingId,
        reason: input.reason, status: 'PENDING',
        compensation: compensationMap[input.compensationType],
        createdAt: new Date().toISOString(),
      };
      claims.push(claim);
      return claim;
    }),

  myClaims: customerProcedure.query(async ({ ctx }) => claims.filter((c) => c.userId === ctx.user.id)),
});
