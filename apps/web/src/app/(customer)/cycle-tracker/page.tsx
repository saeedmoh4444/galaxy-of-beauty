'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const SYMPTOMS_LIST = ['تقلصات','صداع','تعب','انتفاخ','غثيان','أرق','شهية مفتوحة','آلام ظهر','حساسية الصدر','تقلبات مزاجية'];
const MOODS = ['😍','😊','😐','😔','😢'];

export default function CycleTrackerPage(): JSX.Element {
  const { data: today, isLoading: todayLoading } = api.cycleTracker.today.useQuery() as { data: Record<string,unknown> | undefined; isLoading: boolean };
  const { data: entriesData, isLoading: entriesLoading } = api.cycleTracker.myEntries.useQuery() as { data: Record<string,unknown> | undefined; isLoading: boolean };
  const { data: settings } = api.cycleTracker.settings.useQuery() as { data: Record<string,unknown> | undefined };
  const logMut = api.cycleTracker.logDay.useMutation();
  const settingsMut = api.cycleTracker.updateSettings.useMutation();

  const [showLog, setShowLog] = useState(false);
  const [mood, setMood] = useState('😊');
  const [flow, setFlow] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [cycleLen, setCycleLen] = useState(28);
  const [periodLen, setPeriodLen] = useState(5);
  const [lastStart, setLastStart] = useState('');

  const phase = today?.phase as Record<string,unknown> | undefined;
  const entries = (entriesData?.entries as Array<Record<string,unknown>>) ?? [];
  const cycleLength = (entriesData?.cycleLength as number) ?? 28;

  const handleLog = () => {
    logMut.mutate({
      dayNumber: today?.currentDay as number ?? 1,
      mood, flowIntensity: (flow || undefined) as 'light' | undefined,
      symptoms: symptoms.length > 0 ? symptoms : undefined,
      notes: notes || undefined,
    }, { onSuccess: () => { setShowLog(false); setNotes(''); } });
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">📅 متعقب الدورة</h1><p className="mt-1 text-sm text-gray-500">توصيات جمالية حسب يوم دورتكِ</p></div>
          <Button size="sm" variant="outline" onClick={() => { setShowSettings(!showSettings); if (settings) { setCycleLen(settings.cycleLength as number ?? 28); setPeriodLen(settings.periodLength as number ?? 5); setLastStart(settings.lastPeriodStart ? new Date(settings.lastPeriodStart as string).toISOString().slice(0,10) : ''); } }}>⚙️</Button>
        </div>

        {showSettings && <Card padding="lg"><h3 className="font-bold mb-3">⚙️ إعدادات الدورة</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><label className="text-xs text-gray-500">مدة الدورة</label><input type="number" value={cycleLen} onChange={e => setCycleLen(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" /></div>
            <div><label className="text-xs text-gray-500">مدة الدورة الشهرية</label><input type="number" value={periodLen} onChange={e => setPeriodLen(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" /></div>
            <div><label className="text-xs text-gray-500">آخر دورة</label><input type="date" value={lastStart} onChange={e => setLastStart(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" /></div>
          </div>
          <Button onClick={() => settingsMut.mutate({ cycleLength: cycleLen, periodLength: periodLen, lastPeriodStart: lastStart || undefined }, { onSuccess: () => setShowSettings(false) })} loading={settingsMut.isPending} className="w-full mt-3">💾 حفظ</Button>
        </Card>}

        {todayLoading ? <CardSkeleton/> : (
          <Card padding="lg" className={`text-center border-2`}>
            <span className="text-5xl">{phase?.emoji as string ?? '📅'}</span>
            <h2 className="text-xl font-bold mt-2">{phase?.name as string}</h2>
            <p className="text-sm text-gray-500">اليوم {today?.currentDay as number} من {cycleLength}</p>
            {(today?.hasSettings as boolean) && (today?.daysUntilNext as number) != null && <p className="text-xs text-brand-600 mt-1">⏱️ متبقي {today?.daysUntilNext as number} يوم على الدورة القادمة</p>}
            {!today?.hasSettings && <p className="text-xs text-amber-600 mt-2">⚠️ اضبطي إعدادات الدورة للحصول على توقعات دقيقة</p>}
          </Card>
        )}

        <div className="flex gap-2">
          <Button onClick={() => setShowLog(!showLog)} className="flex-1">{showLog ? '✕' : '📝 سجلي اليوم'}</Button>
        </div>

        {showLog && <Card padding="lg">
          <div className="space-y-3">
            <div><label className="text-xs text-gray-500 mb-1 block">المزاج</label><div className="flex gap-2">{MOODS.map(m => <button key={m} onClick={() => setMood(m)} className={`text-2xl p-2 rounded-lg ${mood===m?'bg-brand-100 ring-2 ring-brand-400':''}`}>{m}</button>)}</div></div>
            <div><label className="text-xs text-gray-500 mb-1 block">شدة التدفق</label><div className="flex gap-2">{['light','medium','heavy','spotting'].map(f => <button key={f} onClick={() => setFlow(f === flow ? '' : f)} className={`rounded-full px-4 py-1.5 text-xs ${flow===f?'bg-red-100 text-red-700 ring-1 ring-red-400':'bg-gray-100'}`}>{f==='light'?'خفيف':f==='medium'?'متوسط':f==='heavy'?'غزير':'نقط'}</button>)}</div></div>
            <div><label className="text-xs text-gray-500 mb-1 block">الأعراض</label><div className="flex flex-wrap gap-1">{SYMPTOMS_LIST.map(s => <button key={s} onClick={() => setSymptoms(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev,s])} className={`rounded-full px-3 py-1 text-xs ${symptoms.includes(s)?'bg-purple-100 text-purple-700':'bg-gray-100'}`}>{s}</button>)}</div></div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="ملاحظات..." rows={2} className="w-full rounded-lg border px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-800" />
            <Button onClick={handleLog} loading={logMut.isPending} className="w-full">💾 حفظ اليوم</Button>
          </div>
        </Card>}

        <Card padding="lg"><h3 className="font-bold mb-3">💡 توصيات الجمال — {phase?.name as string}</h3>
          <div className="space-y-2">{(phase?.tips as string[] ?? []).map((tip: string, i: number) => <p key={i} className="text-sm text-gray-600">• {tip}</p>)}</div>
        </Card>

        {entriesLoading ? <div className="space-y-1">{Array.from({length:28},(_,i)=><div key={i} className="h-8 bg-gray-100 rounded animate-pulse"/>)}</div> :
          <Card padding="lg"><h3 className="font-bold mb-3">🗓️ أيام الدورة</h3>
            <div className="flex flex-wrap gap-1">{Array.from({length:cycleLength},(_,i) => i+1).map(d => {
              const p = (() => { const adj = ((d-1) % cycleLength) + 1; if (adj<=5) return PHASES_LIST[0]; if (adj<=13) return PHASES_LIST[1]; if (adj<=16) return PHASES_LIST[2]; return PHASES_LIST[3]; })();
              const entry = entries.find((e: Record<string,unknown>) => e.dayNumber === d);
              return (
                <div key={d} className={`w-8 h-8 rounded-full text-xs flex items-center justify-center relative ${entry ? 'ring-2 ring-offset-1' : 'bg-gray-100'}`} style={{backgroundColor: entry ? p!.color+'30' : '', borderColor: p!.color}} title={`اليوم ${d}: ${p!.name}`}>
                  <span className="text-[10px]">{d}</span>
                </div>
              );
            })}</div>
          </Card>
        }
      </div>
    </DashboardLayout>
  );
}

const PHASES_LIST = [
  { key: 'menstrual', name: 'الدورة', color: '#ec4899' },
  { key: 'follicular', name: 'الجريبي', color: '#f59e0b' },
  { key: 'ovulation', name: 'الإباضة', color: '#8b5cf6' },
  { key: 'luteal', name: 'الأصفري', color: '#059669' },
];
