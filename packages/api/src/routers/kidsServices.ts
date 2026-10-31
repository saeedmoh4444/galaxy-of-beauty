import crypto from 'crypto';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { DEFAULT_PLATFORM_FEE_SAR } from '@galaxy/shared';
import { customerProcedure, publicProcedure, router } from '../trpc';
import { isJummahBlocked, JUMMAH_BLOCK_REASON } from '../lib/jummah';

const KIDS_CATEGORIES = {
  baby: {
    nameAr: 'عناية الرضع (0-2)',
    nameEn: 'Baby Care (0-2)',
    emoji: '👶',
    description: 'خدمات لطيفة وآمنة للرضع — منتجات طبيعية ١٠٠٪',
    subServices: [
      {
        id: 'bb1',
        nameAr: 'قص شعر أول مرة',
        nameEn: 'First Haircut',
        price: 80,
        durationMin: 15,
        ageMin: 0,
        emoji: '✂️',
      },
      {
        id: 'bb2',
        nameAr: 'تدليك رضيع',
        nameEn: 'Baby Massage',
        price: 120,
        durationMin: 25,
        ageMin: 1,
        emoji: '💆',
      },
      {
        id: 'bb3',
        nameAr: 'عناية بالأظافر',
        nameEn: 'Baby Nail Care',
        price: 60,
        durationMin: 15,
        ageMin: 0,
        emoji: '💅',
      },
    ],
  },
  toddler: {
    nameAr: 'عناية الأطفال (3-6)',
    nameEn: 'Toddler Care (3-6)',
    emoji: '🧸',
    description: 'خدمات ممتعة وآمنة للأطفال الصغار',
    subServices: [
      {
        id: 'td1',
        nameAr: 'قص شعر أطفال',
        nameEn: 'Kids Haircut',
        price: 60,
        durationMin: 30,
        ageMin: 3,
        emoji: '💇',
      },
      {
        id: 'td2',
        nameAr: 'تسريحة شعر',
        nameEn: 'Kids Hairstyling',
        price: 100,
        durationMin: 25,
        ageMin: 3,
        emoji: '🎀',
      },
      {
        id: 'td3',
        nameAr: 'مانيكير أطفال',
        nameEn: 'Kids Manicure',
        price: 60,
        durationMin: 20,
        ageMin: 4,
        emoji: '💅',
      },
      {
        id: 'td4',
        nameAr: 'رسم على الوجه',
        nameEn: 'Face Painting',
        price: 50,
        durationMin: 15,
        ageMin: 3,
        emoji: '🎨',
      },
    ],
  },
  kids: {
    nameAr: 'عناية البنات (7-12)',
    nameEn: 'Girls Care (7-12)',
    emoji: '👧',
    description: 'أولى خطوات العناية بالجمال — تعليم ومرح',
    subServices: [
      {
        id: 'kd1',
        nameAr: 'قص وتصفيف شعر',
        nameEn: 'Haircut & Style',
        price: 90,
        durationMin: 30,
        ageMin: 7,
        emoji: '💇',
      },
      {
        id: 'kd2',
        nameAr: 'عناية بالأظافر',
        nameEn: 'Manicure',
        price: 70,
        durationMin: 25,
        ageMin: 7,
        emoji: '💅',
      },
      {
        id: 'kd3',
        nameAr: 'جلسة تعليم عناية',
        nameEn: 'Beauty Lesson',
        price: 120,
        durationMin: 40,
        ageMin: 7,
        emoji: '📚',
      },
      {
        id: 'kd4',
        nameAr: 'تسريحة مناسبة',
        nameEn: 'Party Hairstyle',
        price: 110,
        durationMin: 30,
        ageMin: 7,
        emoji: '🎀',
      },
    ],
  },
  teens: {
    nameAr: 'عناية المراهقات (13-17)',
    nameEn: 'Teen Care (13-17)',
    emoji: '🌸',
    description: 'خدمات عناية مناسبة للمراهقات — بشرة وشعر وأظافر',
    subServices: [
      {
        id: 'tn1',
        nameAr: 'عناية بالبشرة',
        nameEn: 'Teen Facial',
        price: 120,
        durationMin: 35,
        ageMin: 13,
        emoji: '🧖',
      },
      {
        id: 'tn2',
        nameAr: 'مكياج خفيف',
        nameEn: 'Light Makeup',
        price: 130,
        durationMin: 35,
        ageMin: 14,
        emoji: '💄',
      },
      {
        id: 'tn3',
        nameAr: 'تصفيف شعر',
        nameEn: 'Hair Styling',
        price: 100,
        durationMin: 35,
        ageMin: 13,
        emoji: '💇',
      },
      {
        id: 'tn4',
        nameAr: 'مانيكير مراهقات',
        nameEn: 'Teen Manicure',
        price: 80,
        durationMin: 25,
        ageMin: 13,
        emoji: '💅',
      },
      {
        id: 'tn5',
        nameAr: 'استشارة عناية',
        nameEn: 'Beauty Consultation',
        price: 80,
        durationMin: 25,
        ageMin: 13,
        emoji: '💬',
      },
    ],
  },
};

