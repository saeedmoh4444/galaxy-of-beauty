import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, router } from '../trpc';

const PROFILES: Record<string, { emoji: string; title: string; services: string[] }> = {
  office: { emoji: '💼', title: 'مكتبية', services: ['مكياج يومي', 'تسريحة عملية', 'مانيكير'] },
  healthcare: { emoji: '🩺', title: 'طبية', services: ['عناية بالبشرة', 'حواجب', 'أظافر قصيرة'] },
  education: { emoji: '📚', title: 'تعليمية', services: ['تنظيف بشرة', 'ترطيب', 'مكياج خفيف'] },
  entrepreneur: { emoji: '💎', title: 'رائدة أعمال', services: ['مكياج احترافي', 'تسريحة', 'استشارة ألوان'] },
  media: { emoji: '🎥', title: 'إعلامية', services: ['مكياج HD', 'تسريحة', 'مانيكير'] },
  customer_facing: { emoji: '🤝', title: 'خدمة عملاء', services: ['مكياج طبيعي', 'ابتسامة هوليوود', 'أظافر'] },
};

export const careerBeautyRouter = router({
  getProfile: publicProcedure
    .input(z.object({ profession: z.enum(['office', 'healthcare', 'education', 'entrepreneur', 'media', 'customer_facing']) }))
    .query(({ input }) => {
      const profile = PROFILES[input.profession]!;
      return { profession: input.profession, ...profile };
    }),

  listProfessions: publicProcedure.query(() => {
    return Object.entries(PROFILES).map(([key, val]) => ({ key, emoji: val.emoji, title: val.title }));
  }),
});
