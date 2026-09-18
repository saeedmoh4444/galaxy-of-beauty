import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import type { Prisma } from '@galaxy/db';
import { OPENAI_API_URL, OPENAI_MODEL, EXPERIMENTAL_FEATURES } from '@galaxy/shared';
import { protectedProcedure, router, requireFeatureFlag } from '../trpc';

const flag = requireFeatureFlag(EXPERIMENTAL_FEATURES.SKIN_ANALYSIS);

/**
 * 3.1 bridge contract — the exact shape the Vision prompt must return.
 * Strict enums mean a hallucinated value fails the whole parse and the
 * row falls back to the deterministic stub instead of storing junk.
 */
const skinAnalysisResultSchema = z.object({
  skinType: z.enum(['oily', 'dry', 'combination', 'sensitive', 'normal']).nullable().optional(),
  concerns: z
    .array(
      z.enum([
        'acne',
        'aging',
        'dark_spots',
        'redness',
        'dryness',
        'large_pores',
        'uneven_texture',
      ]),
    )
    .optional()
    .default([]),
  hydrationLevel: z.string().nullable().optional(),
  sensitivityLevel: z.string().nullable().optional(),
  ageEstimate: z.number().nullable().optional(),
  undertone: z.enum(['cool', 'warm', 'neutral']).nullable().optional(),
  faceShape: z.enum(['oval', 'round', 'square', 'heart', 'diamond', 'long']).nullable().optional(),
  colorPalette: z
    .array(z.string().regex(/^#[0-9A-Fa-f]{6}$/))
    .max(8)
    .optional()
    .default([]),
  recommendations: z
    .object({
      services: z.array(z.string()),
      products: z.array(z.string()),
      routine: z.array(z.string()),
    })
    .optional(),
});

const SKIN_ANALYSIS_PROMPT =
  'Analyze this skin photo and return ONLY a JSON object (no markdown, no prose) with exactly these keys: ' +
  'skinType (one of oily|dry|combination|sensitive|normal|null), ' +
  'concerns (array of snake_case codes from: acne, aging, dark_spots, redness, dryness, large_pores, uneven_texture), ' +
  'hydrationLevel (string|null), sensitivityLevel (string|null), ageEstimate (number|null), ' +
  'undertone (one of cool|warm|neutral|null), ' +
  'faceShape (one of oval|round|square|heart|diamond|long|null), ' +
  'colorPalette (4-6 hex colors like #E8C4A0 that flatter this face), ' +
  'recommendations (object with Arabic string arrays: services, products, routine).';

const FALLBACK_RESULT = { skinType: 'unknown', concerns: [], note: 'OpenAI key not configured' };

export const skinAnalysisRouter = router({
  // Submit a photo for analysis
  analyze: protectedProcedure
    .use(flag)
    .input(
      z.object({
        // http(s) only: OpenAI Vision cannot fetch file:// or data: URIs, and
        // zod's z.string().url() accepts those — silently degrading analysis.
        // Clients must upload first (uploads.uploadMedia) and pass the URL.
        imageUrl: z
          .string()
          .url()
          .refine((u) => u.startsWith('https://') || u.startsWith('http://'), {
            message: 'imageUrl must be an http(s) URL — upload the photo first',
          }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Call OpenAI Vision API for skin analysis
      let analysisResult: Record<string, unknown> = FALLBACK_RESULT;
      let parsed: z.infer<typeof skinAnalysisResultSchema> | null = null;

      const openaiKey = process.env['OPENAI_API_KEY'];
      if (openaiKey) {
        try {
          const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: OPENAI_MODEL,
              messages: [
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: SKIN_ANALYSIS_PROMPT },
                    { type: 'image_url', image_url: { url: input.imageUrl } },
                  ],
                },
              ],
              max_tokens: 1000,
            }),
          });
          const data = (await response.json()) as Record<string, unknown>;
          const content = (data['choices'] as Array<Record<string, unknown>>)?.[0]?.['message'] as
            Record<string, unknown> | undefined;
          if (content?.['content']) {
            try {
              const raw = JSON.parse(content['content'] as string);
              // Strict parse: any out-of-enum value fails the whole row.
              parsed = skinAnalysisResultSchema.safeParse(raw).success
                ? (raw as z.infer<typeof skinAnalysisResultSchema>)
                : null;
              if (parsed) analysisResult = parsed as unknown as Record<string, unknown>;
            } catch {
              // Unparseable AI output — keep the stub.
              analysisResult = { ...FALLBACK_RESULT, note: 'AI analysis unavailable' };
            }
          }
        } catch {
          // AI unavailable — keep the fallback result.
          analysisResult = { ...FALLBACK_RESULT, note: 'AI analysis unavailable' };
        }
      }

      const row = await prisma.skinAnalysis.create({
        data: {
          userId: ctx.user.id,
          imageUrl: input.imageUrl,
          resultJson: analysisResult as unknown as Prisma.InputJsonValue,
          skinType: (analysisResult['skinType'] as string) || null,
          concerns: (analysisResult['concerns'] as string[]) || [],
          recommendations: analysisResult['recommendations'] || undefined,
        },
      });

      // 3.1 bridge — merge parsed fields into BeautyProfile (merge-only:
      // never wipes fields the AI did not report).
      if (parsed) {
        const patch: Record<string, unknown> = {};
        if (parsed.skinType) patch.skinType = parsed.skinType;
        if (parsed.concerns.length > 0) patch.concerns = parsed.concerns;
        if (parsed.undertone) patch.undertone = parsed.undertone;
        if (parsed.faceShape) patch.faceShape = parsed.faceShape;
        if (parsed.colorPalette.length > 0) patch.colorPalette = parsed.colorPalette;
        if (Object.keys(patch).length > 0) {
          await prisma.beautyProfile.upsert({
            where: { userId: ctx.user.id },
            create: { userId: ctx.user.id, ...patch },
            update: patch,
          });
        }
      }

      return row;
    }),

  // Get analysis history
  history: protectedProcedure
    .use(flag)
    .input(z.object({ page: z.number().default(1), limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      const [items, total] = await Promise.all([
        prisma.skinAnalysis.findMany({
          where: { userId: ctx.user.id },
          orderBy: { createdAt: 'desc' },
          skip,
          take: input.limit,
        }),
        prisma.skinAnalysis.count({ where: { userId: ctx.user.id } }),
      ]);
      return { items, total, page: input.page };
    }),

  // Get a specific analysis
  getById: protectedProcedure
    .use(flag)
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const analysis = await prisma.skinAnalysis.findUnique({ where: { id: input.id } });
      if (!analysis || analysis.userId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
      return analysis;
    }),
});
