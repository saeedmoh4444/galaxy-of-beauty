import { z } from 'zod';
import { publicProcedure, adminProcedure, router } from '../trpc';
import { generateContent } from '../lib/contentGen/provider';

/** Parse a provider reply that should be JSON with ar/en fields. */
function parseBilingual(
  text: string,
  fallbackAr: string,
  fallbackEn: string,
): { ar: string; en: string } {
  try {
    const parsed = JSON.parse(text) as { ar?: string; en?: string };
    return { ar: parsed.ar ?? fallbackAr, en: parsed.en ?? fallbackEn };
  } catch {
    return { ar: fallbackAr, en: fallbackEn };
  }
}

export const contentGenRouter = router({
  // Which provider is active (mock until OPENAI_API_KEY is configured).
  status: publicProcedure.query(() => ({
    provider: process.env['OPENAI_API_KEY'] ? 'openai' : 'mock',
    configured: Boolean(process.env['OPENAI_API_KEY']),
  })),

  generateServiceDescription: adminProcedure
    .input(
      z.object({
        serviceNameAr: z.string().min(2).max(80),
        serviceNameEn: z.string().min(2).max(80),
        keywords: z.array(z.string().max(40)).max(6).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const prompt =
        `serviceNameAr="${input.serviceNameAr}" serviceNameEn="${input.serviceNameEn}"` +
        (input.keywords?.length ? ` keywords=${input.keywords.join(',')}` : '');
      const { text, provider } = await generateContent(
        prompt,
        'Reply with JSON: {"ar": "Arabic SEO description", "en": "English SEO description"}',
      );
      const { ar, en } = parseBilingual(text, input.serviceNameAr, input.serviceNameEn);
      return { ar, en, provider };
    }),

  generateSocialCaption: adminProcedure
    .input(
      z.object({
        topic: z.string().min(2).max(120),
        platform: z.enum(['instagram', 'twitter', 'tiktok', 'whatsapp']).optional(),
        tone: z.string().max(40).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const prompt =
        `topic="${input.topic}"` +
        (input.platform ? ` platform=${input.platform}` : '') +
        (input.tone ? ` tone=${input.tone}` : '');
      const { text, provider } = await generateContent(
        prompt,
        'Reply with JSON: {"ar": "Arabic caption with emojis", "en": "English caption with emojis"}',
      );
      const { ar, en } = parseBilingual(text, input.topic, input.topic);
      return { ar, en, provider };
    }),

  generateFaqAnswer: adminProcedure
    .input(
      z.object({
        question: z.string().min(5).max(200),
        serviceName: z.string().min(2).max(80),
      }),
    )
    .mutation(async ({ input }) => {
      const { text, provider } = await generateContent(
        `question="${input.question}" serviceNameAr="${input.serviceName}"`,
        'Reply with JSON: {"ar": "Arabic FAQ answer", "en": "English FAQ answer"}',
      );
      const { ar, en } = parseBilingual(text, input.serviceName, input.serviceName);
      return { ar, en, provider };
    }),

  generateBlogDraft: adminProcedure
    .input(
      z.object({
        titleAr: z.string().min(3).max(120),
        titleEn: z.string().min(3).max(120),
      }),
    )
    .mutation(async ({ input }) => {
      const { text, provider } = await generateContent(
        `titleAr="${input.titleAr}" titleEn="${input.titleEn}"`,
        'Reply with JSON: {"titleAr": "...", "titleEn": "...", "bodyAr": "3-4 paragraphs", "bodyEn": "3-4 paragraphs"}',
      );
      try {
        const parsed = JSON.parse(text) as {
          titleAr?: string;
          titleEn?: string;
          bodyAr?: string;
          bodyEn?: string;
        };
        return {
          titleAr: parsed.titleAr ?? input.titleAr,
          titleEn: parsed.titleEn ?? input.titleEn,
          bodyAr: parsed.bodyAr ?? '',
          bodyEn: parsed.bodyEn ?? '',
          provider,
          status: 'DRAFT', // human review before publish
        };
      } catch {
        return {
          titleAr: input.titleAr,
          titleEn: input.titleEn,
          bodyAr: text,
          bodyEn: text,
          provider,
          status: 'DRAFT',
        };
      }
    }),
});
