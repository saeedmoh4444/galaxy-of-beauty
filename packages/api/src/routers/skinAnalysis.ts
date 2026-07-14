import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { protectedProcedure, router } from '../trpc';

export const skinAnalysisRouter = router({
  // Submit a photo for analysis
  analyze: protectedProcedure
    .input(z.object({ imageUrl: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      // Call OpenAI Vision API for skin analysis (stub)
      let analysisResult: Record<string, unknown> = {};

      const openaiKey = process.env['OPENAI_API_KEY'];
      if (openaiKey) {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [{
                role: 'user',
                content: [
                  { type: 'text', text: 'Analyze this skin photo. Return JSON: { skinType, concerns[], hydrationLevel, sensitivityLevel, ageEstimate, recommendations: { services: [], products: [], routine: [] } }. Arabic + English.' },
                  { type: 'image_url', image_url: { url: input.imageUrl } },
                ],
              }],
              max_tokens: 1000,
            }),
          });
          const data = (await response.json()) as Record<string, unknown>;
          const content = (data['choices'] as Array<Record<string, unknown>>)?.[0]?.['message'] as Record<string, unknown> | undefined;
          if (content?.['content']) {
            try {
              analysisResult = JSON.parse(content['content'] as string);
            } catch {
              analysisResult = { raw: content['content'] };
            }
          }
        } catch {
          // AI unavailable — return stub result
          analysisResult = { skinType: 'unknown', concerns: [], note: 'AI analysis unavailable' };
        }
      } else {
        analysisResult = { skinType: 'unknown', concerns: [], note: 'OpenAI key not configured' };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (prisma as any).skinAnalysis.create({
        data: {
          userId: ctx.user.id,
          imageUrl: input.imageUrl,
          resultJson: analysisResult,
          skinType: analysisResult['skinType'] as string || null,
          concerns: analysisResult['concerns'] as string[] || [],
          recommendations: analysisResult['recommendations'] || undefined,
        },
      });
    }),

  // Get analysis history
  history: protectedProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      const [items, total] = await Promise.all([
        prisma.skinAnalysis.findMany({
          where: { userId: ctx.user.id },
          orderBy: { createdAt: 'desc' },
          skip, take: input.limit,
        }),
        prisma.skinAnalysis.count({ where: { userId: ctx.user.id } }),
      ]);
      return { items, total, page: input.page };
    }),

  // Get a specific analysis
  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const analysis = await prisma.skinAnalysis.findUnique({ where: { id: input.id } });
      if (!analysis || analysis.userId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
      return analysis;
    }),
});
