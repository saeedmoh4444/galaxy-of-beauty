import { z } from 'zod';
import { prisma } from '@galaxy/db';
import {
  computeCyclePredictions,
  guessMenopausePhase,
  isPamperWindow,
  getNutritionForGoal,
  POSTPARTUM_PHASES,
  POSTPARTUM_TIPS,
  MENOPAUSE_PHASES,
  MENOPAUSE_SIGNALS,
} from '@galaxy/shared';
import { customerMutation, customerProcedure, router } from '../trpc';

const db = prisma;

interface Domain {
  key: string;
  keywords: string[];
  emoji: string;
  labelAr: string;
  labelEn: string;
}

const DOMAINS: Domain[] = [
  // Order matters — pampering phrases contain "دورة", so it must be
  // checked BEFORE cycle.
  {
    key: 'pampering',
    keywords: ['تدليل', 'دللي', 'دورتي قريبة', 'pamper', 'period treat'],
    emoji: '🌸',
    labelAr: 'تدليل ما قبل الدورة',
    labelEn: 'Period pampering',
  },
  {
    key: 'cycle',
    keywords: ['دورة', 'دورتي', 'خصوبة', 'إباضة', 'حمل', 'period', 'cycle', 'fertile', 'pregnancy'],
    emoji: '🌙',
    labelAr: 'الدورة والخصوبة',
    labelEn: 'Cycle & fertility',
  },
  {
    key: 'nutrition',
    keywords: [
      'آكل',
      'أكل',
      'طعام',
      'تغذية',
      'نضارة',
      'شعري',
      'أظافر',
      'طاقة',
      'وزن',
      'eat',
      'nutrition',
      'food',
    ],
    emoji: '🥗',
    labelAr: 'التغذية',
    labelEn: 'Nutrition',
  },
  {
    key: 'postpartum',
    keywords: ['ولادة', 'نفاس', 'بعد الولادة', 'postpartum', 'newborn', 'baby'],
    emoji: '🤱',
    labelAr: 'ما بعد الولادة',
    labelEn: 'Postpartum',
  },
  {
    key: 'menopause',
    keywords: ['انقطاع', 'هبات', 'طمث', 'سن اليأس', 'menopause', 'hot flash'],
    emoji: '🌗',
    labelAr: 'انقطاع الطمث',
    labelEn: 'Menopause',
  },
  {
    key: 'fitness',
    keywords: [
      'لياقة',
      'لياقت', // "لياقتي" uses a plain ت, not ة
      'رياضة',
      'تمرين',
      'جيم',
      'نادي',
      'fitness',
      'workout',
      'gym',
      'trainer',
    ],
    emoji: '🏋️',
    labelAr: 'اللياقة',
    labelEn: 'Fitness',
  },
];

function detectDomain(q: string): Domain | null {
  const lower = q.toLowerCase();
  for (const d of DOMAINS) {
    if (d.keywords.some((k) => lower.includes(k.toLowerCase()))) return d;
  }
  return null;
}

