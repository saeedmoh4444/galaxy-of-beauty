'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card } from '@galaxy/ui';

interface Question {
  id: string;
  text: string;
  options: { label: string; value: string; icon: string }[];
}

const questions: Question[] = [
  { id: 'occasion', text: 'ما المناسبة؟', options: [
    { label: 'يومي', value: 'daily', icon: '☀️' },
    { label: 'مناسبة خاصة', value: 'special', icon: '✨' },
    { label: 'زفاف', value: 'wedding', icon: '👰' },
    { label: 'استرخاء', value: 'relax', icon: '🧖‍♀️' },
    { label: 'تجربة جديدة', value: 'new', icon: '🎨' },
  ]},
  { id: 'focus', text: 'على ماذا تركزين؟', options: [
    { label: 'الشعر', value: 'hair', icon: '💇‍♀️' },
    { label: 'البشرة', value: 'skin', icon: '✨' },
    { label: 'المكياج', value: 'makeup', icon: '💄' },
    { label: 'الأظافر', value: 'nails', icon: '💅' },
    { label: 'الجسم', value: 'body', icon: '🧴' },
  ]},
  { id: 'budget', text: 'ميزانيتكِ التقريبية؟', options: [
    { label: 'اقتصادية', value: 'low', icon: '💰' },
    { label: 'متوسطة', value: 'mid', icon: '💵' },
    { label: 'فاخرة', value: 'high', icon: '💎' },
  ]},
];

const recommendations: Record<string, { title: string; services: string[]; link: string }> = {
  'wedding-hair-high': { title: 'إطلالة العروس الكاملة', services: ['تسريحة شعر', 'مكياج عرايس', 'مانيكير', 'باديكير', 'عناية بالبشرة'], link: '/bridal-concierge' },
  'wedding-makeup-high': { title: 'مكياج وإطلالة العروس', services: ['مكياج عرايس', 'تسريحة شعر', 'تركيب رموش', 'تبييض أسنان'], link: '/bridal-concierge' },
  'special-hair-mid': { title: 'إطلالة المناسبات', services: ['تسريحة شعر', 'مكياج سهرة', 'مانيكير'], link: '/services' },
  'special-makeup-mid': { title: 'مكياج المناسبات الخاصة', services: ['مكياج سهرة', 'تركيب رموش', 'تحديد حواجب'], link: '/services' },
  'daily-skin-low': { title: 'عناية يومية بالبشرة', services: ['تنظيف بشرة', 'ماسك وجه', 'عناية بالبشرة'], link: '/services' },
  'relax-body-mid': { title: 'جلسة استرخاء وعناية', services: ['مساج', 'حمام مغربي', 'عناية بالجسم'], link: '/services' },
  'default': { title: 'باقة الجمال المتكاملة', services: ['مكياج', 'تسريحة شعر', 'مانيكير', 'عناية بالبشرة'], link: '/services' },
};

export default function BeautyQuizPage(): JSX.Element {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<typeof recommendations[string] | null>(null);

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    if (step < questions.length - 1) setStep(step + 1);
    else {
      const key = `${newAnswers['occasion']}-${newAnswers['focus']}-${newAnswers['budget']}`;
      setResult(recommendations[key] || recommendations['default'] || null);
    }
  };

  const reset = () => { setStep(0); setAnswers({}); setResult(null); };

  if (result) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <span className="text-6xl">✨</span>
        <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">{result.title}</h1>
        <p className="mt-2 text-text-secondary">بناءً على إجاباتكِ، نرشح لكِ:</p>
        <div className="mt-6 space-y-2">
          {result.services.map(s => <Card key={s} padding="sm"><p className="font-medium text-text-primary dark:text-gray-100">{s}</p></Card>)}
        </div>
        <div className="mt-8 flex gap-3 justify-center">
          <Link href={result.link}><Button size="lg">تصفحي الخدمات</Button></Link>
          <Button variant="outline" onClick={reset}>🔄 إعادة الاختبار</Button>
        </div>
      </div>
    );
  }

  const q = questions[step]!;
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-8">
        <div className="mb-2 flex gap-1">{questions.map((_, i) => <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`} />)}</div>
        <p className="text-xs text-text-tertiary">{step + 1} / {questions.length}</p>
      </div>
      <h2 className="mb-6 text-2xl font-bold text-text-primary dark:text-gray-100">{q.text}</h2>
      <div className="space-y-3">
        {q.options.map(o => (
          <button key={o.value} onClick={() => handleAnswer(q.id, o.value)} className="flex w-full items-center gap-4 rounded-xl border border-edge p-4 text-right transition-all hover:border-brand-400 hover:bg-brand-50 dark:border-gray-700 dark:hover:bg-brand-950">
            <span className="text-2xl">{o.icon}</span>
            <span className="text-lg font-medium text-text-primary dark:text-gray-100">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
