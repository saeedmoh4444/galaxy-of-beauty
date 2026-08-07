'use client';

import { useState } from 'react';

const MEMBERSHIPS = [
  { key:'basic',emoji:'🥈',name:'الأساسية',price:0,color:'#9ca3af',benefits:['حجز المواعيد','تصفح الخدمات','تقييم الفنيات'],notIncluded:['خصم على الخدمات','حجز أولوية','استشارات مجانية']},
  { key:'premium',emoji:'🥇',name:'المميزة',price:99,color:'#f59e0b',benefits:['خصم ١٠٪ على جميع الخدمات','حجز أولوية','استشارة مجانية شهرياً','هدية ترحيبية','نقاط مضاعفة','دخول فعاليات حصرية'],notIncluded:['مديرة حساب شخصية']},
  { key:'platinum',emoji:'💎',name:'البلاتينية',price:299,color:'#7c3aed',benefits:['خصم ٢٠٪ على جميع الخدمات','حجز فوري','استشارات غير محدودة','مديرة حساب شخصية','هدية شهرية','نقاط ×٣','فعاليات VIP','خدمة توصيل مجانية'],notIncluded:[]},
];

export default function SalonMembershipPage(): JSX.Element {
  const [selected, setSelected] = useState('premium');

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center mb-12">
        <span className="text-6xl">💳</span>
        <h1 className="mt-4 text-4xl font-extrabold">عضويات الصالون</h1>
        <p className="mt-3 text-lg text-text-secondary">اختاري العضوية اللي تناسبكِ</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {MEMBERSHIPS.map((m) => {
          const isSelected = selected === m.key;
          return (
            <button key={m.key} type="button" onClick={() => setSelected(m.key)} className={`rounded-3xl border-2 p-8 text-right transition-all ${isSelected ? 'border-current bg-white shadow-xl dark:bg-gray-900 scale-105' : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'}`} style={isSelected ? { borderColor: m.color } : {}}>
              <div className="text-center">
                <span className="text-5xl">{m.emoji}</span>
                <h3 className="mt-3 text-xl font-bold">{m.name}</h3>
                <p className="mt-2 text-4xl font-extrabold" style={{ color: m.color }}>{m.price === 0 ? 'مجاناً' : `${m.price} ر.س`}<span className="text-sm font-normal text-text-tertiary">/شهرياً</span></p>
              </div>
              <div className="mt-6 space-y-3">
                {m.benefits.map((b) => (<p key={b} className="flex items-center gap-2 text-sm text-text-primary dark:text-gray-200"><span className="text-emerald-500">✓</span> {b}</p>))}
                {m.notIncluded.map((b) => (<p key={b} className="flex items-center gap-2 text-sm text-text-tertiary line-through dark:text-gray-600"><span className="text-gray-400">✗</span> {b}</p>))}
              </div>
              <div className="mt-8 text-center">
                <span className={`rounded-2xl px-8 py-3 text-sm font-bold transition-all ${isSelected ? 'text-white' : 'bg-gray-100 text-text-primary dark:bg-gray-800 dark:text-gray-200'}`} style={isSelected ? { backgroundColor: m.color } : {}}>{m.price === 0 ? 'ابدئي الآن' : 'اشتركي'}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
