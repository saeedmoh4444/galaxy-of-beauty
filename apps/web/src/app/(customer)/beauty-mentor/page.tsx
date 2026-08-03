'use client';
import { useState } from 'react';
import { Card  } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const LEVELS = [
  {key:'beginner',emoji:'🌱',name:'مبتدئة',desc:'اكتشفي أساسيات العناية',plan:['تعلمي روتين العناية اليومي','اكتشفي نوع بشرتكِ','أساسيات المكياج اليومي','كيف تختارين المنتجات المناسبة','أساسيات العناية بالشعر']},
  {key:'intermediate',emoji:'🌸',name:'متوسطة',desc:'طوري روتينكِ',plan:['طبقي روتين عناية متكامل','تعلمي مكياج المناسبات','جربي صبغات شعر منزلية','اكتشفي عالم العطور','تعلمي تقنيات العناية بالأظافر']},
  {key:'advanced',emoji:'✨',name:'متقدمة',desc:'أتقني فنون التجميل',plan:['صممي روتين عناية شخصي','أتقني المكياج الاحترافي','تعلمي تسريحات شعر متقدمة','فن مزج العطور', 'تقنيات أظافر احترافية (nail art)']},
];

const TOPICS = ['العناية بالبشرة','المكياج','العناية بالشعر','الأظافر','العطور','التغذية'];

const TOPIC_TIPS: Record<string,string[]> = {
  'العناية بالبشرة': ['استخدمي غسول مناسب لنوع بشرتكِ','لا تنسي واقي الشمس يومياً','قشري بشرتكِ مرة أسبوعياً','اشربي ٨ أكواب ماء يومياً','جربي الماسكات الطبيعية'],
  'المكياج': ['ابدئي بكريم أساس مناسب','تعلمي تقنية الكونتور الأساسية','اختاري ألوان تناسب لون بشرتكِ','استثمري في فرش مكياج جيدة','أزيلي المكياج قبل النوم دائماً'],
  'العناية بالشعر': ['اغسلي شعركِ ٢-٣ مرات أسبوعياً','استخدمي بلسم بعد كل غسلة','قصي أطراف شعركِ كل ٣ أشهر','تجنبي الحرارة الزائدة','جربي حمام زيت أسبوعي'],
  'الأظافر': ['رطبي البشرة حول الأظافر يومياً','استخدمي مقوي أظافر','تجنبي قضم الأظافر','غيري طلاء الأظافر كل أسبوع','استخدمي قفازات عند التنظيف'],
  'العطور': ['ضعي العطر على نقاط النبض','لا تفركي العطر بعد وضعه','خزني العطور في مكان بارد ومظلم','جربي layering العطور','اختاري عطر الصباح مختلف عن المساء'],
  'التغذية': ['تناولي فيتامين C لنضارة البشرة','أضيفي أوميغا ٣ لشعر صحي','قللي السكر لصحة البشرة','تناولي البروتين لأظافر قوية','اشربي الشاي الأخضر كمضاد أكسدة'] };

export default function BeautyMentorPage(): JSX.Element {
  const [level, setLevel] = useState('beginner');
  const [selectedTopic, setSelectedTopic] = useState<string|null>(null);
  const currentLevel = LEVELS.find(l=>l.key===level)!;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div><h1 className="text-2xl font-bold">👩‍🏫 مرشدة الجمال</h1><p className="mt-1 text-sm text-text-secondary">تعلمي من خبيرات التجميل — خطوة بخطوة</p></div>

        <div className="grid gap-3 sm:grid-cols-3">
          {LEVELS.map(l => (
            <button key={l.key} onClick={() => setLevel(l.key)} className={`rounded-xl border-2 p-4 text-center transition-all ${level===l.key?'border-brand-400 bg-brand-50 shadow-lg':'border-gray-200 hover:border-gray-300'}`}>
              <span className="text-4xl block">{l.emoji}</span>
              <p className="font-bold mt-2">{l.name}</p>
              <p className="text-xs text-text-secondary">{l.desc}</p>
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card padding="lg"><h3 className="font-bold mb-3">📋 خطة التعلم — {currentLevel.name}</h3>
            <div className="space-y-2">{currentLevel.plan.map((step,i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">{i+1}</span>
                <span className="text-sm">{step}</span>
              </div>
            ))}</div>
          </Card>

          <Card padding="lg"><h3 className="font-bold mb-3">📚 المواضيع</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {TOPICS.map(tp => (
                <button key={tp} onClick={() => setSelectedTopic(selectedTopic===tp?null:tp)} className={`rounded-full px-4 py-2 text-sm transition-all ${selectedTopic===tp?'bg-brand-600 text-white':'bg-surface-muted hover:bg-gray-200'}`}>{tp}</button>
              ))}
            </div>
            {selectedTopic && (
              <div className="rounded-lg border p-4">
                <h4 className="font-bold text-brand-600 mb-3">💡 نصائح {selectedTopic}</h4>
                <div className="space-y-2">{(TOPIC_TIPS[selectedTopic]??[]).map((tip,i) => (
                  <p key={i} className="text-sm text-text-primary">• {tip}</p>
                ))}</div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
