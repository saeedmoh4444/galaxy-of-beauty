'use client';

import { useState } from 'react';
import { PageContainer, PageTitle } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const DESTINATIONS = [
  {
    key: 'beach',
    emoji: '️',
    name: 'شاطئ',
    color: '#0891b2',
    bg: 'from-cyan-50 to-teal-50 dark:from-cyan-950 dark:to-teal-950',
    essentials: [
      'واقي شمس SPF50',
      'شامبو بعد البحر',
      'بلسم مرطب',
      'ماسك شعر',
      'مبرد أظافر',
      'كريم ترطيب',
      'بخاخ ملح بحري',
      'مزيل مكياج مقاوم للماء',
    ],
    tips: 'الشعر يحتاج عناية إضافية بعد السباحة — احضري علاج شعر مكثف',
  },
  {
    key: 'city',
    emoji: '️',
    name: 'مدينة',
    color: '#6366f1',
    bg: 'from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950',
    essentials: [
      'كريم أساس',
      'أحمر شفاه',
      'ماسكارا',
      'مناديل مبللة',
      'عطر صغير',
      'مرطب وجه',
      'جل حواجب',
      'بخاخ مثبت مكياج',
    ],
    tips: 'عبوات صغيرة الحجم — وفري مساحة في حقيبتكِ',
  },
  {
    key: 'mountain',
    emoji: '️',
    name: 'جبال',
    color: '#059669',
    bg: 'from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950',
    essentials: [
      'مرطب شفاه',
      'كريم يدين',
      'واقي شمس',
      'لوشن جسم',
      'زيت شعر',
      'مصل وجه',
      'بخاخ ماء',
      'قناع ترطيب',
    ],
    tips: 'الجو الجاف يحتاج ترطيب مكثف — ركزي على المنتجات المرطبة',
  },
];

export default function TravelChecklistPage(): JSX.Element {
  const [dest, setDest] = useState('beach');
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const d = DESTINATIONS.find((x) => x.key === dest)!;

  const toggle = (item: string) => {
    const next = new Set(checked);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    setChecked(next);
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <PageContainer width="default">
        <PageTitle title=" حقيبة الجمال" subtitle="لا تنسي شيئاً في سفركِ" />

        <div className="mb-6 flex gap-2">
          {DESTINATIONS.map((dt) => (
            <button
              key={dt.key}
              type="button"
              onClick={() => setDest(dt.key)}
              className={`flex-1 rounded-2xl border-2 p-3 text-center transition-all ${dest === dt.key ? 'bg-white dark:bg-gray-900' : 'bg-white dark:bg-gray-900'}`}
              style={dest === dt.key ? { borderColor: dt.color } : { borderColor: '#e5e7eb' }}
            >
              <span className="text-2xl">{dt.emoji}</span>
              <p className="mt-1 text-xs font-semibold text-text-primary dark:text-gray-100">
                {dt.name}
              </p>
            </button>
          ))}
        </div>

        <div className={`rounded-2xl bg-gradient-to-br ${d.bg} p-6`}>
          <h3 className="text-lg font-bold text-text-primary dark:text-gray-100">
            {d.emoji} {d.name}
          </h3>
          <p className="mt-2 rounded-xl bg-white/60 p-3 text-sm text-text-secondary dark:bg-gray-800/60 dark:text-gray-300">
             {d.tips}
          </p>

          <h4 className="mt-6 text-sm font-bold text-text-primary dark:text-gray-100">
             الأساسيات (8 عناصر)
          </h4>
          <div className="mt-3 space-y-2">
            {d.essentials.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggle(item)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-right transition-all ${checked.has(item) ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-white/60 dark:bg-gray-800/60'}`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-sm ${checked.has(item) ? 'bg-emerald-500 text-white' : 'border-2 border-gray-300 dark:border-gray-600'}`}
                >
                  {checked.has(item) ? '' : ''}
                </span>
                <span
                  className={`text-sm ${checked.has(item) ? 'text-emerald-700 line-through dark:text-emerald-300' : 'text-text-primary dark:text-gray-200'}`}
                >
                  {item}
                </span>
              </button>
            ))}
          </div>

          <p className="mt-4 text-center text-sm font-bold text-text-primary dark:text-gray-100">
             {checked.size} / {d.essentials.length} تم تجهيزها
          </p>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
