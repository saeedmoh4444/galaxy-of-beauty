'use client';

import { cn } from '@galaxy/shared';

const TIPS = [
  { emoji: '🦶', title: 'نقع أسبوعي', desc: 'ماء دافئ وملح إنكليزي 15 دقيقة' },
  { emoji: '🪨', title: 'حجر الخفاف', desc: 'لإزالة الجلد الميت بلطف' },
  { emoji: '🧴', title: 'ترطيب عميق', desc: 'كريم مرطب قبل النوم مع جوارب' },
  { emoji: '💅', title: 'عناية بالأظافر', desc: 'قص مستقيم لمنع الانغراس' },
];

interface BeautyFootCareCardProps {
  className?: string;
}

export function BeautyFootCareCard({ className = '' }: BeautyFootCareCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🦶</span>
        <div>
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">عناية بالقدمين</h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">أقدام ناعمة طوال العام</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {TIPS.map((t) => (
          <div key={t.title} className="rounded-lg bg-teal-50 px-2.5 py-2 dark:bg-teal-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-teal-800 dark:text-teal-200">
              {t.title}
            </p>
            <p className="text-[9px] text-teal-600 dark:text-teal-400">{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
