'use client';
import { useState } from 'react';
import { Card, Button, formatCurrency,
  BeautyBreakoutSOSCard, BeautySunburnReliefCard, BeautyPuffyEyesCard,
  BeautyChappedLipsCard, BeautyRednessReliefCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const EMERGENCIES = [
  { key:'pimple',emoji:'🔴',name:'بثرة طارئة',desc:'ظهور بثرة قبل مناسبة',price:50,time:'30 دقيقة',tips:['علاج موضعي سريع','تغطية احترافية','نصيحة وقائية']},
  { key:'smudge',emoji:'💄',name:'مكياج متلطخ',desc:'تلطخ المكياج فجأة',price:40,time:'20 دقيقة',tips:['إصلاح سريع','لمسات نهائية','تثبيت المكياج']},
  { key:'hair',emoji:'💇‍♀️',name:'شعر طارئ',desc:'تسريحة تفسد فجأة',price:60,time:'30 دقيقة',tips:['إعادة تصفيف سريع','تثبيت','لمسات نهائية']},
  { key:'nail',emoji:'💅',name:'ظفر مكسور',desc:'كسر ظفر قبل مناسبة',price:35,time:'15 دقيقة',tips:['إصلاح سريع','تطبيق لون مطابق','تقوية']},
  { key:'dry',emoji:'🏜️',name:'بشرة جافة',desc:'جفاف مفاجئ للبشرة',price:45,time:'25 دقيقة',tips:['ترطيب طارئ','قناع سريع','تجهيز للمكياج']},
  { key:'redness',emoji:'🔴',name:'احمرار البشرة',desc:'احمرار أو تهيج مفاجئ',price:55,time:'30 دقيقة',tips:['تهدئة فورية','قناع مهدئ','تغطية خفيفة']},
];

export default function BeautyRescuePage(): JSX.Element {
  const [selected, setSelected] = useState<string|null>(null);
  const [booked, setBooked] = useState(false);
  const emergency = EMERGENCIES.find(e=>e.key===selected);
  const surcharge = 1.5;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">🚨 إنقاذ الجمال</h1><p className="mt-1 text-sm text-text-secondary">خدمات تجميل طارئة — نصل لكِ خلال ساعة</p></div>

        {booked && emergency ? (
          <Card padding="lg" className="text-center border-2 border-green-300 bg-green-50">
            <p className="text-5xl">🚗</p>
            <p className="font-bold text-green-700 text-xl mt-3">تم الطلب!</p>
            <p className="text-sm text-text-secondary mt-1">خبيرة التجميل في الطريق — تصل خلال {emergency.time}</p>
            <p className="text-2xl font-extrabold text-green-600 mt-3">{formatCurrency(emergency.price * surcharge)}</p>
            <p className="text-xs text-text-secondary">شامل رسوم الطوارئ</p>
            <Button onClick={() => { setBooked(false); setSelected(null); }} className="mt-4">تم</Button>
          </Card>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {EMERGENCIES.map(e => {
                const isSel = selected === e.key;
                return (
                  <button key={e.key} onClick={() => setSelected(isSel ? null : e.key)} className={`rounded-xl border-2 p-4 text-right transition-all ${isSel?'border-red-400 bg-red-50':'border-gray-200 hover:border-gray-300'}`}>
                    <span className="text-3xl">{e.emoji}</span>
                    <h3 className="font-bold mt-2">{e.name}</h3>
                    <p className="text-xs text-text-secondary">{e.desc}</p>
                    <p className="text-sm font-bold text-brand-600 mt-1">{formatCurrency(e.price)} · ⏱️ {e.time}</p>
                  </button>
                );
              })}
            </div>

            {emergency && (
              <Card padding="lg">
                <h3 className="font-bold mb-3">{emergency.emoji} {emergency.name}</h3>
                <div className="space-y-2 mb-4">{emergency.tips.map((tip,i) => <p key={i} className="text-sm text-text-secondary">✓ {tip}</p>)}</div>
                <div className="flex justify-between text-sm mb-3"><span>سعر الخدمة</span><span>{formatCurrency(emergency.price)}</span></div>
                <div className="flex justify-between text-sm text-red-600"><span>رسوم الطوارئ (50%)</span><span>+{formatCurrency(emergency.price * 0.5)}</span></div>
                <hr className="my-2"/>
                <div className="flex justify-between font-bold text-lg"><span>الإجمالي</span><span>{formatCurrency(emergency.price * surcharge)}</span></div>
                <Button onClick={() => setBooked(true)} className="w-full mt-4">🚨 اطلبي الإنقاذ</Button>
              </Card>
            )}
          </>
        )}
      </div>

      {/* DIY SOS Tips */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
        <BeautyBreakoutSOSCard />
        <BeautySunburnReliefCard />
        <BeautyPuffyEyesCard />
        <BeautyChappedLipsCard />
        <BeautyRednessReliefCard />
      </div>
    </DashboardLayout>
  );
}
