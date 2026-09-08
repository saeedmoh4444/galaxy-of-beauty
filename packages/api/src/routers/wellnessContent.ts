import { z } from 'zod';
import {
  BREATHING_EXERCISES,
  MEDITATIONS,
  getJournalPrompts,
  getNutritionForGoal,
  NUTRITION_LIBRARY,
} from '@galaxy/shared';
import { customerProcedure, router } from '../trpc';

/**
 * E4b — curated mental-wellness + nutrition content (the postCare pattern:
 * vetted bilingual libraries served read-only). The data lives in
 * @galaxy/shared so web, mobile and future AI features share one source.
 */
export const wellnessContentRouter = router({
  breathing: customerProcedure.query(() => BREATHING_EXERCISES),

  meditations: customerProcedure.query(() => MEDITATIONS),

  prompts: customerProcedure
    .input(
      z.object({
        mood: z.number().min(1).max(5).optional(),
        category: z.enum(['selfLove', 'gratitude', 'goals', 'beauty']).optional(),
      }),
    )
    .query(({ input }) => getJournalPrompts(input)),

  nutrition: customerProcedure
    .input(z.object({ goal: z.string().optional() }))
    .query(({ input }) => getNutritionForGoal(input.goal)),

  /** All goal keys — the UI chips render from this (localized names). */
  nutritionGoals: customerProcedure.query(() =>
    NUTRITION_LIBRARY.map((g) => ({
      key: g.key,
      nameAr: g.nameAr,
      nameEn: g.nameEn,
      emoji: g.emoji,
    })),
  ),
});
