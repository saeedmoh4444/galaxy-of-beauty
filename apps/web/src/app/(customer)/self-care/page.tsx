'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/ui';

const MOODS = ['', '', '', '', ''];
const MOOD_LABELS = ['سيء', 'متوسط', 'جيد', 'رائع', 'ممتاز'];

export default function SelfCarePage(): JSX.Element {
  const { addToast } = useToast();
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [sleep, setSleep] = useState('');
  const [water, setWater] = useState('');
  const [notes, setNotes] = useState('');
  const checkinMut = api.selfCare.checkin.useMutation({
    onSuccess: () => {
      addToast('success', 'تم تسجيل تقييمكِ اليومي ');
      setNotes('');
    },
  });
  const { data: history } = api.selfCare.history.useQuery({ days: 7 });
  const { data: today } = api.selfCare.todayMood.useQuery();

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">العناية الذاتية</h1>

        {today ? (
          <Card padding="lg" className="text-center">
            <p className="text-sm text-text-secondary">تقييمكِ اليوم</p>
            <p className="mt-2 text-5xl">{MOODS[today.mood - 1]}</p>
            <p className="mt-1 text-sm text-text-tertiary">{MOOD_LABELS[today.mood - 1]}</p>
          </Card>
        ) : (
          <Card padding="lg">
            <h3 className="mb-4 text-center font-semibold">كيف تشعرين اليوم؟</h3>
            <div className="flex justify-center gap-3">
              {MOODS.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setMood(i + 1)}
                  className={`text-3xl transition-all ${mood === i + 1 ? 'scale-125' : 'opacity-40 hover:opacity-70'}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-sm text-brand-600">{MOOD_LABELS[mood - 1]}</p>
            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="sc-energy" className="mb-1 block text-xs text-text-secondary">
                  الطاقة (1-5)
                </label>
                <input
                  id="sc-energy"
                  type="range"
                  min="1"
                  max="5"
                  value={energy}
                  onChange={(e) => setEnergy(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-xs text-text-tertiary">{energy} / 5</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="ساعات النوم"
                  value={sleep}
                  onChange={(e) => setSleep(e.target.value)}
                  className="rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                />
                <input
                  type="number"
                  placeholder="أكواب الماء"
                  value={water}
                  onChange={(e) => setWater(e.target.value)}
                  className="rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                />
              </div>
              <input
                placeholder="ملاحظات (اختياري)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-800"
              />
            </div>
            <Button
              onClick={() =>
                checkinMut.mutate({
                  mood,
                  energy: energy || undefined,
                  sleepHours: sleep ? Number(sleep) : undefined,
                  waterGlasses: water ? Number(water) : undefined,
                  notes: notes || undefined,
                })
              }
              loading={checkinMut.isPending}
              className="mt-4 w-full"
            >
              حفظ التقييم
            </Button>
          </Card>
        )}

        {history && history.length > 0 && (
          <Card padding="md">
            <h3 className="mb-3 font-semibold">آخر ٧ أيام</h3>
            <div className="flex justify-around">
              {history.map((h, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl">{MOODS[(h.mood || 1) - 1]}</div>
                  <div className="text-xs text-text-tertiary">
                    {new Date(h.createdAt).toLocaleDateString('ar-SA', { weekday: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
