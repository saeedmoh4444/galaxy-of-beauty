'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, FormSkeleton, Button, formatCurrency } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
const OCCASIONS = [
  {
    id: 'birthday',
    emoji: '',
    name: 'marketing.gift-guide.occasion-birthday-name',
    desc: 'marketing.gift-guide.occasion-birthday-desc',
    gifts: [
      {
        title: 'marketing.gift-guide.gift-birthday-skin-title',
        price: 'marketing.gift-guide.gift-birthday-skin-price',
        desc: 'marketing.gift-guide.gift-birthday-skin-desc',
        emoji: '',
        link: '/services',
      },
      {
        title: 'marketing.gift-guide.gift-birthday-card-title',
        price: 'marketing.gift-guide.gift-birthday-card-price',
        desc: 'marketing.gift-guide.gift-birthday-card-desc',
        emoji: '',
        link: '/gift-cards',
      },
      {
        title: 'marketing.gift-guide.gift-birthday-nails-title',
        price: 'marketing.gift-guide.gift-birthday-nails-price',
        desc: 'marketing.gift-guide.gift-birthday-nails-desc',
        emoji: '',
        link: '/services',
      },
    ],
  },
  {
    id: 'wedding',
    emoji: '',
    name: 'marketing.gift-guide.occasion-wedding-name',
    desc: 'marketing.gift-guide.occasion-wedding-desc',
    gifts: [
      {
        title: 'marketing.gift-guide.gift-wedding-bride-title',
        price: 'marketing.gift-guide.gift-wedding-bride-price',
        desc: 'marketing.gift-guide.gift-wedding-bride-desc',
        emoji: '',
        link: '/bridal-concierge',
      },
      {
        title: 'marketing.gift-guide.gift-wedding-photo-title',
        price: 'marketing.gift-guide.gift-wedding-photo-price',
        desc: 'marketing.gift-guide.gift-wedding-photo-desc',
        emoji: '',
        link: '/services',
      },
      {
        title: 'marketing.gift-guide.gift-wedding-bride-card-title',
        price: 'marketing.gift-guide.gift-wedding-bride-card-price',
        desc: 'marketing.gift-guide.gift-wedding-bride-card-desc',
        emoji: '',
        link: '/gift-cards',
      },
    ],
  },
  {
    id: 'mom',
    emoji: '‍',
    name: 'marketing.gift-guide.occasion-mom-name',
    desc: 'marketing.gift-guide.occasion-mom-desc',
    gifts: [
      {
        title: 'marketing.gift-guide.gift-mom-day-title',
        price: 'marketing.gift-guide.gift-mom-day-price',
        desc: 'marketing.gift-guide.gift-mom-day-desc',
        emoji: '‍️',
        link: '/mommy-and-me',
      },
      {
        title: 'marketing.gift-guide.gift-mom-duo-title',
        price: 'marketing.gift-guide.gift-mom-duo-price',
        desc: 'marketing.gift-guide.gift-mom-duo-desc',
        emoji: '‍',
        link: '/mommy-and-me',
      },
      {
        title: 'marketing.gift-guide.gift-mom-registry-title',
        price: 'marketing.gift-guide.gift-mom-registry-price',
        desc: 'marketing.gift-guide.gift-mom-registry-desc',
        emoji: '',
        link: '/gift-registry',
      },
    ],
  },
  {
    id: 'eid',
    emoji: '',
    name: 'marketing.gift-guide.occasion-eid-name',
    desc: 'marketing.gift-guide.occasion-eid-desc',
    gifts: [
      {
        title: 'marketing.gift-guide.gift-eid-card-title',
        price: 'marketing.gift-guide.gift-eid-card-price',
        desc: 'marketing.gift-guide.gift-eid-card-desc',
        emoji: '',
        link: '/gift-cards',
      },
      {
        title: 'marketing.gift-guide.gift-eid-henna-title',
        price: 'marketing.gift-guide.gift-eid-henna-price',
        desc: 'marketing.gift-guide.gift-eid-henna-desc',
        emoji: '',
        link: '/services',
      },
      {
        title: 'marketing.gift-guide.gift-eid-makeup-title',
        price: 'marketing.gift-guide.gift-eid-makeup-price',
        desc: 'marketing.gift-guide.gift-eid-makeup-desc',
        emoji: '',
        link: '/services',
      },
    ],
  },
] as const;

