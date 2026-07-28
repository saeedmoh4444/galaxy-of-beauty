'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const SKIN_TYPES = [
  { key: 'dry' as const, emoji: '🏜️', label: 'جافة', desc: 'بشرة تحتاج ترطيب مكثف' },
  { key: 'oily' as const, emoji: '💧', label: 'دهنية', desc: 'بشرة تفرز زيوتاً زائدة' },
  { key: 'combination' as const, emoji: '🔄', label: 'مختلطة', desc: 'منطقة T دهنية والخدود جافة' },
  { key: 'normal' as const, emoji: '✨', label: 'عادية', desc: 'بشرة متوازنة' },
];

export default function AIRoutinePage(): JSX.Element {
  const [skinType, setSkinType] = useState<'dry' | 'oily' | 'combination' | 'normal'>('combination');
  const [generated, setGenerated] = useState(false);

  const { data, isLoading, refetch } = api.aiRoutine.generate.useQuery(
    { skinType },
    { enabled: generated },
  ) as { data: Record<string, unknown> | undefined; isLoading: boolean; refetch: () => void };

  const routine = data;
  const morning = (routine?.morning as Record<string, unknown>)?.steps as Array<Record<string, unknown>> ?? [];
  const evening = (routine?.evening as Record<string, unknown>)?.steps as Array<Record<string, unknown>> ?? [];
  const tips = (routine?.tips as string[]) ?? [];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">🧠 روتين العناية الذكي</h1><p className="mt-1 text-sm text-gray-500">روتين يومي مخصص لبشرتكِ بالذكاء الاصطناعي</p></div>

        {!generated ? (
          <Card padding="lg">
            <h3 className="font-bold text-lg mb-4">✨ اختاري نوع بشرتكِ</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {SKIN_TYPES.map((t) => (
                <button key={t.key} onClick={() => setSkinType(t.key)} className={`rounded-xl border-2 p-4 text-right transition-all ${skinType === t.key ? 'border-brand-400 bg-brand-50 dark:bg-brand-950' : 'border-gray-200 dark:border-gray-700'}`}>
                  <span className="text-3xl">{t.emoji}</span>
                  <p className="font-bold mt-1">{t.label}</p>
                  <p className="text-xs text-gray-500">{t.desc}</p>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <Button onClick={() => setGenerated(true)} className="w-full" size="lg">🧠 توليد الروتين</Button>
            </div>
          </Card>
        ) : isLoading ? <CardSkeleton /> : !routine ? <CardSkeleton /> : (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card padding="lg"><h3 className="font-bold text-lg mb-3">☀️ الصباح ({routine?.morning ? (routine.morning as Record<string,unknown>).totalTime as string : ''})</h3>
                <div className="space-y-3">{morning.map((s: Record<string,unknown>, i: number) => (
                  <div key={i} className="flex items-center gap-3"><span className="text-2xl">{s.emoji as string}</span><div><p className="font-semibold text-sm">{s.stepAr as string}</p><p className="text-xs text-gray-500">{s.duration as string}</p></div></div>
                ))}</div>
              </Card>
              <Card padding="lg"><h3 className="font-bold text-lg mb-3">🌙 المساء ({routine?.evening ? (routine.evening as Record<string,unknown>).totalTime as string : ''})</h3>
                <div className="space-y-3">{evening.map((s: Record<string,unknown>, i: number) => (
                  <div key={i} className="flex items-center gap-3"><span className="text-2xl">{s.emoji as string}</span><div><p className="font-semibold text-sm">{s.stepAr as string}</p><p className="text-xs text-gray-500">{s.duration as string}</p></div></div>
                ))}</div>
              </Card>
            </div>
            {tips.length > 0 && (
              <Card padding="lg" className="bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950 dark:to-purple-950 border-none">
                <h3 className="font-bold mb-3">💡 نصائح</h3>
                <div className="space-y-2">{tips.map((t, i) => <p key={i} className="text-sm">✨ {t}</p>)}</div>
              </Card>
            )}
            <div className="text-center"><Button variant="ghost" onClick={() => setGenerated(false)}>🔄 تغيير نوع البشرة</Button></div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
