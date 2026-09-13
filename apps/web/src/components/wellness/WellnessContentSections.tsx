'use client';
/**
 * E4b — mental wellness + nutrition sections for the wellness hub:
 * guided breathing (with a simple phase timer), short meditations, the daily
 * journaling prompt, and beauty-goal nutrition cards. Content comes from the
 * wellnessContent router (@galaxy/shared libraries).
 */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, Button } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

type Exercise = {
  key: string;
  nameAr: string;
  nameEn: string;
  emoji: string;
  inhale: number;
  hold: number;
  exhale: number;
  cycles: number;
  minutes: number;
  benefitAr: string;
  benefitEn: string;
};

type Meditation = {
  key: string;
  titleAr: string;
  titleEn: string;
  emoji: string;
  minutes: number;
  stepsAr: string[];
  stepsEn: string[];
};

type Prompt = { key: string; category: string; ar: string; en: string; emoji: string };

type NutritionGoal = {
  key: string;
  nameAr: string;
  nameEn: string;
  emoji: string;
  foods: Array<{ ar: string; en: string; emoji: string }>;
  meals: Array<{ titleAr: string; titleEn: string; emoji: string; ar: string; en: string }>;
};

function pick(text: { ar: string; en: string }, locale: string): string {
  return locale === 'en' ? text.en : text.ar;
}

// ── Guided breathing timer ────────────────────────────────────────────────

function BreathingTimer({ exercise }: { exercise: Exercise }): JSX.Element {
  const { t } = useLocale();
  type Phase = 'inhale' | 'hold' | 'exhale';
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [secondsLeft, setSecondsLeft] = useState(exercise.inhale);
  const [cycle, setCycle] = useState(1);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        // Phase done — advance.
        if (phase === 'inhale') {
          if (exercise.hold > 0) {
            setPhase('hold');
            return exercise.hold;
          }
          setPhase('exhale');
          return exercise.exhale;
        }
        if (phase === 'hold') {
          setPhase('exhale');
          return exercise.exhale;
        }
        // Exhale done — next cycle or stop.
        if (cycle >= exercise.cycles) {
          setRunning(false);
          setPhase('inhale');
          setCycle(1);
          return exercise.inhale;
        }
        setCycle((c) => c + 1);
        setPhase('inhale');
        return exercise.inhale;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, phase, cycle, exercise]);

  const reset = () => {
    setRunning(false);
    setPhase('inhale');
    setCycle(1);
    setSecondsLeft(exercise.inhale);
  };

  return (
    <div className="mt-3 rounded-xl bg-brand-50 dark:bg-brand-950/40 p-4 text-center">
      <p className="text-2xl font-extrabold">
        {t(`wellnessContent.${phase}`)} · {secondsLeft}
      </p>
      <p className="text-xs text-text-secondary mt-1">
        {t('wellnessContent.cycle', { cycle, total: exercise.cycles })}
      </p>
      <div className="flex justify-center gap-2 mt-3">
        <Button size="sm" onClick={() => (running ? setRunning(false) : setRunning(true))}>
          {running ? t('wellnessContent.stop') : t('wellnessContent.start')}
        </Button>
        <Button size="sm" variant="ghost" onClick={reset}>
          ↺
        </Button>
      </div>
    </div>
  );
}

// ── Breathing + meditations section ───────────────────────────────────────