export default function GiftGuidePage(): JSX.Element {
  const { t } = useLocale();
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-12">
        <span className="text-6xl"></span>
        <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">
          {t('marketing.gift-guide.title')}
        </h1>
        <p className="mt-2 text-text-secondary">{t('marketing.gift-guide.subtitle')}</p>
      </div>

      {OCCASIONS.map((occ) => (
        <div key={occ.id} className="mb-12">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-3xl">{occ.emoji}</span>
            <div>
              <h2 className="text-xl font-bold text-text-primary dark:text-gray-100">
                {t(occ.name)}
              </h2>
              <p className="text-sm text-text-secondary">{t(occ.desc)}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {occ.gifts.map((g, i) => (
              <Link key={i} href={g.link}>
                <Card hover padding="lg" className="h-full text-center">
                  <span className="text-4xl">{g.emoji}</span>
                  <h3 className="mt-3 font-bold text-text-primary dark:text-gray-100">
                    {t(g.title)}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">{t(g.desc)}</p>
                  <p className="mt-3 text-lg font-extrabold text-brand-600">{t(g.price)}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center mt-12 p-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl dark:from-pink-950 dark:to-purple-950">
        <h2 className="text-xl font-bold text-text-primary dark:text-gray-100">
          {t('marketing.gift-guide.not-found-title')}
        </h2>
        <p className="mt-2 text-text-secondary">{t('marketing.gift-guide.not-found-desc')}</p>
        <Link href="/gift-cards" className="mt-4 inline-block">
          <Button size="lg">{t('marketing.gift-guide.create-gift-card')}</Button>
        </Link>
      </div>

      <GiftQuizWidget />
    </div>
  );
}

function GiftQuizWidget(): JSX.Element {
  const { t } = useLocale();
  const { data: questions, isLoading: qLoading } = api.giftQuiz.questions.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const { data: results } = api.giftQuiz.recommend.useQuery(
    { answers },
    {
      enabled:
        Object.keys(answers).length === ((questions as Array<unknown>)?.length ?? 0) &&
        ((questions as Array<unknown>)?.length ?? 0) > 0,
    },
  ) as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const qs = (questions ?? []) as Array<Record<string, unknown>>;
  const currentQ = qs[step];
  const done = Object.keys(answers).length === qs.length && qs.length > 0;

  const reset = () => {
    setStep(0);
    setAnswers({});
  };

  if (qs.length === 0 && !qLoading) return <></>;

  return (
    <div className="mt-16 text-center">
      <h2 className="text-2xl font-bold">{t('marketing.gift-guide.quiz-title')}</h2>
      <p className="mt-2 text-text-secondary">{t('marketing.gift-guide.quiz-subtitle')}</p>

      {qLoading ? (
        <FormSkeleton fields={4} />
      ) : done && results ? (
        <div className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {results.slice(0, 4).map((r: Record<string, unknown>) => (
              <Card key={r.id as number} padding="lg" className="text-center">
                <span className="text-4xl">{r.emoji as string}</span>
                <h3 className="font-bold mt-2">{r.nameAr as string}</h3>
                <p className="text-xs text-text-secondary mt-1">{r.descAr as string}</p>
                <p className="text-xl font-extrabold text-brand-600 mt-2">
                  {formatCurrency(Number(r.price))}
                </p>
                <div className="mt-2 h-2 bg-surface-muted rounded-full">
                  <div
                    className="h-2 bg-brand-600 rounded-full"
                    style={{ width: `${r.score as number}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
          <Button onClick={reset} variant="outline" className="mt-4">
            {t('marketing.gift-guide.retry')}
          </Button>
        </div>
      ) : currentQ ? (
        <Card padding="lg" className="mt-6 max-w-lg mx-auto">
          <div className="flex gap-1 mb-4">
            {qs.map((_: unknown, i: number) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-brand-600' : 'bg-gray-200'}`}
              />
            ))}
          </div>
          <h3 className="text-lg font-bold mb-3">{currentQ.questionAr as string}</h3>
          <div className="space-y-2">
            {(currentQ.options as Array<Record<string, unknown>>).map(
              (o: Record<string, unknown>) => (
                <button
                  key={o.key as string}
                  onClick={() => {
                    setAnswers((prev) => ({ ...prev, [currentQ.id as string]: o.key as string }));
                    if (step < qs.length - 1) setStep(step + 1);
                  }}
                  className="w-full rounded-xl border-2 border-edge p-3 text-right hover:border-brand-400 hover:bg-brand-50 transition-all"
                >
                  {o.labelAr as string}
                </button>
              ),
            )}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
