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
  /** Header title */
  title?: string;
  /** Header subtitle */
  subtitle?: string;
  /** Title of the private room box */
  privateRoomTitle?: string;
  /** Note in the private room box */
  privateRoomNote?: string;
  /** Book button label */
  bookLabel?: string;
  /** Footer text */
  footerText?: string;
  /** Locale for internal tips data strings */
  locale?: 'ar' | 'en';
}

const TIPS: {
  emoji: string;
  title: { ar: string; en: string };
  desc: { ar: string; en: string };
}[] = [
  {
    emoji: '',
    title: { ar: 'عناية بالشعر تحت الحجاب', en: 'Hair care under the hijab' },
    desc: {
      ar: 'جلسات ترطيب عميق أسبوعياً — لأن شعركِ يحتاج عناية إضافية تحت الحجاب',
      en: 'Weekly deep-conditioning sessions — because your hair needs extra care under the hijab',
    },
  },
  {
    emoji: '‍️',
    title: { ar: 'تدليك فروة الرأس', en: 'Scalp massage' },
    desc: {
      ar: 'يحسن الدورة الدموية ويمنع تساقط الشعر الناتج عن الحجاب',
      en: 'Improves circulation and prevents hijab-related hair loss',
    },
  },
  {
    emoji: '',
    title: { ar: 'مكياج يناسب الحجاب', en: 'Hijab-friendly makeup' },
    desc: {
      ar: 'تركيز على العينين والحواجب — لأنها نافذة وجهكِ',
      en: 'Focus on the eyes and brows — they are the window of your face',
    },
  },
  {
    emoji: '',
    title: { ar: 'روتين مسائي للشعر', en: 'Evening hair routine' },
    desc: {
      ar: 'فك الشعر فور العودة للمنزل وترطيبه ليسترجع حيويته',
      en: 'Undo your hair as soon as you get home and moisturize it to restore its vitality',
    },
  },
  {
    emoji: '',
    title: { ar: 'بطانة حجاب حريرية', en: 'Silk hijab lining' },
    desc: {
      ar: 'تحمي الشعر من التكسر وتقلل الاحتكاك — متوفرة في صالوناتنا',
      en: 'Protects hair from breakage and reduces friction — available at our salons',
    },
  },
  {
    emoji: '',
    title: { ar: 'عناية بالبشرة', en: 'Skincare' },
    desc: {
      ar: 'تركيز على منطقة الجبهة والذقن — الأكثر تأثراً بالحجاب',
      en: 'Focus on the forehead and chin — most affected by the hijab',
    },
  },
];

export function HijabiBeautyCard({
  onBook,
  className = '',
  title = 'جمال المحجبات',
  subtitle = 'عناية متخصصة للمرأة المحجبة',
  privateRoomTitle = 'غرفة خاصة متوفرة',
  privateRoomNote = 'جميع خدماتنا في غرف خاصة — لا داعي لخلع الحجاب أمام أحد',
  bookLabel = 'احجزي جلستكِ الخاصة',
  footerText = 'حجابكِ تاجكِ — ونهتم بجمالكِ تحته',
  locale = 'ar',
}: HijabiBeautyCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-emerald-50 p-5 dark:border-teal-900 dark:from-teal-950 dark:to-emerald-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-teal-800 dark:text-teal-200">{title}</h4>
        <p className="text-[10px] text-teal-600 dark:text-teal-400">{subtitle}</p>
      </div>

      {/* Tips */}
      <div className="mt-3 space-y-2">
        {TIPS.map((tip) => (
          <div
            key={tip.title.ar}
            className="flex items-start gap-2.5 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60"
          >
            <span className="text-lg shrink-0 mt-0.5" aria-hidden="true">
              {tip.emoji}
            </span>
            <div>
              <p className="text-xs font-bold text-text-primary dark:text-gray-100">
                {tip.title[locale]}
              </p>
              <p className="text-[10px] text-text-secondary dark:text-gray-300">
                {tip.desc[locale]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Private room */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-teal-800 dark:text-teal-200">{privateRoomTitle}</p>
        <p className="mt-0.5 text-[10px] text-teal-600 dark:text-teal-400">{privateRoomNote}</p>
      </div>

      <button
        type="button"
        onClick={onBook}
        className="mt-3 w-full rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white hover:bg-teal-700 active:scale-[0.98] transition-all"
      >
        {bookLabel}
      </button>

      <p className="mt-2 text-center text-[9px] text-teal-600 dark:text-teal-400">{footerText}</p>
    </div>
  );
}
