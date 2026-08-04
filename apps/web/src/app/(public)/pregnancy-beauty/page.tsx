'use client';
import { useState } from 'react';
import { Card } from '@galaxy/ui';

const TRIMESTERS = [
  { key: 'first', nameAr: 'الثلث الأول (١-٣ أشهر)', emoji: '🌱', tips: [
    { title: 'تجنبي العلاجات الكيميائية القوية', desc: 'ابتعدي عن التقشير الكيميائي والليزر خلال هذه الفترة', icon: '⚠️' },
    { title: 'استخدمي منتجات طبيعية', desc: 'اختاري كريمات خالية من الريتينول والأحماض القوية', icon: '🌿' },
    { title: 'العناية بالغثيان الصباحي', desc: 'جلسات مساج خفيف بالزيوت العطرية الآمنة للحامل', icon: '💆‍♀️' },
    { title: 'ترطيب مكثف', desc: 'زيت الجوجوبا وزبدة الشيا لمنع تشققات البطن', icon: '🧴' },
    { title: 'تجنبي صبغات الشعر', desc: 'انتظري حتى الثلث الثاني لصبغ الشعر بمنتجات خالية من الأمونيا', icon: '🎨' },
  ]},
  { key: 'second', nameAr: 'الثلث الثاني (٤-٦ أشهر)', emoji: '🌸', tips: [
    { title: 'مساج الحمل', desc: 'مساج متخصص للحامل — يخفف آلام الظهر ويحسن النوم', icon: '💆‍♀️' },
    { title: 'مانيكير وباديكير آمن', desc: 'استخدمي منتجات خالية من المواد الكيميائية الضارة', icon: '💅' },
    { title: 'عناية بالبشرة المتوهجة', desc: 'استغلي توهج الحمل مع روتين عناية لطيف', icon: '✨' },
    { title: 'صبغات شعر آمنة', desc: 'يمكنكِ صبغ شعركِ بمنتجات خالية من الأمونيا', icon: '💇‍♀️' },
    { title: 'حمام دافئ (وليس ساخناً)', desc: 'جلسات استرخاء بالماء الدافئ مع الأملاح الطبيعية', icon: '🛁' },
  ]},
  { key: 'third', nameAr: 'الثلث الثالث (٧-٩ أشهر)', emoji: '👶', tips: [
    { title: 'جلسات استرخاء وتحضير للولادة', desc: 'مساج خفيف مع تقنيات تنفس', icon: '🧘' },
    { title: 'عناية بالقدمين', desc: 'باديكير لطيف مع تدليك للتخفيف من تورم القدمين', icon: '🦶' },
    { title: 'تحضير بشرة الوجه', desc: 'تنظيف وترطيب عميق استعداداً للولادة', icon: '✨' },
    { title: 'تجنبي الاستلقاء على الظهر', desc: 'اختاري جلسات عناية بوضعية الجلوس أو الجانب', icon: '⚠️' },
    { title: 'قص الشعر فقط', desc: 'تجنبي الصبغات في الأسابيع الأخيرة', icon: '✂️' },
  ]},
];

const SAFE_INGREDIENTS = ['زيت الجوجوبا', 'زبدة الشيا', 'الألوفيرا', 'زيت جوز الهند', 'زيت اللوز الحلو', 'البابونج', 'اللافندر', 'ماء الورد'];
const AVOID_INGREDIENTS = ['الريتينول', 'حمض الساليسيليك', 'الهيدروكينون', 'الفورمالديهايد', 'الزيوت العطرية القوية', 'الأمونيا'];

export default function PregnancyBeautyPage(): JSX.Element {
  const [trimester, setTrimester] = useState('first');
  const current = TRIMESTERS.find(t => t.key === trimester) ?? TRIMESTERS[0]!;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-6xl">🤰</span>
        <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">عناية الحامل</h1>
        <p className="mt-2 text-text-secondary">دليل العناية بالجمال خلال فترة الحمل — آمن لكِ ولجنينكِ</p>
      </div>

      <div className="flex justify-center gap-2 mb-10 flex-wrap">
        {TRIMESTERS.map(t => (
          <button key={t.key} onClick={() => setTrimester(t.key)} className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all ${trimester===t.key?'bg-brand-600 text-white':'bg-surface-muted hover:bg-gray-200'}`}>{t.emoji} {t.nameAr}</button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        <Card padding="lg"><h3 className="font-bold text-lg mb-4">✅ مكونات آمنة</h3>
          <div className="flex flex-wrap gap-2">{SAFE_INGREDIENTS.map(i => <span key={i} className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">{i}</span>)}</div>
        </Card>
        <Card padding="lg"><h3 className="font-bold text-lg mb-4">🚫 مكونات يجب تجنبها</h3>
          <div className="flex flex-wrap gap-2">{AVOID_INGREDIENTS.map(i => <span key={i} className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">{i}</span>)}</div>
        </Card>
      </div>

      <h2 className="text-xl font-bold mb-6 text-center">{current.emoji} نصائح {current.nameAr}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{current.tips.map((tip, i) => (
        <Card key={i} padding="md"><div className="flex items-start gap-3"><span className="text-2xl">{tip.icon}</span><div><h4 className="font-bold text-sm">{tip.title}</h4><p className="text-xs text-text-secondary mt-1">{tip.desc}</p></div></div></Card>
      ))}</div>
    </div>
  );
}
