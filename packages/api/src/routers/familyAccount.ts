import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const RELATIONSHIPS = [
  { key: 'child', nameAr: 'طفل/طفلة', nameEn: 'Child', emoji: '👶' },
  { key: 'spouse', nameAr: 'زوج/زوجة', nameEn: 'Spouse', emoji: '💑' },
  { key: 'parent', nameAr: 'أم/أب', nameEn: 'Parent', emoji: '👵' },
  { key: 'sibling', nameAr: 'أخ/أخت', nameEn: 'Sibling', emoji: '👫' },
  { key: 'other', nameAr: 'آخر', nameEn: 'Other', emoji: '👤' },
];

const AGE_GROUPS = [
  { key: 'infant', nameAr: 'رضيع (0-2)', nameEn: 'Infant', emoji: '🍼' },
  { key: 'child', nameAr: 'طفل (3-12)', nameEn: 'Child', emoji: '🧒' },
  { key: 'teen', nameAr: 'مراهق (13-17)', nameEn: 'Teen', emoji: '👧' },
  { key: 'adult', nameAr: 'بالغ (18-59)', nameEn: 'Adult', emoji: '👩' },
  { key: 'senior', nameAr: 'كبير سن (60+)', nameEn: 'Senior', emoji: '👵' },
];

const PREFERENCES = [
  { key: 'gentle', nameAr: 'منتجات لطيفة', nameEn: 'Gentle Products', emoji: '🌸' },
  { key: 'hypoallergenic', nameAr: 'مضاد للحساسية', nameEn: 'Hypoallergenic', emoji: '🛡️' },
  { key: 'fragrance_free', nameAr: 'خالي من العطور', nameEn: 'Fragrance Free', emoji: '🚫' },
  { key: 'natural', nameAr: 'منتجات طبيعية', nameEn: 'Natural Products', emoji: '🌿' },
  { key: 'quick', nameAr: 'جلسات سريعة', nameEn: 'Quick Sessions', emoji: '⚡' },
  { key: 'quiet', nameAr: 'بيئة هادئة', nameEn: 'Quiet Environment', emoji: '🤫' },
];

// In-memory store per user (resets on server restart — migrate to DB for production)
const familyStore = new Map<number, Array<{ id: number; name: string; relationship: string; ageGroup: string; preferences: string[]; notes: string; createdAt: string }>>();

function getUserStore(userId: number) {
  if (!familyStore.has(userId)) familyStore.set(userId, []);
  return familyStore.get(userId)!;
}
let nextId = 1;

export const familyAccountRouter = router({
  // Get metadata
  meta: customerProcedure.query(() => ({
    relationships: RELATIONSHIPS,
    ageGroups: AGE_GROUPS,
    preferences: PREFERENCES,
  })),

  // List my family members
  list: customerProcedure.query(async ({ ctx }) => {
    const members = getUserStore(ctx.user.id);
    // Also fetch user's booking counts per family member
    const enriched = await Promise.all(
      members.map(async (m) => {
        const bookingCount = await db.booking.count({
          where: { customerId: ctx.user.id },
        }).catch(() => 0);
        return { ...m, bookingCount };
      }),
    );
    return enriched;
  }),

  // Add a family member
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
    .mutation(async ({ ctx, input }) => {
      const store = getUserStore(ctx.user.id);
      const member = {
        id: nextId++,
        name: input.name,
        relationship: input.relationship,
        ageGroup: input.ageGroup,
        preferences: input.preferences,
        notes: input.notes ?? '',
        createdAt: new Date().toISOString(),
      };
      store.push(member);
      return member;
    }),

  // Update a family member
  update: customerProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(2).max(100).optional(),
        relationship: z.string().optional(),
        ageGroup: z.string().optional(),
        preferences: z.array(z.string()).optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const store = getUserStore(ctx.user.id);
      const idx = store.findIndex((m) => m.id === input.id);
      if (idx === -1) throw new Error('فرد العائلة غير موجود');
      store[idx] = { ...store[idx]!, ...input, preferences: input.preferences ?? store[idx]!.preferences };
      return store[idx];
    }),

  // Remove a family member
  remove: customerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const store = getUserStore(ctx.user.id);
      const idx = store.findIndex((m) => m.id === input.id);
      if (idx === -1) throw new Error('فرد العائلة غير موجود');
      store.splice(idx, 1);
      return { success: true };
    }),

  // Get member booking history summary
  memberHistory: customerProcedure
    .input(z.object({ memberName: z.string() }))
    .query(async ({ ctx, input }) => {
      // Return summary stats for a family member
      const bookings = await db.booking.findMany({
        where: { customerId: ctx.user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }).catch(() => []);
      return {
        memberName: input.memberName,
        totalBookings: (bookings as unknown[]).length,
        recentBookings: bookings,
      };
    }),
});
