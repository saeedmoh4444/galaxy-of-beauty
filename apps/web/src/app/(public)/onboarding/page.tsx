'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card } from '@galaxy/ui';

const STEPS = [
  {
    title: '👋 أهلاً بكِ في جالكسي بيوتي!',
    desc: 'منصتكِ الشاملة للجمال والعناية. دعينا نأخذكِ في جولة سريعة.',
    action: 'هيا بنا!',
  },
  {
    title: '✨ اكتشفي الخدمات',
    desc: 'تصفحي مئات الخدمات من فنيات معتمدات — شعر، بشرة، مكياج، مساج والمزيد.',
    action: 'تصفحي الخدمات',
    link: '/services',
  },
  {
    title: '💄 اعرفي نوع بشرتكِ',
    desc: 'اختبار سريع يساعدكِ في معرفة نوع بشرتكِ والخدمات المناسبة لكِ.',
    action: 'ابدئي الاختبار',
    link: '/beauty-quiz',
  },
  {
    title: '👰 مناسبة خاصة؟',
    desc: 'خططي لإطلالتكِ المثالية مع خدمة تخطيط الزفاف والباقات المخصصة.',
    action: 'اكتشفي تخطيط الزفاف',
    link: '/bridal-concierge',
  },
  {
    title: '🎁 هدايا الجمال',
    desc: 'بطاقات هدايا وسجل هدايا — أهدي من تحبين أو اطلبي ما تتمنين.',
    action: 'تصفحي بطاقات الهدية',
    link: '/gift-cards',
  },
  {
    title: '🌸 أنتِ جاهزة!',
    desc: 'احجزي موعدكِ الأول اليوم واستمتعي بتجربة جمال لا تُنسى.',
    action: 'احجزي الآن',
    link: '/bookings/create',
  },
];

export default function OnboardingPage(): JSX.Element {
  const [step, setStep] = useState(0);
  const s = STEPS[step]!;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-accent-50 px-4 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Card padding="lg" className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-all ${i <= step ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            />
          ))}
        </div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">{s.title}</h1>
        <p className="mt-4 text-text-secondary dark:text-gray-400">{s.desc}</p>
        <div className="mt-8 flex gap-3 justify-center">
          {s.link ? (
            <Link href={s.link}>
              <Button size="lg">{s.action}</Button>
            </Link>
          ) : (
            <Button size="lg" onClick={() => setStep(step + 1)}>
              {s.action}
            </Button>
          )}
        </div>
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-4 text-sm text-text-tertiary hover:text-brand-600"
          >
            ← السابق
          </button>
        )}
        {!s.link && step < STEPS.length - 1 && (
          <button
            onClick={() => setStep(STEPS.length - 1)}
            className="mt-4 block w-full text-sm text-text-tertiary hover:text-brand-600"
          >
            تخطي
          </button>
        )}
      </Card>
    </div>
  );
}
