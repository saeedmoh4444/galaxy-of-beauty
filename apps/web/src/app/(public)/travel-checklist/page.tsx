'use client';
import { useState } from 'react';
import { Card } from '@galaxy/ui';

const CATEGORIES = [
  { key: 'carryon', nameAr: '👜 حقيبة اليد', items: [
    'مرطب وجه بحجم سفر', 'واقي شمس SPF50', 'بلسم شفاه مرطب', 'بخاخ ماء ورد منعش', 'مناديل مزيل مكياج', 'كريم يدين صغير', 'عطر رول صغير', 'ربطة شعر احتياطية',
  ]},
  { key: 'skincare', nameAr: '✨ العناية بالبشرة', items: [
    'غسول وجه', 'تونر', 'سيروم فيتامين C', 'كريم ليلي', 'ماسك ورقي (عدد المسافرين)', 'زيت وجه', 'مقشر لطيف',
  ]},
  { key: 'makeup', nameAr: '💄 المكياج', items: [
    'كريم أساس', 'كونسيلر', 'بودرة تثبيت', 'أحمر خدود', 'باليت ظلال عيون', 'ماسكارا', 'محدد عيون', 'أحمر شفاه (لونين)', 'فرش مكياج أساسية',
  ]},
  { key: 'hair', nameAr: '💇‍♀️ الشعر', items: [
    'شامبو', 'بلسم', 'زيت شعر', 'سيروم تصفيف', 'فرشاة شعر', 'مكواة شعر صغيرة',
  ]},
  { key: 'body', nameAr: '🧴 الجسم', items: [
    'لوشن جسم', 'مزيل عرق', 'زيت استحمام', 'ليفة', 'كريم حلاقة', 'مقص أظافر', 'مبرد أظافر',
  ]},
];

export default function TravelChecklistPage(): JSX.Element {
  const [checked, setChecked] = useState<Record<string,boolean>>({});
  const toggle = (item: string) => setChecked(prev => ({ ...prev, [item]: !prev[item] }));
  const allItems = CATEGORIES.flatMap(c => c.items);
  const checkedCount = allItems.filter(i => checked[i]).length;
  const pct = Math.round((checkedCount / allItems.length) * 100);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-6xl">🧳</span>
        <h1 className="mt-4 text-3xl font-bold">قائمة تحضير السفر</h1>
        <p className="mt-2 text-text-secondary">لا تنسي شيئاً من مستلزمات جمالكِ في سفركِ</p>
        <div className="mt-4"><div className="h-3 bg-surface-muted rounded-full max-w-md mx-auto"><div className="h-3 bg-green-500 rounded-full transition-all" style={{width:`${pct}%`}}/></div><p className="text-sm text-text-secondary mt-1">{checkedCount}/{allItems.length} — {pct}%</p></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {CATEGORIES.map(cat => (
          <Card key={cat.key} padding="lg">
            <h3 className="font-bold text-lg mb-3">{cat.nameAr}</h3>
            <div className="space-y-1">{cat.items.map(item => (
              <label key={item} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${checked[item]?'bg-green-50 line-through text-text-tertiary':''}`}>
                <input type="checkbox" checked={checked[item] ?? false} onChange={() => toggle(item)} className="w-4 h-4 accent-brand-600" />
                <span className="text-sm">{item}</span>
              </label>
            ))}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
