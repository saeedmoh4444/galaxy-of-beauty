'use client';

import { useState } from 'react';
import { PageContainer, PageTitle } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const TREATMENTS: Record<
  string,
  { emoji: string; label: string; aftercare: string[]; timeline: { day: string; action: string }[] }
> = {
  facial: {
    emoji: '',
    label: 'عناية بالبشرة',
    aftercare: ['لا تلمسي وجهكِ', 'تجنبي المكياج ٢٤ ساعة', 'استخدمي واقي شمس', 'اشربي ماء بكثرة'],
    timeline: [
      { day: 'اليوم 1', action: 'لا تغسلي وجهكِ — اتركي المنتجات' },
      { day: 'اليوم 2-3', action: 'غسول لطيف + مرطب' },
      { day: 'اليوم 4-7', action: 'عودي لروتينك الطبيعي' },
    ],
  },
  waxing: {
    emoji: '️',
    label: 'إزالة شعر',
    aftercare: ['تجنبي الشمس ٤٨ ساعة', 'لا تستخدمي مقشر', 'ارتدي ملابس قطنية', 'رطبي المنطقة'],
    timeline: [
      { day: 'اليوم 1', action: 'لا تلمسي المنطقة — تجنبي الحرارة' },
      { day: 'اليوم 2-3', action: 'ترطيب خفيف + ملابس فضفاضة' },
      { day: 'اليوم 4+', action: 'تقشير لطيف لمنع الشعر تحت الجلد' },
    ],
  },
  hair_color: {
    emoji: '‍️',
    label: 'صبغ شعر',
    aftercare: [
      'لا تغسلي شعركِ ٤٨ ساعة',
      'استخدمي شامبو خالي من الكبريتات',
      'تجنبي الحرارة',
      'استخدمي بلسم مرطب',
    ],
    timeline: [
      { day: 'اليوم 1-2', action: 'لا تغسلي — ثبتي اللون' },
      { day: 'اليوم 3-5', action: 'غسيل بماء بارد + بلسم' },
      { day: 'اليوم 6+', action: 'روتين طبيعي مع حماية من الحرارة' },
    ],
  },
  nails: {
    emoji: '',
    label: 'أظافر',
    aftercare: [
      'تجنبي الماء الساخن',
      'استخدمي كريم يدين',
      'لا تستخدمي أظافركِ كأدوات',
      'زيوت للأظافر',
    ],
    timeline: [
      { day: 'اليوم 1', action: 'حافظي على جفاف الأظافر' },
      { day: 'اليوم 2-7', action: 'رطبي يومياً + زيت للأظافر' },
      { day: 'الأسبوع 2+', action: 'لمسات تصحيحية عند الحاجة' },
    ],
  },
};

export default function PostTreatmentPage(): JSX.Element {
  const [selected, setSelected] = useState('facial');
  const [completed, setCompleted] = useState<string[]>([]);
  const t = TREATMENTS[selected]!;
  const progress = Math.round((completed.length / t.timeline.length) * 100);
  const toggleDay = (day: string) => {
    if (completed.includes(day)) setCompleted(completed.filter((x) => x !== day));
    else setCompleted([...completed, day]);
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <PageContainer width="default">
        <PageTitle title="‍️ متابعة ما بعد العلاج" subtitle="تعليمات العناية بعد كل خدمة" />

        <div className="mb-6 flex gap-2">
          {Object.entries(TREATMENTS).map(([key, val]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSelected(key);
                setCompleted([]);
              }}
              className={`flex-1 rounded-2xl border-2 p-3 text-center transition-all ${selected === key ? 'border-rose-400 bg-rose-50 dark:border-rose-600 dark:bg-rose-950' : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'}`}
            >
              <span className="text-2xl">{val.emoji}</span>
              <p className="mt-1 text-xs font-semibold text-text-primary dark:text-gray-100">
                {val.label}
              </p>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-lg font-bold text-text-primary dark:text-gray-100">
            {t.emoji} {t.label}
          </h3>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-text-primary dark:text-gray-100">التقدم</span>
              <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                {progress}%
              </span>
            </div>
            <div className="mt-2 h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-rose-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <h4 className="mt-6 text-sm font-bold text-text-primary dark:text-gray-100">
             تعليمات مهمة
          </h4>
          <div className="mt-2 space-y-1">
            {t.aftercare.map((a, i) => (
              <p
                key={i}
                className="flex items-center gap-2 text-sm text-text-secondary dark:text-gray-400"
              >
                <span>•</span> {a}
              </p>
            ))}
          </div>

          <h4 className="mt-6 text-sm font-bold text-text-primary dark:text-gray-100">
             الجدول الزمني
          </h4>
          <div className="mt-2 space-y-2">
            {t.timeline.map((tl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(tl.day)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-right transition-all ${completed.includes(tl.day) ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-gray-50 dark:bg-gray-800'}`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-sm ${completed.includes(tl.day) ? 'bg-emerald-500 text-white' : 'border-2 border-gray-300 dark:border-gray-600'}`}
                >
                  {completed.includes(tl.day) ? '' : ''}
                </span>
                <div>
                  <p
                    className={`text-sm font-bold ${completed.includes(tl.day) ? 'text-emerald-700 dark:text-emerald-300' : 'text-text-primary dark:text-gray-200'}`}
                  >
                    {tl.day}
                  </p>
                  <p className="text-xs text-text-tertiary dark:text-gray-500">{tl.action}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
