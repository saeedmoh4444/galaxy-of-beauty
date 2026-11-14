import crypto from 'crypto';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { DEFAULT_PLATFORM_FEE_SAR } from '@galaxy/shared';
import { customerProcedure, publicProcedure, router } from '../trpc';
import { isJummahBlocked, JUMMAH_BLOCK_REASON } from '../lib/jummah';
import { WOMENS_SERVICES } from '@galaxy/shared/catalog/womens';
import { resolveWomensServiceId } from './womensServicesMap';

export const womensServicesRouter = router({
  categories: publicProcedure.query(() =>
    Object.entries(WOMENS_SERVICES).map(([key, cat]) => ({
      key,
      nameAr: cat.nameAr,
      nameEn: cat.nameEn,
      emoji: cat.emoji,
      description: cat.description,
      serviceCount: cat.subServices.length,
    })),
  ),

  byCategory: publicProcedure.input(z.object({ category: z.string() })).query(async ({ input }) => {
    const cat = WOMENS_SERVICES[input.category as keyof typeof WOMENS_SERVICES];
    if (!cat) throw new TRPCError({ code: 'NOT_FOUND', message: 'القسم غير موجود' });
    return cat;
  }),

  // E-womens — booking with special requirements. The facade item maps
  // to a real seeded Service row (see womensServicesMap.ts); the booking
  // is created against it and the requested facade item travels in the
  // notes. Never returns a confirmed booking that was not created.
  book: customerProcedure
    .input(
      z.object({
        serviceId: z.string(),
        category: z.string(),
        preferredDate: z.string().optional(),
        specialNotes: z.string().optional(),
        pregnancyTrimester: z.number().min(1).max(3).optional(),
        postpartumWeeks: z.number().optional(),
        // Real booking fields (the stub never booked anything).
        addressId: z.number().int().positive(),
        startAt: z.string().datetime(),
        endAt: z.string().datetime(),
        idempotencyKey: z.string().uuid(),
        // W2-7 — book-on-behalf parity with bookings.create (K1).
        familyMemberId: z.number().int().positive().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const cat = WOMENS_SERVICES[input.category as keyof typeof WOMENS_SERVICES];
      const svc = cat?.subServices.find((s) => s.id === input.serviceId);
      if (!svc) throw new TRPCError({ code: 'NOT_FOUND', message: 'Women service not found' });

      const specialRequirements = [
        input.pregnancyTrimester ? `ثلاثي الحمل: ${input.pregnancyTrimester}` : null,
        input.postpartumWeeks ? `أسابيع بعد الولادة: ${input.postpartumWeeks}` : null,
        input.specialNotes,
      ].filter(Boolean);

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
          service: svc.nameAr,
          price: Number(existing.totalAmount),
          durationMin: svc.durationMin,
          specialRequirements,
        };
      }

      // D2 — resolve the facade item to a real seeded service: the
      // (category, facadeId) mapping table first (the single source of
      // truth seeded for all 289 items), then the deterministic keyword
      // rules as the fallback for unmapped ids.
      const mappedServiceId = await resolveWomensServiceId(input.category, svc.id, svc.nameEn);
      const service = await prisma.service.findFirst({
        where: { id: mappedServiceId, isActive: true },
      });
      if (!service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Women service is not bookable yet',
        });
      }
      const mappedTo = (service.titleJson as { en?: string }).en ?? svc.nameEn;

      // Jummah window — same rule as the main booking flow.
      if (isJummahBlocked(new Date(input.startAt), new Date(input.endAt))) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: JUMMAH_BLOCK_REASON });
      }

      // W2-7 — parity with bookings.create: family member must exist and
      // belong to the booking customer; the address must be the caller's.
      if (input.familyMemberId) {
        const member = await prisma.familyMember.findUnique({
          where: { id: input.familyMemberId },
        });
        if (!member) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Family member not found' });
        }
        if (member.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Family member belongs to another customer',
          });
        }
      }
      const address = await prisma.address.findUnique({ where: { id: input.addressId } });
      if (!address) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Address not found' });
      }
      if (address.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Address belongs to another customer',
        });
      }

      // Technician auto-assign: W2-7 — pick a technician MAPPED to the
      // resolved service (technician↔service), never an arbitrary
      // first-by-id technician. Inactive = suspended.
      const mapping = await prisma.technicianService.findFirst({
        where: { serviceId: service.id, isActive: true, technician: { suspendedAt: null } },
        orderBy: { technicianId: 'asc' },
        include: { technician: { select: { id: true, userId: true } } },
      });
      if (!mapping) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No technician available for this service',
        });
      }
      const technician = mapping.technician;

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
          familyMemberId: input.familyMemberId ?? null,
          notes: [
            `Women service: ${svc.nameAr} (${svc.nameEn})`,
            `maps to: ${mappedTo}`,
            ...specialRequirements,
          ]
            .filter(Boolean)
            .join(' — '),
        },
      });

      return {
        booked: true,
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        status: booking.status,
        service: svc.nameAr,
        price: Number(service.basePrice),
        durationMin: service.durationMin,
        specialRequirements,
        mappedTo,
      };
    }),

  safetyTips: publicProcedure.input(z.object({ category: z.string() })).query(async ({ input }) => {
    const tips: Record<string, string[]> = {
      pregnancy_safe: [
        'تجنبي المنتجات المحتوية على الريتينول',
        'استخدمي واقي شمس طبيعي',
        'أخبري الفنية بحملكِ قبل الجلسة',
        'تجنبي الزيوت العطرية القوية',
      ],
      postpartum: [
        'انتظري ٦ أسابيع بعد الولادة الطبيعية',
        'استشيري طبيبكِ قبل أي علاج',
        'أخبري الفنية إذا كنتِ ترضعين طبيعياً',
      ],
      henna: [
        'تأكدي من استخدام حناء طبيعية',
        'تجنبي الحناء السوداء الكيميائية',
        'اختبري على منطقة صغيرة أولاً',
      ],
      brows_lashes: [
        'تأكدي من تعقيم الأدوات',
        'أخبري الفنية عن أي حساسية',
        'تجنبي الفرك بعد التركيب',
      ],
      body_contouring: [
        'استشيري طبيب قبل الجلسات',
        'اشربي ماء بكثرة بعد الجلسة',
        'التزمي بعدد الجلسات الموصى به',
      ],
      intimate_care: [
        'جميع الخدمات بخصوصية تامة',
        'فنيات متخصصات ومعتمدات',
        'منتجات طبية آمنة ومعقمة',
      ],
      mommy_makeover: [
        'احجزي الجلسة في وقت تكونين فيه مرتاحة',
        'أحضري صورة إطلالتكِ المفضلة',
        'استمتعي بيومكِ الخاص',
      ],
      teen_beauty: [
        'خدمات مناسبة للعمر',
        'منتجات لطيفة وخالية من العطور',
        'استشارة مجانية للروتين المناسب',
      ],
      menopause: [
        'استخدمي منتجات غنية بالكولاجين',
        'الترطيب المكثف ضروري',
        'تجنبي المنتجات القاسية',
      ],
      hijab_care: [
        'جلسات بخصوصية تامة',
        'اهتمي بفروة الرأس',
        'جففي شعركِ جيداً قبل الارتداء',
        'استخدمي أغطية حرير',
      ],
      pcos_care: ['استشيري طبيبكِ قبل العلاج', 'منتجات طبية مخصصة', 'متابعة دورية للبشرة'],
      bridal_prep: [
        'ابدئي قبل ٦ أشهر من الزفاف',
        'جلسات منتظمة أفضل من جلسة واحدة',
        'جربي المكياج قبل الزفاف بشهر',
      ],
      working_woman: [
        'خدمات سريعة في ٢٠-٦٠ دقيقة',
        'احجزي خلال استراحة الغداء',
        'باقات موفرة للوقت',
      ],
      breastfeeding_safe: [
        'تجنبي الريتينول والساليسيليك',
        'أخبري الفنية أنكِ مرضعة',
        'استخدمي منتجات طبيعية ١٠٠٪',
      ],
      fertility_wellness: [
        'استخدمي منتجات طبيعية فقط',
        'تجنبي الزيوت العطرية القوية',
        'استشيري طبيبكِ قبل أي علاج',
      ],
      post_surgery: [
        'استشيري طبيبكِ أولاً',
        'لا تبدأي قبل التئام الجروح',
        'أخبري الفنية عن العملية',
      ],
      cycle_synced: [
        'تجنبي العلاجات القوية خلال الدورة',
        'المساج الدافئ يخفف الآلام',
        'البشرة تكون أكثر حساسية',
      ],
      mature_skin: [
        'استخدمي منتجات غنية بمضادات الأكسدة',
        'الترطيب العميق أساسي',
        'تجنبي المنتجات القاسية',
      ],
      ramadan_beauty: [
        'احجزي قبل الإفطار أو بعد التراويح',
        'اهتمي بالترطيب خلال الصيام',
        'تجنبي العلاجات المجهدة',
      ],
    };
    return tips[input.category] ?? [];
  }),
});