/** Grounded, personalized answers — no LLM calls with health data (PDPL). */
async function answerDomain(domain: Domain, userId: number, q: string) {
  switch (domain.key) {
    case 'cycle': {
      const settings = await db.cycleSettings.findUnique({ where: { userId } });
      const p = computeCyclePredictions({
        cycleLength: settings?.cycleLength ?? 28,
        lastPeriodStart: settings?.lastPeriodStart ?? null,
        avgCycleLength: settings?.avgCycleLength,
      });
      const phase = p.phase;
      const answer =
        `أنتِ في ${phase.name} — اليوم ${p.currentDay} من دورتكِ (${p.cycleLength} يوماً). ` +
        (p.daysUntilNext !== null
          ? `دورتكِ القادمة بعد ${p.daysUntilNext} يوم${
              p.isFertileToday ? '، واليوم ضمن نافذة الخصوبة لديكِ ✨' : ''
            }.`
          : 'سجلي آخر دورة في متابعة الدورة لأحسب لكِ التنبؤات.') +
        (phase.tips.length > 0 ? ` نصيحة المرحلة: ${phase.tips[0]}.` : '');
      return {
        handled: true,
        domain: 'cycle',
        answer,
        links: [
          { href: '/cycle-tracker', key: 'lifeStage.link.cycle' },
          { href: '/clinics', key: 'lifeStage.link.clinics' },
        ],
      };
    }
    case 'nutrition': {
      const goalKey =
        q.includes('شعر') || q.includes('hair')
          ? 'hair'
          : q.includes('أظافر') || q.includes('nail')
            ? 'nails'
            : q.includes('طاقة') || q.includes('energy')
              ? 'energy'
              : q.includes('وزن') || q.includes('weight')
                ? 'weight'
                : 'glow';
      const goal = getNutritionForGoal(goalKey);
      const answer = `${goal.emoji} ${goal.nameAr}: ${goal.foods
        .slice(0, 3)
        .map((f) => f.ar)
        .join('، ')}. ${goal.meals[0] ? `فكرة وجبة: ${goal.meals[0].ar}.` : ''}`;
      return {
        handled: true,
        domain: 'nutrition',
        answer,
        links: [
          { href: '/wellness-hub', key: 'lifeStage.link.hub' },
          { href: '/stores', key: 'lifeStage.link.stores' },
        ],
      };
    }
    case 'postpartum': {
      const answer =
        `${POSTPARTUM_PHASES[0]!.emoji} ${POSTPARTUM_PHASES[0]!.titleAr} (${POSTPARTUM_PHASES[0]!.rangeAr}): ` +
        `${POSTPARTUM_PHASES[0]!.bodyAr} ` +
        `${POSTPARTUM_TIPS[0]!.ar}. ` +
        `تذكري: ${MENOPAUSE_SIGNALS.length ? 'راجعي طبيبتكِ فوراً مع أي من الأعراض المذكورة في مركز العافية.' : ''}`;
      return {
        handled: true,
        domain: 'postpartum',
        answer,
        links: [{ href: '/wellness-hub', key: 'lifeStage.link.hub' }],
      };
    }
    case 'menopause': {
      const settings = await db.cycleSettings.findUnique({ where: { userId } });
      const phase = guessMenopausePhase({ lastPeriodAt: settings?.lastPeriodAt ?? null });
      const phaseDef = MENOPAUSE_PHASES.find((p) => p.key === phase)!;
      const answer =
        `وضع انقطاع الطمث ${settings?.menopauseMode ? 'مفعّل' : 'غير مفعّل'} — يمكنكِ تفعيله من متابعة الدورة. ` +
        `مرحلتكِ المحتملة: ${phaseDef.emoji} ${phaseDef.titleAr}. ${phaseDef.bodyAr} ` +
        `تذكري: ${MENOPAUSE_SIGNALS[MENOPAUSE_SIGNALS.length - 1]!.ar}`;
      return {
        handled: true,
        domain: 'menopause',
        answer,
        links: [
          { href: '/wellness-hub', key: 'lifeStage.link.hub' },
          { href: '/clinics', key: 'lifeStage.link.clinics' },
        ],
      };
    }
    case 'pampering': {
      const settings = await db.cycleSettings.findUnique({ where: { userId } });
      const p = computeCyclePredictions({
        cycleLength: settings?.cycleLength ?? 28,
        lastPeriodStart: settings?.lastPeriodStart ?? null,
        avgCycleLength: settings?.avgCycleLength,
      });
      const window = isPamperWindow({
        daysUntilNext: p.daysUntilNext,
        currentDay: p.currentDay,
        hasSettings: p.hasSettings,
      });
      const answer = window
        ? 'نافذة التدليل مفتوحة 🌸 — ستجدين عروضاً مختارة ومجموعات العناية وخدمات المساج في مركز العافية.'
        : p.daysUntilNext !== null
          ? `نافذة التدليل تفتح قبل دورتكِ بـ ٣ أيام — باقي ${p.daysUntilNext} يوم.`
          : 'سجلي دورتكِ لتفعيل التدليل.';
      return {
        handled: true,
        domain: 'pampering',
        answer,
        links: [{ href: '/wellness-hub', key: 'lifeStage.link.hub' }],
      };
    }
    case 'fitness': {
      const profile = await db.beautyProfile.findUnique({ where: { userId } });
      const goals = profile?.fitnessGoals ?? [];
      const answer =
        goals.length > 0
          ? `أهدافكِ المسجلة: ${goals.join('، ')}. ننصح بجلسات تدريب شخصي مع مدربات معتمدات أو حصص جماعية في نادٍ نسائي.`
          : 'سجلي أهدافكِ في ملفك الجمالي لتحصلي على توصيات مخصصة. جرّبي جلسات التدريب الشخصي أو الحصص النسائية.';
      return {
        handled: true,
        domain: 'fitness',
        answer,
        links: [
          { href: '/gyms', key: 'nav.gyms' },
          { href: '/trainers', key: 'nav.trainers' },
        ],
      };
    }
    default:
      return null;
  }
}

export const lifestyleAIRouter = router({
  /**
   * ask — lifestyle questions answered from the platform's own data
   * (cycle predictions, nutrition library, postpartum/menopause content,
   * pamper window, fitness profile) with funnel links. handled=false means
   * the caller should fall back to the beauty aiAssistant.
   */
  ask: customerMutation
    .input(z.object({ question: z.string().min(2).max(500) }))
    .mutation(async ({ ctx, input }) => {
      const domain = detectDomain(input.question);
      if (!domain) {
        return {
          handled: false,
          domain: null,
          answer:
            'أسئلة نمط الحياة تشمل: الدورة والخصوبة، التغذية، اللياقة، ما بعد الولادة، انقطاع الطمث، وتدليل ما قبل الدورة.',
          links: [],
        };
      }
      return answerDomain(domain, ctx.user.id, input.question);
    }),

  /** topics — the lifestyle domains (bilingual, for the advisor chips). */
  topics: customerProcedure.query(() =>
    DOMAINS.map((d) => ({ key: d.key, emoji: d.emoji, labelAr: d.labelAr, labelEn: d.labelEn })),
  ),
});
