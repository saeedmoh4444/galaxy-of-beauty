'use client';

import { useState } from 'react';
import { PageContainer, PageTitle } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const SEASONS = [
  {
    key: 'winter',
    emoji: '️',
    name: 'الشتاء',
    months: 'ديسمبر - فبراير',
    color: '#3b82f6',
    bg: 'from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950',
    tips: 'البشرة تميل للجفاف — ركزي على الترطيب العميق',
    services: [
      { emoji: '', name: 'ترطيب عميق', why: 'لمكافحة جفاف الشتاء' },
      { emoji: '', name: 'مساج بالزيوت', why: 'تنشيط الدورة الدموية' },
      { emoji: '', name: 'علاج الشعر', why: 'حماية من التقصف' },
      { emoji: '', name: 'أظافر شتوية', why: 'ألوان داكنة للموسم' },
    ],
  },
  {
    key: 'spring',
    emoji: '',
    name: 'الربيع',
    months: 'مارس - مايو',
    color: '#ec4899',
    bg: 'from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950',
    tips: 'وقت التجديد — بشرة متجددة بعد الشتاء',
    services: [
      { emoji: '', name: 'تقشير البشرة', why: 'إزالة خلايا الشتاء الميتة' },
      { emoji: '', name: 'قص الشعر', why: 'تجديد بعد جفاف الشتاء' },
      { emoji: '', name: 'مكياج ربيعي', why: 'ألوان باستيل منعشة' },
      { emoji: '', name: 'علاجات طبيعية', why: 'موسم التجدد الطبيعي' },
    ],
  },
  {
    key: 'summer',
    emoji: '️',
    name: 'الصيف',
    months: 'يونيو - أغسطس',
    color: '#f59e0b',
    bg: 'from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950',
    tips: 'حماية من الشمس أساسية — البشرة الدهنية تحتاج عناية',
    services: [
      { emoji: '', name: 'واقي شمس طبي', why: 'حماية من الأشعة الضارة' },
      { emoji: '', name: 'باديكير صيفي', why: 'أقدام جاهزة للصيف' },
      { emoji: '️', name: 'إزالة شعر', why: 'بشرة ناعمة للبحر' },
      { emoji: '', name: 'تسريحات صيفية', why: 'شعر مريح للحر' },
    ],
  },
  {
    key: 'autumn',
    emoji: '',
    name: 'الخريف',
    months: 'سبتمبر - نوفمبر',
    color: '#d97706',
    bg: 'from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950',
    tips: 'إصلاح أضرار الصيف — تحضير للشتاء',
    services: [
      { emoji: '', name: 'علاج التصبغات', why: 'إصلاح أضرار شمس الصيف' },
      { emoji: '', name: 'مساج استرخاء', why: 'عودة للروتين بعد الإجازة' },
      { emoji: '', name: 'علاج الشعر', why: 'ترميم بعد ملح البحر والكلور' },
      { emoji: '', name: 'قناع مغذي', why: 'تحضير البشرة للشتاء' },
    ],
  },
];

export default function SeasonalCalendarPage(): JSX.Element {
  const [season, setSeason] = useState('summer');
  const s = SEASONS.find((x) => x.key === season)!;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="default">
        <PageTitle title=" روزنامة الجمال" subtitle="خططي لجمالكِ حسب الموسم" />

        <div className="mb-6 flex gap-2">
          {SEASONS.map((sc) => (
            <button
              key={sc.key}
              type="button"
              onClick={() => setSeason(sc.key)}
              className={`flex-1 rounded-2xl border-2 p-3 text-center transition-all ${season === sc.key ? 'border-current bg-white dark:bg-gray-900' : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'}`}
              style={season === sc.key ? { borderColor: sc.color } : {}}
            >
              <span className="text-2xl">{sc.emoji}</span>
              <p className="mt-1 text-xs font-semibold text-text-primary dark:text-gray-100">
                {sc.name}
              </p>
            </button>
          ))}
        </div>

        <div className={`rounded-2xl bg-gradient-to-br ${s.bg} p-6`}>
          <h3 className="text-xl font-bold text-text-primary dark:text-gray-100">
            {s.emoji} {s.name}
          </h3>
          <p className="mt-1 text-sm text-text-secondary dark:text-gray-400">{s.months}</p>
          <p className="mt-4 rounded-xl bg-white/60 p-3 text-sm text-text-primary dark:bg-gray-800/60 dark:text-gray-200">
             {s.tips}
          </p>

          <h4 className="mt-6 text-sm font-bold text-text-primary dark:text-gray-100">
             الخدمات الموصى بها
          </h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {s.services.map((svc, i) => (
              <div key={i} className="flex gap-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
                <span className="text-xl shrink-0">{svc.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-text-primary dark:text-gray-100">
                    {svc.name}
                  </p>
                  <p className="text-xs text-text-tertiary dark:text-gray-500">{svc.why}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
