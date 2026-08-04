'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, formatCurrency } from '@galaxy/ui';
const OCCASIONS = [
  { id: 'birthday', emoji: '🎂', name: 'عيد ميلاد', desc: 'أفضل هدايا التجميل لعيد الميلاد', gifts: [
    { title: 'باقة عناية بالبشرة', price: '٢٥٠ ر.س', desc: 'جلسة تنظيف وترطيب مع ماسك', emoji: '✨', link: '/services' },
    { title: 'بطاقة هدية', price: 'من ١٠٠ ر.س', desc: 'لأي خدمة تجميل تختارها', emoji: '🎁', link: '/gift-cards' },
    { title: 'مانيكير وباديكير', price: '١٥٠ ر.س', desc: 'طلاء أظافر مع مساج', emoji: '💅', link: '/services' },
  ]},
  { id: 'wedding', emoji: '👰', name: 'زفاف', desc: 'هدايا للعروس وصديقاتها', gifts: [
    { title: 'باقة العروس', price: '٥٠٠ ر.س', desc: 'مكياج + شعر + أظافر', emoji: '👰', link: '/bridal-concierge' },
    { title: 'جلسة تصوير', price: '٣٠٠ ر.س', desc: 'مكياج احترافي للتصوير', emoji: '📸', link: '/services' },
    { title: 'بطاقة هدية للعروس', price: 'من ٢٠٠ ر.س', desc: 'لتختار ما يناسبها', emoji: '🎁', link: '/gift-cards' },
  ]},
  { id: 'mom', emoji: '👩‍👧', name: 'عيد الأم', desc: 'دللي أمكِ بأجمل الهدايا', gifts: [
    { title: 'يوم عناية كامل', price: '٤٠٠ ر.س', desc: 'مساج + عناية + مكياج', emoji: '🧖‍♀️', link: '/mommy-and-me' },
    { title: 'باقة أم وابنتها', price: '٣٠٠ ر.س', desc: 'جلسة عناية مشتركة', emoji: '👩‍👧', link: '/mommy-and-me' },
    { title: 'سجل هدايا', price: 'حسب اختيارك', desc: 'لتدلعي أمك باختيارها', emoji: '🎁', link: '/gift-registry' },
  ]},
  { id: 'eid', emoji: '🌙', name: 'العيد', desc: 'هدايا العيد لأحبابك', gifts: [
    { title: 'بطاقة هدية العيد', price: 'من ١٠٠ ر.س', desc: 'هدية مثالية للعيد', emoji: '🎁', link: '/gift-cards' },
    { title: 'حناء العيد', price: '١٠٠ ر.س', desc: 'نقوش حناء عصرية', emoji: '🌿', link: '/services' },
    { title: 'مكياج العيد', price: '٢٠٠ ر.س', desc: 'إطلالة متألقة للعيد', emoji: '💄', link: '/services' },
  ]},
];

export default function GiftGuidePage(): JSX.Element {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-12">
        <span className="text-6xl">🎁</span>
        <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">دليل الهدايا</h1>
        <p className="mt-2 text-text-secondary">اختاري الهدية المثالية لكل مناسبة</p>
      </div>

      {OCCASIONS.map(occ => (
        <div key={occ.id} className="mb-12">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-3xl">{occ.emoji}</span>
            <div><h2 className="text-xl font-bold text-text-primary dark:text-gray-100">{occ.name}</h2><p className="text-sm text-text-secondary">{occ.desc}</p></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {occ.gifts.map((g, i) => (
              <Link key={i} href={g.link}>
                <Card hover padding="lg" className="h-full text-center">
                  <span className="text-4xl">{g.emoji}</span>
                  <h3 className="mt-3 font-bold text-text-primary dark:text-gray-100">{g.title}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{g.desc}</p>
                  <p className="mt-3 text-lg font-extrabold text-brand-600">{g.price}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center mt-12 p-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl dark:from-pink-950 dark:to-purple-950">
        <h2 className="text-xl font-bold text-text-primary dark:text-gray-100">💝 لم تجدي ما تبحثين عنه؟</h2>
        <p className="mt-2 text-text-secondary">أنشئي بطاقة هدية بالمبلغ اللي تختارينه</p>
        <Link href="/gift-cards" className="mt-4 inline-block"><Button size="lg">🎁 إنشاء بطاقة هدية</Button></Link>
      </div>

      <GiftQuizWidget />
    </div>
  );
}

function GiftQuizWidget(): JSX.Element {
  const { data: questions, isLoading: qLoading } = api.giftQuiz.questions.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [step, setStep] = useState(0);
  const { data: results } = api.giftQuiz.recommend.useQuery(
    { answers },
    { enabled: Object.keys(answers).length === ((questions as Array<unknown>)?.length ?? 0) && ((questions as Array<unknown>)?.length ?? 0) > 0 },
  ) as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };

  const qs = (questions ?? []) as Array<Record<string,unknown>>;
  const currentQ = qs[step];
  const done = Object.keys(answers).length === qs.length && qs.length > 0;

  const reset = () => { setStep(0); setAnswers({}); };

  if (qs.length === 0 && !qLoading) return <></>;

  return (
    <div className="mt-16 text-center">
      <h2 className="text-2xl font-bold">🤖 مستشار الهدايا الذكي</h2>
      <p className="mt-2 text-text-secondary">جاوبي على الأسئلة وبنقترح عليكِ أفضل الهدايا</p>

      {qLoading ? <CardSkeleton /> : done && results ? (
        <div className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">{results.slice(0,4).map((r: Record<string,unknown>) => (
            <Card key={r.id as number} padding="lg" className="text-center">
              <span className="text-4xl">{r.emoji as string}</span>
              <h3 className="font-bold mt-2">{r.nameAr as string}</h3>
              <p className="text-xs text-text-secondary mt-1">{r.descAr as string}</p>
              <p className="text-xl font-extrabold text-brand-600 mt-2">{formatCurrency(Number(r.price))}</p>
              <div className="mt-2 h-2 bg-surface-muted rounded-full"><div className="h-2 bg-brand-600 rounded-full" style={{width:`${r.score as number}%`}}/></div>
            </Card>
          ))}</div>
          <Button onClick={reset} variant="outline" className="mt-4">🔄 إعادة الاختبار</Button>
        </div>
      ) : currentQ ? (
        <Card padding="lg" className="mt-6 max-w-lg mx-auto">
          <div className="flex gap-1 mb-4">{qs.map((_: unknown, i: number) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i<=step?'bg-brand-600':'bg-gray-200'}`}/>)}</div>
          <h3 className="text-lg font-bold mb-3">{currentQ.questionAr as string}</h3>
          <div className="space-y-2">{(currentQ.options as Array<Record<string,unknown>>).map((o: Record<string,unknown>) => (
            <button key={o.key as string} onClick={() => { setAnswers(prev => ({ ...prev, [currentQ.id as string]: o.key as string })); if (step < qs.length - 1) setStep(step + 1); }} className="w-full rounded-xl border-2 border-edge p-3 text-right hover:border-brand-400 hover:bg-brand-50 transition-all">{o.labelAr as string}</button>
          ))}</div>
        </Card>
      ) : null}
    </div>
  );
}
