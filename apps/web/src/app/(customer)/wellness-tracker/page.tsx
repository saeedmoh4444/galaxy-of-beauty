'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const MOODS = [
  { value: 1, emoji: '😞', label: 'سيء' },
  { value: 2, emoji: '😕', label: 'متوسط' },
  { value: 3, emoji: '😐', label: 'عادي' },
  { value: 4, emoji: '🙂', label: 'جيد' },
  { value: 5, emoji: '😄', label: 'ممتاز' },
];

export default function WellnessTrackerPage(): JSX.Element {
  const { data: _today, isLoading: _loading, refetch } = api.wellnessTracker.today.useQuery() as { data: Record<string, unknown> | null; isLoading: boolean; refetch: () => void };
  const { data: weekly } = api.wellnessTracker.weekly.useQuery() as { data: { week: Array<Record<string, unknown>>; avgWater: number; avgSleep: number; avgMood: number; totalSteps: number; skincareDays: number; streak: number } | undefined; };
  const checkinMut = api.wellnessTracker.checkin.useMutation({ onSuccess: () => refetch() });

  const [water, setWater] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [mood, setMood] = useState(3);
  const [steps, setSteps] = useState(0);
  const [skincare, setSkincare] = useState(false);

  const w = weekly;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">🧘 متعقب العافية</h1>
          <p className="mt-1 text-sm text-text-secondary">تابعي صحتكِ وعافيتكِ اليومية — ماء، نوم، مزاج، وخطوات</p>
        </div>

        {/* Check-in Card */}
        <Card padding="lg">
          <h3 className="font-bold text-lg mb-4">📝 تسجيل اليوم</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">💧 الماء (أكواب)</label>
              <input type="number" min={0} max={20} value={water} onChange={(e) => setWater(parseInt(e.target.value) || 0)} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 mt-1" />
            </div>
            <div>
              <label className="text-sm font-semibold">😴 النوم (ساعات)</label>
              <input type="number" min={0} max={24} value={sleep} onChange={(e) => setSleep(parseFloat(e.target.value) || 0)} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 mt-1" />
            </div>
            <div>
              <label className="text-sm font-semibold">🚶‍♀️ الخطوات</label>
              <input type="number" min={0} value={steps} onChange={(e) => setSteps(parseInt(e.target.value) || 0)} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 mt-1" />
            </div>
            <div>
              <label className="text-sm font-semibold">🧴 روتين العناية</label>
              <button onClick={() => setSkincare(!skincare)} className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${skincare ? 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-surface-muted border-gray-200 text-text-secondary dark:bg-gray-800 dark:border-gray-700'}`}>{skincare ? '✓ تم' : 'لم يتم'}</button>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold">😊 المزاج</label>
              <div className="mt-1 flex gap-2">{MOODS.map((m) => <button key={m.value} onClick={() => setMood(m.value)} className={`flex-1 rounded-lg border py-2 text-center text-sm transition-all ${mood === m.value ? 'border-brand-400 bg-brand-50 dark:bg-brand-950 scale-105' : 'border-gray-200 dark:border-gray-700'}`}><span className="text-2xl block">{m.emoji}</span><span className="text-[10px]">{m.label}</span></button>)}</div>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={() => checkinMut.mutate({ water, sleep, mood, steps, skincare })} loading={checkinMut.isPending} className="w-full">💾 حفظ</Button>
          </div>
        </Card>

        {/* Weekly Stats */}
        {w && (
          <div className="grid gap-4 sm:grid-cols-5">
            <Card padding="md" className="text-center"><p className="text-3xl">💧</p><p className="text-2xl font-bold text-blue-600">{w.avgWater}</p><p className="text-xs text-text-secondary">متوسط أكواب</p></Card>
            <Card padding="md" className="text-center"><p className="text-3xl">😴</p><p className="text-2xl font-bold text-purple-600">{w.avgSleep}</p><p className="text-xs text-text-secondary">ساعات نوم</p></Card>
            <Card padding="md" className="text-center"><p className="text-3xl">😊</p><p className="text-2xl font-bold text-amber-600">{w.avgMood}</p><p className="text-xs text-text-secondary">متوسط المزاج</p></Card>
            <Card padding="md" className="text-center"><p className="text-3xl">🚶‍♀️</p><p className="text-2xl font-bold text-green-600">{(w.totalSteps / 1000).toFixed(1)}k</p><p className="text-xs text-text-secondary">إجمالي الخطوات</p></Card>
            <Card padding="md" className="text-center"><p className="text-3xl">🧴</p><p className="text-2xl font-bold text-pink-600">{w.skincareDays}/7</p><p className="text-xs text-text-secondary">أيام العناية</p></Card>
          </div>
        )}

        {/* Weekly Chart */}
        {w && (
          <Card padding="lg">
            <h3 className="font-bold mb-4">📈 الأسبوع</h3>
            <div className="flex items-end gap-1 h-24">
              {w.week.map((d: Record<string, unknown>) => {
                const h = Math.max(4, ((d.mood as number) || 0) * 20);
                const days = ['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];
                const dayIdx = new Date(d.date as string).getDay();
                return (
                  <div key={d.date as string} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t bg-gradient-to-t from-brand-400 to-purple-400" style={{ height: `${h}%` }} />
                    <span className="text-[10px] text-text-tertiary">{days[dayIdx]}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
