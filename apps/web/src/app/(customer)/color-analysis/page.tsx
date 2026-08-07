'use client';

import { useState } from 'react';
import { PageContainer, PageTitle } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const SEASONS = [
  { key: 'winter', emoji: '❄️', name: 'شتوية', desc: 'ألوان باردة وعميقة', colors: ['#1e1b4b', '#312e81', '#831843', '#ffffff', '#000000', '#dc2626', '#4c1d95'], skin: 'بشرة فاتحة أو زيتونية باردة', makeup: ['أحمر شفاه عنابي', 'ظلال عيون بنفسجية', 'أيلاينر أسود'], jewelry: 'الفضة' },
  { key: 'summer', emoji: '🌸', name: 'صيفية', desc: 'ألوان ناعمة وباستيل', colors: ['#fbcfe8', '#ddd6fe', '#bfdbfe', '#d1d5db', '#ec4899', '#8b5cf6', '#93c5fd'], skin: 'بشرة فاتحة أو متوسطة باردة', makeup: ['أحمر شفاه وردي', 'ظلال عيون لافندر', 'ماسكارا بنية'], jewelry: 'الفضة' },
  { key: 'autumn', emoji: '🍂', name: 'خريفية', desc: 'ألوان دافئة وغنية', colors: ['#fef3c7', '#fed7aa', '#fde68a', '#d97706', '#b45309', '#92400e', '#78350f'], skin: 'بشرة زيتونية دافئة أو ذهبية', makeup: ['أحمر شفاه برونزي', 'ظلال عيون ترابية', 'بلاشر خوخي'], jewelry: 'الذهب' },
  { key: 'spring', emoji: '🌱', name: 'ربيعية', desc: 'ألوان مشرقة ودافئة', colors: ['#fef08a', '#fde047', '#86efac', '#fca5a5', '#fb923c', '#22c55e', '#fbbf24'], skin: 'بشرة فاتحة دافئة أو خوخية', makeup: ['أحمر شفاه مرجاني', 'ظلال عيون ذهبية', 'هايلايتر شمباني'], jewelry: 'الذهب' },
];

export default function ColorAnalysisPage(): JSX.Element {
  const [season, setSeason] = useState('summer');
  const s = SEASONS.find((x) => x.key === season)!;

  return (
    <DashboardLayout role="CUSTOMER">
      <PageContainer width="default">
        <PageTitle title="🎨 تحليل الألوان" subtitle="اكتشفي الألوان اللي تناسب بشرتكِ" />

        <div className="mb-6 flex gap-2">
          {SEASONS.map((sc) => (
            <button
              key={sc.key}
              type="button"
              onClick={() => setSeason(sc.key)}
              className={`flex-1 rounded-2xl border-2 p-3 text-center transition-all ${season === sc.key ? 'border-rose-400 bg-rose-50 dark:border-rose-600 dark:bg-rose-950' : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'}`}
            >
              <span className="text-2xl">{sc.emoji}</span>
              <p className={`mt-1 text-xs font-semibold ${season === sc.key ? 'text-rose-600 dark:text-rose-400' : 'text-text-tertiary dark:text-gray-500'}`}>{sc.name}</p>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-xl font-bold text-text-primary dark:text-gray-100">{s.emoji} {s.name} — {s.desc}</h3>
          <p className="mt-2 text-sm text-text-secondary dark:text-gray-400">🎨 {s.skin}</p>

          <h4 className="mt-6 text-sm font-bold text-text-primary dark:text-gray-100">🎨 لوحة الألوان</h4>
          <div className="mt-3 flex gap-2">
            {s.colors.map((c, i) => (
              <div key={i} className="h-10 w-10 rounded-full border border-gray-200 shadow-sm dark:border-gray-700" style={{ backgroundColor: c }} />
            ))}
          </div>

          <h4 className="mt-6 text-sm font-bold text-text-primary dark:text-gray-100">💄 المكياج المناسب</h4>
          <div className="mt-2 space-y-2">
            {s.makeup.map((m, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
                <span>💄</span>
                <span className="text-sm text-text-secondary dark:text-gray-300">{m}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
            <span className="text-sm text-text-tertiary dark:text-gray-500">💍 المجوهرات</span>
            <span className="text-lg font-bold text-amber-500">{s.jewelry}</span>
          </div>
        </div>

        <button type="button" className="mt-6 w-full rounded-2xl bg-rose-600 py-4 text-center text-base font-bold text-white hover:bg-rose-700 transition-colors">
          📸 حللي بشرتكِ
        </button>
      </PageContainer>
    </DashboardLayout>
  );
}
