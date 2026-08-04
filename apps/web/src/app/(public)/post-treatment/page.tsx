'use client';
import { useState } from 'react';
import { Card } from '@galaxy/ui';

const TREATMENTS = [
  { key: 'facial', nameAr: 'تنظيف البشرة', emoji: '✨', tips: [
    'تجنبي لمس وجهكِ لمدة ٢٤ ساعة', 'لا تضعي مكياج لمدة ١٢ ساعة', 'استخدمي واقي شمس SPF50', 'اشربي ٨ أكواب ماء على الأقل', 'تجنبي التمارين الرياضية لمدة ٢٤ ساعة', 'نامي على وسادة نظيفة',
  ]},
  { key: 'hair_color', nameAr: 'صبغ الشعر', emoji: '🎨', tips: [
    'لا تغسلي شعركِ لمدة ٤٨ ساعة', 'استخدمي شامبو خالٍ من الكبريتات', 'تجنبي الماء الساخن جداً', 'استخدمي بلسم عميق مرة أسبوعياً', 'احمي شعركِ من الشمس بقبعة أو وشاح', 'تجنبي أدوات التصفيف الحرارية لمدة ٣ أيام',
  ]},
  { key: 'wax', nameAr: 'إزالة الشعر بالشمع', emoji: '🕯️', tips: [
    'تجنبي التعرض المباشر للشمس ٢٤ ساعة', 'لا تستخدمي مقشرات لمدة ٤٨ ساعة', 'ضعي كريم مهدئ خالٍ من العطور', 'ارتدي ملابس قطنية فضفاضة', 'تجنبي السباحة لمدة ٢٤ ساعة', 'لا تلمسي المنطقة المعالجة بأيدٍ غير نظيفة',
  ]},
  { key: 'nails', nameAr: 'مانيكير وباديكير', emoji: '💅', tips: [
    'اتركي الأظافر تجف تماماً (٣٠ دقيقة)', 'ضعي زيت مرطب للبشرة حول الأظافر', 'تجنبي الماء الساخن لمدة ساعتين', 'ارتدي قفازات عند غسل الصحون', 'جددي الطبقة العلوية كل ٣ أيام',
  ]},
  { key: 'massage', nameAr: 'المساج', emoji: '💆‍♀️', tips: [
    'اشربي الكثير من الماء لطرد السموم', 'خذي حماماً دافئاً بملح إبسوم', 'تجنبي الكافيين لمدة ٤ ساعات', 'استريحي ولا تمارسي رياضة عنيفة', 'نامي مبكراً للاستفادة القصوى',
  ]},
  { key: 'henna', nameAr: 'الحناء', emoji: '🌿', tips: [
    'اتركي الحناء تجف طبيعياً (بدون مجفف)', 'لا تغسلي المنطقة لمدة ١٢ ساعة', 'ضعي زيت خروع لتعميق اللون', 'تجنبي الماء والصابون على الحناء', 'لفي المنطقة بغطاء بلاستيكي للاحتفاظ بالحرارة',
  ]},
];

export default function PostTreatmentPage(): JSX.Element {
  const [selected, setSelected] = useState('facial');
  const treatment = TREATMENTS.find(t => t.key === selected) ?? TREATMENTS[0]!;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-6xl">💆‍♀️</span>
        <h1 className="mt-4 text-3xl font-bold">العناية بعد الخدمة</h1>
        <p className="mt-2 text-text-secondary">نصائح للعناية بنفسكِ بعد خدمات التجميل — لنتائج تدوم أطول</p>
      </div>

      <div className="flex justify-center gap-2 mb-10 flex-wrap">
        {TREATMENTS.map(t => (
          <button key={t.key} onClick={() => setSelected(t.key)} className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${selected===t.key?'bg-brand-600 text-white shadow-lg':'bg-surface-muted hover:bg-gray-200'}`}>{t.emoji} {t.nameAr}</button>
        ))}
      </div>

      <Card padding="lg" className="text-center max-w-2xl mx-auto">
        <span className="text-6xl block mb-4">{treatment.emoji}</span>
        <h2 className="text-2xl font-bold">{treatment.nameAr}</h2>
        <p className="text-sm text-text-secondary mt-2 mb-6">اتبعي هذه النصائح للحصول على أفضل النتائج</p>
        <div className="grid gap-3 sm:grid-cols-2 text-right">
          {treatment.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
              <span className="text-brand-600 font-bold">{i + 1}.</span>
              <span className="text-sm">{tip}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
