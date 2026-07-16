import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, adminProcedure, router } from '../trpc';

export const aiFeaturesRouter = router({
  // ── Personalized Home Feed ─────────────────────────────
  personalizedFeed: customerProcedure.query(async ({ ctx }) => {
    // Based on booking history, wishlist, skin analysis
    const [recentBookings, wishlist, lastAnalysis] = await Promise.all([
      prisma.booking.findMany({ where: { customerId: ctx.user.id }, include: { service: { select: { categoryId: true } } }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.wishlistItem.findMany({ where: { userId: ctx.user.id }, include: { service: { select: { id: true, titleJson: true, imageUrl: true, basePrice: true } } }, take: 10 }),
      prisma.skinAnalysis.findFirst({ where: { userId: ctx.user.id }, orderBy: { createdAt: 'desc' } }),
    ]);

    // Get category preferences from booking history
    const preferredCategoryIds = [...new Set(recentBookings.map((b) => b.service.categoryId))];

    // Recommend services from preferred categories
    let recommendations: Array<Record<string, unknown>> = [];
    if (preferredCategoryIds.length > 0) {
      recommendations = await prisma.service.findMany({
        where: { categoryId: { in: preferredCategoryIds }, isActive: true },
        include: { category: { select: { nameJson: true } } },
        take: 8,
      });
    }

    return {
      preferredCategories: preferredCategoryIds,
      wishlistItems: wishlist.map((w) => w.service),
      recommendations,
      skinProfile: lastAnalysis ? {
        skinType: lastAnalysis.skinType,
        concerns: lastAnalysis.concerns,
      } : null,
      message: recommendations.length > 0 ? 'Based on your preferences' : 'Browse our services to get started',
    };
  }),

  // ── Smart Scheduling Assistant ──────────────────────────
  smartSchedule: customerProcedure
    .input(z.object({ serviceId: z.number(), datePreference: z.string().optional() }))
    .query(async ({ input }) => {
      // Find best time slots based on technician availability + historical patterns
      const targetDate = input.datePreference ? new Date(input.datePreference) : new Date();
      targetDate.setHours(0, 0, 0, 0);

      const endDate = new Date(targetDate);
      endDate.setDate(endDate.getDate() + 7);

      // Find available slots for this service
      const technicianServices = await prisma.technicianService.findMany({
        where: { serviceId: input.serviceId },
        include: {
          technician: {
            include: {
              availabilitySlots: {
                where: {
                  isBooked: false,
                  startAt: { gte: targetDate, lte: endDate },
                },
                orderBy: { startAt: 'asc' },
                take: 5,
              },
            },
          },
        },
        take: 10,
      });

      // Flatten and rank by time proximity
      const suggestedSlots: Array<Record<string, unknown>> = [];
      for (const ts of technicianServices) {
        for (const slot of ts.technician.availabilitySlots) {
          suggestedSlots.push({
            technicianId: ts.technicianId,
            slotId: slot.id,
            startAt: slot.startAt,
            endAt: slot.endAt,
            rating: Number(ts.technician.ratingAvg),
          });
        }
      }

      // Sort: closest time first, then by rating
      suggestedSlots.sort((a, b) => {
        const aTime = new Date(a.startAt as string).getTime();
        const bTime = new Date(b.startAt as string).getTime();
        if (Math.abs(aTime - bTime) < 3600000) return (b.rating as number) - (a.rating as number);
        return aTime - bTime;
      });

      return { suggestions: suggestedSlots.slice(0, 10) };
    }),

  // ── Service Description Generator (AI) ─────────────────
  generateDescription: adminProcedure
    .input(z.object({ serviceNameAr: z.string(), serviceNameEn: z.string(), keywords: z.string().optional() }))
    .mutation(async ({ input }) => {
      const key = process.env['OPENAI_API_KEY'];
      if (!key) return { descriptionAr: 'وصف تجريبي للخدمة', descriptionEn: 'Sample service description' };

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{
              role: 'user',
              content: `Write a short, appealing beauty service description in Arabic and English for: ${input.serviceNameAr} / ${input.serviceNameEn}. Keywords: ${input.keywords || 'beauty, self-care, professional'}. Return JSON: { "ar": "...", "en": "..." }`,
            }],
            max_tokens: 300,
          }),
        });
        const data = (await response.json()) as Record<string, unknown>;
        const content = (data['choices'] as Array<Record<string, unknown>>)?.[0]?.['message'] as Record<string, unknown> | undefined;
        if (content?.['content']) {
          return JSON.parse(content['content'] as string);
        }
      } catch { /* fall through to fallback */ }
      return { descriptionAr: 'وصف تجريبي للخدمة', descriptionEn: 'Sample service description' };
    }),

  // ── Sentiment Analysis on Reviews ──────────────────────
  analyzeSentiment: adminProcedure
    .input(z.object({ reviewId: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const review = await prisma.review.findUnique({ where: { id: input.reviewId } });
      if (!review?.comment) return { sentiment: 'neutral', score: 0 };

      // Simple keyword-based sentiment (production: use OpenAI)
      const positiveWords = ['ممتاز', 'رائع', 'جميل', 'great', 'excellent', 'love', 'amazing', 'perfect'];
      const negativeWords = ['سيء', 'مخيب', 'bad', 'terrible', 'poor', 'worst', 'disappointed'];

      const text = review.comment.toLowerCase();
      let score = 0;
      for (const w of positiveWords) if (text.includes(w)) score++;
      for (const w of negativeWords) if (text.includes(w)) score--;

      const sentiment = score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
      return { sentiment, score };
    }),
});
