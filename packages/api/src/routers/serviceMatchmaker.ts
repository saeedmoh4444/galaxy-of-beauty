import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

const QUESTIONS = [
  { id: 'occasion', q: 'ما هي المناسبة؟', opts: [{ k: 'daily', l: 'يومي ☀️', t: ['basic'] }, { k: 'work', l: 'عمل 💼', t: ['natural'] }, { k: 'party', l: 'حفلة 🎉', t: ['glam'] }, { k: 'wedding', l: 'زفاف 👰', t: ['luxury'] }, { k: 'date', l: 'موعد رومانسي 💑', t: ['elegant'] }] },
  { id: 'budget', q: 'ميزانيتك؟', opts: [{ k: 'low', l: 'اقتصادية 💰', t: ['budget'] }, { k: 'mid', l: 'متوسطة 💵', t: ['standard'] }, { k: 'high', l: 'فاخرة 💎', t: ['premium'] }] },
  { id: 'area', q: 'ما تهتمين به؟', opts: [{ k: 'face', l: 'وجه ✨', t: ['skincare', 'makeup'] }, { k: 'hair', l: 'شعر 💇‍♀️', t: ['hair'] }, { k: 'body', l: 'جسم 🧖‍♀️', t: ['massage', 'spa'] }, { k: 'nails', l: 'أظافر 💅', t: ['nails'] }, { k: 'all', l: 'كل شيء 🌟', t: ['full'] }] },
];

const SERVICES = [
  { id: 1, nameAr: 'مكياج احترافي', emoji: '💄', price: 300, tags: ['glam', 'luxury', 'makeup', 'premium'] },
  { id: 2, nameAr: 'تنظيف بشرة عميق', emoji: '✨', price: 200, tags: ['skincare', 'standard', 'basic'] },
  { id: 3, nameAr: 'تسريحة شعر', emoji: '💇‍♀️', price: 200, tags: ['hair', 'elegant', 'standard'] },
  { id: 4, nameAr: 'مساج استرخائي', emoji: '💆‍♀️', price: 250, tags: ['massage', 'spa', 'standard'] },
  { id: 5, nameAr: 'مانيكير وباديكير', emoji: '💅', price: 180, tags: ['nails', 'basic', 'budget'] },
  { id: 6, nameAr: 'حمام مغربي', emoji: '🧖‍♀️', price: 350, tags: ['spa', 'luxury', 'full', 'premium'] },
  { id: 7, nameAr: 'مكياج طبيعي', emoji: '🌸', price: 200, tags: ['natural', 'makeup', 'daily', 'budget'] },
  { id: 8, nameAr: 'عناية بالبشرة', emoji: '🧴', price: 150, tags: ['skincare', 'basic', 'daily', 'budget'] },
];

export const serviceMatchmakerRouter = router({
  questions: publicProcedure.query(() => QUESTIONS),
  match: publicProcedure
    .input(z.object({ answers: z.record(z.string(), z.string()) }))
    .query(async ({ input }) => {
      const userTags: string[] = [];
      for (const [qId, optKey] of Object.entries(input.answers)) {
        const q = QUESTIONS.find((x) => x.id === qId);
        const opt = q?.opts.find((o) => o.k === optKey);
        if (opt) userTags.push(...opt.t);
      }
      const scored = SERVICES.map((s) => ({ ...s, score: Math.min(100, Math.round((s.tags.filter((t) => userTags.includes(t)).length / Math.max(1, userTags.length)) * 100)) }));
      return scored.sort((a, b) => b.score - a.score).slice(0, 4);
    }),
});
