'use client';

import { cn } from '@galaxy/shared';

/**
 * Hijabi Beauty Card — beauty tips and services adapted for hijabi women.
 * From Phase W4: Sisterhood & Community — Beauty Circles (Hijabi Beauty topic).
 *
 * Usage:
 *   <HijabiBeautyCard onBook={() => {}} />
 */

interface HijabiBeautyCardProps {
  onBook?: () => void;
  className?: string;
}

const TIPS = [
  {
    emoji: '',
    title: 'عناية بالشعر تحت الحجاب',
    desc: 'جلسات ترطيب عميق أسبوعياً — لأن شعركِ يحتاج عناية إضافية تحت الحجاب',
  },
  {
    emoji: '‍️',
    title: 'تدليك فروة الرأس',
    desc: 'يحسن الدورة الدموية ويمنع تساقط الشعر الناتج عن الحجاب',
  },
  {
    emoji: '',
    title: 'مكياج يناسب الحجاب',
    desc: 'تركيز على العينين والحواجب — لأنها نافذة وجهكِ',
  },
  {
    emoji: '',
    title: 'روتين مسائي للشعر',
    desc: 'فك الشعر فور العودة للمنزل وترطيبه ليسترجع حيويته',
  },
  {
    emoji: '',
    title: 'بطانة حجاب حريرية',
    desc: 'تحمي الشعر من التكسر وتقلل الاحتكاك — متوفرة في صالوناتنا',
  },
  {
    emoji: '',
    title: 'عناية بالبشرة',
    desc: 'تركيز على منطقة الجبهة والذقن — الأكثر تأثراً بالحجاب',
  },
];

export function HijabiBeautyCard({ onBook, className = '' }: HijabiBeautyCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-emerald-50 p-5 dark:border-teal-900 dark:from-teal-950 dark:to-emerald-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-teal-800 dark:text-teal-200">جمال المحجبات</h4>
        <p className="text-[10px] text-teal-600 dark:text-teal-400">عناية متخصصة للمرأة المحجبة</p>
      </div>

      {/* Tips */}
      <div className="mt-3 space-y-2">
        {TIPS.map((tip) => (
          <div
            key={tip.title}
            className="flex items-start gap-2.5 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60"
          >
            <span className="text-lg shrink-0 mt-0.5" aria-hidden="true">
              {tip.emoji}
            </span>
            <div>
              <p className="text-xs font-bold text-text-primary dark:text-gray-100">{tip.title}</p>
              <p className="text-[10px] text-text-secondary dark:text-gray-300">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Private room */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-teal-800 dark:text-teal-200">غرفة خاصة متوفرة</p>
        <p className="mt-0.5 text-[10px] text-teal-600 dark:text-teal-400">
          جميع خدماتنا في غرف خاصة — لا داعي لخلع الحجاب أمام أحد
        </p>
      </div>

      <button
        type="button"
        onClick={onBook}
        className="mt-3 w-full rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white hover:bg-teal-700 active:scale-[0.98] transition-all"
      >
        احجزي جلستكِ الخاصة
      </button>

      <p className="mt-2 text-center text-[9px] text-teal-600 dark:text-teal-400">
        حجابكِ تاجكِ — ونهتم بجمالكِ تحته
      </p>
    </div>
  );
}
