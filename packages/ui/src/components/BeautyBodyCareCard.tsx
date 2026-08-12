'use client';

import { cn } from '@galaxy/shared';

const TIPS = [
  { emoji: '🧖', title: 'تقشير أسبوعي', desc: 'يزيل الخلايا الميتة ويجدد البشرة' },
  { emoji: '🧴', title: 'ترطيب بعد الاستحمام', desc: 'البشرة تمتص المرطب أفضل وهي رطبة' },
  { emoji: '☀️', title: 'واقي للجسم', desc: 'لا تنسي رقبتك ويديك وقدميك' },
  { emoji: '💧', title: 'شرب الماء', desc: 'بشرة الجسم تحتاج ترطيب من الداخل' },
];

interface BeautyBodyCareCardProps {
  className?: string;
}

export function BeautyBodyCareCard({ className = '' }: BeautyBodyCareCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🧖</span>
        <div>
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">عناية بالجسم</h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">
            بشرة ناعمة من الرأس للقدمين
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {TIPS.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 dark:bg-teal-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <div>
              <p className="text-[10px] font-bold text-teal-800 dark:text-teal-200">{t.title}</p>
              <p className="text-[9px] text-teal-600 dark:text-teal-400">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