export function MentalWellnessSection(): JSX.Element {
  const { t, locale } = useLocale();
  const { data: exercises } = api.wellnessContent.breathing.useQuery();
  const { data: meditations } = api.wellnessContent.meditations.useQuery();
  const [active, setActive] = useState<string | null>(null);

  const list = (exercises ?? []) as Exercise[];
  const meds = (meditations ?? []) as Meditation[];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card padding="lg">
        <h3 className="font-bold mb-1">{t('wellnessContent.breatheTitle')}</h3>
        <p className="text-xs text-text-secondary mb-3">{t('wellnessContent.breatheSubtitle')}</p>
        <div className="space-y-2">
          {list.map((e) => (
            <div key={e.key} className="rounded-xl bg-surface-muted p-3">
              <button
                className="w-full text-start flex items-center justify-between"
                onClick={() => setActive(active === e.key ? null : e.key)}
              >
                <span className="font-bold text-sm">
                  {e.emoji} {pick({ ar: e.nameAr, en: e.nameEn }, locale)}
                </span>
                <span className="text-xs text-text-secondary">
                  {t('wellnessContent.minutes', { min: e.minutes })}
                </span>
              </button>
              <p className="text-xs text-text-tertiary mt-1">
                {t('wellnessContent.pattern', {
                  inhale: e.inhale,
                  hold: e.hold,
                  exhale: e.exhale,
                  cycles: e.cycles,
                })}
              </p>
              {active === e.key && <BreathingTimer exercise={e} />}
            </div>
          ))}
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="font-bold mb-3">{t('wellnessContent.meditationTitle')}</h3>
        <div className="space-y-2">
          {meds.map((m) => (
            <details key={m.key} className="rounded-xl bg-surface-muted p-3">
              <summary className="cursor-pointer font-bold text-sm">
                {m.emoji} {pick({ ar: m.titleAr, en: m.titleEn }, locale)}
                <span className="text-xs text-text-secondary font-normal ms-2">
                  {t('wellnessContent.minutes', { min: m.minutes })}
                </span>
              </summary>
              <ol className="mt-2 space-y-1 text-sm text-text-secondary">
                {(locale === 'en' ? m.stepsEn : m.stepsAr).map((step, i) => (
                  <li key={i}>
                    {i + 1}. {step}
                  </li>
                ))}
              </ol>
            </details>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Daily journaling prompt ───────────────────────────────────────────────

export function JournalPromptCard(): JSX.Element {
  const { t, locale } = useLocale();
  const { data: prompts } = api.wellnessContent.prompts.useQuery({});
  const prompt = useMemo(() => {
    const list = (prompts ?? []) as Prompt[];
    if (list.length === 0) return null;
    // One prompt per day — stable across the day, rotates daily.
    const dayOfYear = Math.floor(Date.now() / 86_400_000) % list.length;
    return list[dayOfYear]!;
  }, [prompts]);

  if (!prompt) return <></>;
  return (
    <Card padding="lg" className="border-2 border-brand-100 dark:border-brand-900">
      <h3 className="font-bold mb-2">{t('wellnessContent.journalPromptTitle')}</h3>
      <p className="text-lg font-medium">
        {prompt.emoji} {pick(prompt, locale)}
      </p>
      <Link href="/beauty-journal">
        <Button size="sm" variant="outline" className="mt-3">
          {t('wellnessContent.writeNow')}
        </Button>
      </Link>
    </Card>
  );
}

// ── Nutrition for beauty goals ────────────────────────────────────────────

export function NutritionSection(): JSX.Element {
  const { t, locale } = useLocale();
  const { data: goals } = api.wellnessContent.nutritionGoals.useQuery();
  const [goalKey, setGoalKey] = useState('glow');
  const { data: goal } = api.wellnessContent.nutrition.useQuery({ goal: goalKey });

  const list = (goals ?? []) as Array<{
    key: string;
    nameAr: string;
    nameEn: string;
    emoji: string;
  }>;
  const card = goal as NutritionGoal | undefined;

  return (
    <Card padding="lg">
      <h3 className="font-bold mb-3">{t('wellnessContent.nutritionTitle')}</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {list.map((g) => (
          <button
            key={g.key}
            onClick={() => setGoalKey(g.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              goalKey === g.key ? 'bg-brand-600 text-white' : 'bg-surface-muted text-text-secondary'
            }`}
          >
            {g.emoji} {pick({ ar: g.nameAr, en: g.nameEn }, locale)}
          </button>
        ))}
      </div>
      {card && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold text-text-secondary mb-2">
              {t('wellnessContent.nutritionFoods')}
            </p>
            <ul className="space-y-1 text-sm">
              {card.foods.map((f, i) => (
                <li key={i}>
                  {f.emoji} {pick(f, locale)}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold text-text-secondary mb-2">
              {t('wellnessContent.nutritionMeals')}
            </p>
            <ul className="space-y-2 text-sm">
              {card.meals.map((m) => (
                <li key={m.titleEn} className="rounded-xl bg-surface-muted p-2">
                  <p className="font-bold">
                    {m.emoji} {pick({ ar: m.titleAr, en: m.titleEn }, locale)}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">{pick(m, locale)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
