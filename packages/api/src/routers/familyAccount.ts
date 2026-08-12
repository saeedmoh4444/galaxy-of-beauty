import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

const RELATIONSHIPS = [
  { key: 'child', nameAr: 'طفل/طفلة', nameEn: 'Child', emoji: '' },
  { key: 'spouse', nameAr: 'زوج/زوجة', nameEn: 'Spouse', emoji: '' },
  { key: 'parent', nameAr: 'أم/أب', nameEn: 'Parent', emoji: '' },
  { key: 'sibling', nameAr: 'أخ/أخت', nameEn: 'Sibling', emoji: '' },
  { key: 'other', nameAr: 'آخر', nameEn: 'Other', emoji: '' },
];

const AGE_GROUPS = [
  { key: 'infant', nameAr: 'رضيع (0-2)', nameEn: 'Infant', emoji: '' },
  { key: 'child', nameAr: 'طفل (3-12)', nameEn: 'Child', emoji: '' },
  { key: 'teen', nameAr: 'مراهق (13-17)', nameEn: 'Teen', emoji: '' },
  { key: 'adult', nameAr: 'بالغ (18-59)', nameEn: 'Adult', emoji: '' },
  { key: 'senior', nameAr: 'كبير سن (60+)', nameEn: 'Senior', emoji: '' },
];

const PREFERENCES = [
  { key: 'gentle', nameAr: 'منتجات لطيفة', nameEn: 'Gentle Products', emoji: '' },
  { key: 'hypoallergenic', nameAr: 'مضاد للحساسية', nameEn: 'Hypoallergenic', emoji: '️' },
  { key: 'fragrance_free', nameAr: 'خالي من العطور', nameEn: 'Fragrance Free', emoji: '' },
  { key: 'natural', nameAr: 'منتجات طبيعية', nameEn: 'Natural Products', emoji: '' },
  { key: 'quick', nameAr: 'جلسات سريعة', nameEn: 'Quick Sessions', emoji: '' },
  { key: 'quiet', nameAr: 'بيئة هادئة', nameEn: 'Quiet Environment', emoji: '' },
];

export const familyAccountRouter = router({
  meta: customerProcedure.query(() => ({
    relationships: RELATIONSHIPS,
    ageGroups: AGE_GROUPS,
    preferences: PREFERENCES,
  })),

  list: customerProcedure.query(async ({ ctx }) => {
    const members = await prisma.familyMember.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return members.map((m) => ({ ...m, preferences: m.preferences ?? [], bookingCount: 0 }));
  }),

  add: customerProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        relationship: z.string(),
        ageGroup: z.string(),
        preferences: z.array(z.string()).default([]),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      prisma.familyMember.create({
        data: {
          userId: ctx.user.id,
          name: input.name,
          relationship: input.relationship,
          ageGroup: input.ageGroup,
          preferences: input.preferences,
          notes: input.notes ?? '',
        },
      }),
    ),

  update: customerProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        relationship: z.string().optional(),
        ageGroup: z.string().optional(),
        preferences: z.array(z.string()).optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const member = await prisma.familyMember.findFirst({ where: { id, userId: ctx.user.id } });
      if (!member) throw new Error('فرد العائلة غير موجود');
      return prisma.familyMember.update({ where: { id }, data });
    }),

  remove: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await prisma.familyMember.deleteMany({ where: { id: input.id, userId: ctx.user.id } });
    return { success: true };
  }),

  memberHistory: customerProcedure
    .input(z.object({ memberName: z.string() }))
    .query(async ({ ctx }) => ({
      memberName: ctx.user.email,
      totalBookings: 0,
      recentBookings: [],
    })),
});
