import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

const CLINICS = [
  {
    id: 1,
    name: 'عيادة د. ليلى الجلدية',
    city: 'الرياض',
    specialty: 'جلدية',
    emoji: '',
    rating: 4.9,
    referralFee: 0,
  },
  {
    id: 2,
    name: 'مركز البشرة التجميلي',
    city: 'جدة',
    specialty: 'جلدية وتجميل',
    emoji: '',
    rating: 4.8,
    referralFee: 0,
  },
  {
    id: 3,
    name: 'مجمع الجمال الطبي',
    city: 'الدمام',
    specialty: 'جلدية وليزر',
    emoji: '',
    rating: 4.7,
    referralFee: 0,
  },
];

const REFERRALS: Array<{
  id: number;
  userId: number;
  clinicId: number;
  reason: string;
  status: string;
  createdAt: string;
}> = [];
let refId = 1;

export const clinicConnectRouter = router({
  clinics: customerProcedure.query(() => CLINICS),
  refer: customerProcedure
    .input(
      z.object({
        clinicId: z.number(),
        reason: z.string().min(1).max(500),
        urgency: z.enum(['routine', 'urgent', 'emergency']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const clinic = CLINICS.find((c) => c.id === input.clinicId);
      const ref = {
        id: refId++,
        userId: ctx.user.id,
        clinicId: input.clinicId,
        reason: input.reason,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      REFERRALS.push(ref);
      return {
        ...ref,
        clinicName: clinic?.name,
        message: 'تم إرسال الإحالة. ستتواصل العيادة معكِ خلال ٢٤ ساعة.',
      };
    }),
  myReferrals: customerProcedure.query(async ({ ctx }) =>
    REFERRALS.filter((r) => r.userId === ctx.user.id),
  ),
});
