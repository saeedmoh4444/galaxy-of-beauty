'use client';

import { useState } from 'react';
import { useLocale } from '@/components/LocaleProvider';
import { Card, Button, FORTUNE_ANIMATION_MS } from '@galaxy/ui';
import Link from 'next/link';

const FORTUNES = [
  {
    text: 'marketing.beauty-fortune.fortune-1',
    emoji: '',
    tip: 'marketing.beauty-fortune.tip-1',
  },
  {
    text: 'marketing.beauty-fortune.fortune-2',
    emoji: '',
    tip: 'marketing.beauty-fortune.tip-2',
  },
  {
    text: 'marketing.beauty-fortune.fortune-3',
    emoji: '',
    tip: 'marketing.beauty-fortune.tip-3',
  },
  {
    text: 'marketing.beauty-fortune.fortune-4',
    emoji: '',
    tip: 'marketing.beauty-fortune.tip-4',
  },
  {
    text: 'marketing.beauty-fortune.fortune-5',
    emoji: '',
    tip: 'marketing.beauty-fortune.tip-5',
  },
  {
    text: 'marketing.beauty-fortune.fortune-6',
    emoji: '',
    tip: 'marketing.beauty-fortune.tip-6',
  },
  {
    text: 'marketing.beauty-fortune.fortune-7',
    emoji: '',
    tip: 'marketing.beauty-fortune.tip-7',
  },
  {
    text: 'marketing.beauty-fortune.fortune-8',
    emoji: '',
    tip: 'marketing.beauty-fortune.tip-8',
  },
  {
    text: 'marketing.beauty-fortune.fortune-9',
    emoji: '',
    tip: 'marketing.beauty-fortune.tip-9',
  },
  {
    text: 'marketing.beauty-fortune.fortune-10',
    emoji: '',
    tip: 'marketing.beauty-fortune.tip-10',
  },
  {
    text: 'marketing.beauty-fortune.fortune-11',
    emoji: '',
    tip: 'marketing.beauty-fortune.tip-11',
  },
  {
    text: 'marketing.beauty-fortune.fortune-12',
    emoji: '',
    tip: 'marketing.beauty-fortune.tip-12',
  },
] as const;

const SERVICE_LINKS: Record<string, { href: string }> = {
  '‍️': { href: '/services' },
  '': { href: '/services' },
  '': { href: '/services' },
  '': { href: '/services' },
  '': { href: '/services' },
  default: { href: '/services' },
};

export default function BeautyFortunePage(): JSX.Element {
  const { t } = useLocale();
  const [fortune, setFortune] = useState<(typeof FORTUNES)[number] | null>(null);
  const [opening, setOpening] = useState(false);

  const openFortune = () => {
    setOpening(true);
    setTimeout(() => {
      const random = FORTUNES[Math.floor(Math.random() * FORTUNES.length)]!;
      setFortune(random);
      setOpening(false);
    }, FORTUNE_ANIMATION_MS);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 px-4 dark:from-gray-950 dark:via-purple-950 dark:to-pink-950">
      <div className="w-full max-w-md text-center">
        {!fortune && !opening && (
          <div>
            <span className="text-8xl"></span>
            <h1 className="mt-6 text-3xl font-extrabold text-text-primary dark:text-gray-100">
              {t('marketing.beauty-fortune.title')}
            </h1>
            <p className="mt-2 text-text-secondary dark:text-gray-400">
              {t('marketing.beauty-fortune.subtitle')}
            </p>
            <Button onClick={openFortune} size="lg" className="mt-8">
              {t('marketing.beauty-fortune.open')}
            </Button>
          </div>
        )}

        {opening && (
          <div className="animate-pulse">
            <span className="text-8xl"></span>
            <p className="mt-4 text-text-secondary">{t('marketing.beauty-fortune.opening')}</p>
          </div>
        )}

        {fortune && !opening && (
          <Card padding="lg" className="bg-white/90 backdrop-blur dark:bg-gray-900/90">
            <span className="text-6xl">{fortune.emoji}</span>
            <p className="mt-6 text-2xl font-bold text-text-primary dark:text-gray-100 leading-relaxed">
              {t(fortune.text)}
            </p>
            <div className="mt-6 rounded-xl bg-brand-50 p-4 dark:bg-brand-950">
              <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
                {t('marketing.beauty-fortune.tip-of-day')}
              </p>
              <p className="mt-1 text-brand-600 dark:text-brand-400">{t(fortune.tip)}</p>
            </div>
            <div className="mt-6 flex gap-3 justify-center">
              <Button onClick={openFortune} variant="outline">
                {t('marketing.beauty-fortune.another')}
              </Button>
              <Link href={SERVICE_LINKS[fortune.emoji]?.href || '/services'}>
                <Button>{t('marketing.beauty-fortune.book-now')}</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