export const kidsServicesRouter = router({
  categories: publicProcedure.query(() =>
    Object.entries(KIDS_CATEGORIES).map(([key, cat]) => ({
      key,
      nameAr: cat.nameAr,
      emoji: cat.emoji,
      description: cat.description,
      serviceCount: cat.subServices.length,
    })),
  ),

  byCategory: publicProcedure.input(z.object({ category: z.string() })).query(async ({ input }) => {
    const cat = KIDS_CATEGORIES[input.category as keyof typeof KIDS_CATEGORIES];
    if (!cat) throw new Error('غير موجود');
    return cat;
  }),

  book: customerProcedure
    .input(
      z.object({
        serviceId: z.string(),
        category: z.string(),
        childName: z.string().min(1),
        childAge: z.number().min(0).max(17),
        parentNotes: z.string().optional(),
        // C1a — real booking fields (the stub never booked anything).
        addressId: z.number().int().positive(),
        startAt: z.string().datetime(),
        endAt: z.string().datetime(),
        idempotencyKey: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Idempotency replay — the caller's own booking comes back, never
      // a second row.
      const existing = await prisma.booking.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        select: { id: true, bookingCode: true, status: true, totalAmount: true },
      });
      if (existing) {
        return {
          booked: true,
          bookingId: existing.id,
          bookingCode: existing.bookingCode,
          status: existing.status,
          childName: input.childName,
          price: Number(existing.totalAmount),
        };
      }

      const cat = KIDS_CATEGORIES[input.category as keyof typeof KIDS_CATEGORIES];
      const svc = cat?.subServices.find((s) => s.id === input.serviceId);
      if (!svc) throw new TRPCError({ code: 'NOT_FOUND', message: 'Kids service not found' });

      // C1a — the facade resolves to the REAL seeded service by exact
      // titleJson.en match (seed guarantees one row per facade entry).
      const service = await prisma.service.findFirst({
        where: {
          titleJson: { path: ['en'], equals: svc.nameEn },
          isActive: true,
        },
      });
      if (!service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Kids service is not bookable yet',
        });
      }

      // Jummah window — same rule as the main booking flow.
      const blocked = isJummahBlocked(new Date(input.startAt), new Date(input.endAt));
      if (blocked) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: JUMMAH_BLOCK_REASON });
      }

      // Technician auto-assign: the platform assigns the first available
      // technician until the B.4 selection flow lands (same convention as
      // the mobile booking create). Inactive = suspended.
      const technician = await prisma.technician.findFirst({
        where: { suspendedAt: null },
        orderBy: { id: 'asc' },
        select: { userId: true },
      });
      if (!technician) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'No technician available' });
      }

      const bookingCode = `GOB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const booking = await prisma.booking.create({
        data: {
          bookingCode,
          customerId: ctx.user.id,
          technicianId: technician.userId,
          serviceId: service.id,
          addressId: input.addressId,
          startAt: new Date(input.startAt),
          endAt: new Date(input.endAt),
          status: 'REQUESTED',
          totalAmount: service.basePrice,
          platformFee: Number(process.env['PLATFORM_FEE_SAR']) || DEFAULT_PLATFORM_FEE_SAR,
          paymentFee: 0,
          idempotencyKey: input.idempotencyKey,
          notes: [`Kids booking: ${input.childName} (age ${input.childAge})`, input.parentNotes]
            .filter(Boolean)
            .join(' — '),
        },
      });

      return {
        booked: true,
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        status: booking.status,
        childName: input.childName,
        price: Number(service.basePrice),
        durationMin: service.durationMin,
        tip: svc.ageMin > 0 ? `مناسبة من عمر ${svc.ageMin} سنوات` : 'مناسبة لجميع الأعمار',
      };
    }),

  safetyTips: publicProcedure.query(() => [
    'جميع المنتجات طبيعية وآمنة للأطفال',
    'فنيات متخصصات في التعامل مع الأطفال',
    'بيئة آمنة ومريحة وممتعة',
    'يمكن للأم البقاء مع الطفل طوال الجلسة',
    'تعقيم كامل لجميع الأدوات',
  ]),
});
