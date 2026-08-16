'use client';

import { useState } from 'react';
import { Card, Button, FORTUNE_ANIMATION_MS } from '@galaxy/ui';
import Link from 'next/link';

const FORTUNES = [
  {
    text: 'جمالكِ يبدأ من داخلكِ — اعتني بنفسكِ اليوم ',
    emoji: '',
    tip: 'اشربي ٨ أكواب ماء اليوم لبشرة متألقة',
  },
  {
    text: 'الابتسامة هي أفضل إكسسوار يمكنكِ ارتداؤه ',
    emoji: '',
    tip: 'ابتسمي — تفرز الإندورفين وتحسن البشرة',
  },
  {
    text: 'أنتِ أجمل عندما تكونين على طبيعتكِ ',
    emoji: '',
    tip: 'اختاري مكياج يبرز جمالكِ الطبيعي',
  },
  {
    text: 'الاعتناء بنفسكِ ليس رفاهية — إنه ضرورة ‍️',
    emoji: '',
    tip: 'خصصي ٣٠ دقيقة يومياً للعناية ببشرتكِ',
  },
  {
    text: 'كل يوم هو فرصة جديدة لتتألقي ',
    emoji: '',
    tip: 'جربي روتين عناية جديد هذا الأسبوع',
  },
  {
    text: 'الجمال ليس ما ترينه في المرآة فقط — بل ما تشعرين به ',
    emoji: '',
    tip: 'دللي نفسكِ بجلسة مساج هذا الشهر',
  },
  {
    text: 'ثقتكِ بنفسكِ هي سر جمالكِ ',
    emoji: '',
    tip: 'قفي أمام المرآة وقولي شيئاً إيجابياً عن نفسكِ',
  },
  {
    text: 'العناية بالبشرة استثمار — ليس مصروفاً ',
    emoji: '',
    tip: 'استثمري في روتين عناية منتظم',
  },
  {
    text: 'أنتِ تستحقين الأفضل دائماً ',
    emoji: '',
    tip: 'لا تترددي في تدليل نفسكِ بين الحين والآخر',
  },
  {
    text: 'جمالكِ فريد — لا تقارنيه بأحد ',
    emoji: '',
    tip: 'اختاري خدمات تناسب نوع بشرتكِ الفريد',
  },
  {
    text: 'الراحة والاسترخاء سر من أسرار الجمال ‍️',
    emoji: '',
    tip: 'احجزي جلسة استرخاء هذا الأسبوع',
  },
  { text: 'غداً أجمل — ابدئي اليوم ', emoji: '', tip: 'ابدئي روتين عناية متكامل من اليوم' },
];

const SERVICE_LINKS: Record<string, { label: string; href: string }> = {
  '‍️': { label: 'احجزي مساج', href: '/services' },
  '': { label: 'تصفحي خدمات البشرة', href: '/services' },
  '': { label: 'احجزي مكياج', href: '/services' },
  '': { label: 'احجزي مانيكير', href: '/services' },
  '': { label: 'تصفحي الخدمات', href: '/services' },
  default: { label: 'تصفحي الخدمات', href: '/services' },
};

export default function BeautyFortunePage(): JSX.Element {
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
              بسكويت الجمال
            </h1>
            <p className="mt-2 text-text-secondary dark:text-gray-400">
              اكسري البسكويت واكتشفي رسالتكِ الجمالية اليوم
            </p>
            <Button onClick={openFortune} size="lg" className="mt-8">
              افتحي بسكويتكِ
            </Button>
          </div>
        )}

        {opening && (
          <div className="animate-pulse">
            <span className="text-8xl"></span>
            <p className="mt-4 text-text-secondary">جاري فتح البسكويت...</p>
          </div>
        )}

        {fortune && !opening && (
          <Card padding="lg" className="bg-white/90 backdrop-blur dark:bg-gray-900/90">
            <span className="text-6xl">{fortune.emoji}</span>
            <p className="mt-6 text-2xl font-bold text-text-primary dark:text-gray-100 leading-relaxed">
              {fortune.text}
            </p>
            <div className="mt-6 rounded-xl bg-brand-50 p-4 dark:bg-brand-950">
              <p className="text-sm font-medium text-brand-700 dark:text-brand-300">نصيحة اليوم</p>
              <p className="mt-1 text-brand-600 dark:text-brand-400">{fortune.tip}</p>
            </div>
            <div className="mt-6 flex gap-3 justify-center">
              <Button onClick={openFortune} variant="outline">
                بسكويت آخر
              </Button>
              <Link href={SERVICE_LINKS[fortune.emoji]?.href || '/services'}>
                <Button> احجزي الآن</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
