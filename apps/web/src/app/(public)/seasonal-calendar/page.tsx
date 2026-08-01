'use client';
import { useState } from 'react';
import { Card } from '@galaxy/shared';

const MONTHS = [
  { key: 'jan', nameAr: 'يناير', emoji: '❄️', season: 'winter', tips: ['ترطيب مكثف للبشرة', 'حمام زيت للشعر أسبوعياً', 'مانيكير بألوان شتوية داكنة'] },
  { key: 'feb', nameAr: 'فبراير', emoji: '💝', season: 'winter', tips: ['عناية بالشفايف تحضيراً لعيد الحب', 'مكياج ناعم رومانسي', 'جلسة عناية بالبشرة قبل الربيع'] },
  { key: 'mar', nameAr: 'مارس', emoji: '🌸', season: 'spring', tips: ['تقشير البشرة لتجديد الخلايا', 'قص أطراف الشعر', 'ألوان مكياج ربيعية منعشة'] },
  { key: 'apr', nameAr: 'أبريل', emoji: '🌿', season: 'spring', tips: ['التحضير للعيد — عناية متكاملة', 'صبغات شعر بألوان دافئة', 'حناء العيد'] },
  { key: 'may', nameAr: 'مايو', emoji: '☀️', season: 'spring', tips: ['بدء استخدام واقي شمس قوي', 'جلسات تفتيح البشرة', 'باديكير بألوان صيفية'] },
  { key: 'jun', nameAr: 'يونيو', emoji: '🏖️', season: 'summer', tips: ['عناية بالبشرة قبل المصيف', 'إزالة شعر الجسم', 'تسريحات شعر صيفية عملية'] },
  { key: 'jul', nameAr: 'يوليو', emoji: '🌞', season: 'summer', tips: ['واقي شمس SPF50 ضروري', 'مكياج خفيف مقاوم للماء', 'علاجات الشعر من أضرار الشمس'] },
  { key: 'aug', nameAr: 'أغسطس', emoji: '🌊', season: 'summer', tips: ['ترطيب بعد الشمس يومياً', 'مانيكير بألوان النيون', 'عناية بالبشرة الدهنية'] },
  { key: 'sep', nameAr: 'سبتمبر', emoji: '🍂', season: 'autumn', tips: ['علاج تصبغات الصيف', 'تقشير كيميائي خفيف', 'ألوان خريفية دافئة للمكياج'] },
  { key: 'oct', nameAr: 'أكتوبر', emoji: '🎃', season: 'autumn', tips: ['ترميم الشعر после الصيف', 'ترطيب عميق للجسم', 'ألوان أظافر خريفية'] },
  { key: 'nov', nameAr: 'نوفمبر', emoji: '🍁', season: 'autumn', tips: ['تحضير البشرة للشتاء', 'ماسكات مغذية أسبوعية', 'صبغات شعر بألوان غنية'] },
  { key: 'dec', nameAr: 'ديسمبر', emoji: '🎄', season: 'winter', tips: ['إطلالات الأعياد والمناسبات', 'مكياج احتفالي', 'عناية بالبشرة قبل نهاية السنة'] },
];

const SEASONS_ARR = [
  { key: 'all', nameAr: 'كل السنة', emoji: '📅' },
  { key: 'winter', nameAr: 'الشتاء', emoji: '❄️' },
  { key: 'spring', nameAr: 'الربيع', emoji: '🌸' },
  { key: 'summer', nameAr: 'الصيف', emoji: '☀️' },
  { key: 'autumn', nameAr: 'الخريف', emoji: '🍂' },
];

export default function SeasonalCalendarPage(): JSX.Element {
  const [filter, setFilter] = useState('all');
  const months = MONTHS.filter(m => filter === 'all' || m.season === filter);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-6xl">📅</span>
        <h1 className="mt-4 text-3xl font-bold">تقويم الجمال السنوي</h1>
        <p className="mt-2 text-gray-500">دليلكِ الشهري للعناية بالجمال — كل شهر له أسراره</p>
      </div>

      <div className="flex justify-center gap-2 mb-10 flex-wrap">
        {SEASONS_ARR.map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)} className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${filter===s.key?'bg-brand-600 text-white':'bg-gray-100 hover:bg-gray-200'}`}>{s.emoji} {s.nameAr}</button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {months.map(m => (
          <Card key={m.key} padding="lg" hover>
            <div className="flex items-center gap-3 mb-3"><span className="text-3xl">{m.emoji}</span><h3 className="text-xl font-bold">{m.nameAr}</h3></div>
            <ul className="space-y-2">{m.tips.map((tip, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-700"><span className="text-brand-600 mt-0.5">•</span>{tip}</li>)}</ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
