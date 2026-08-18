'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Concierge Card — personal beauty concierge service.
 * From Phase W9: The Small Details — Delightful Surprises.
 *
 * Usage:
 *   <BeautyConciergeCard conciergeName="سارة" />
 */

interface BeautyConciergeCardProps {
  conciergeName?: string;
  onChat?: () => void;
  onCall?: () => void;
  className?: string;
  /** Card heading */
  title?: string;
  /** Subtitle after the concierge name */
  subtitle?: string;
  /** Chat button label */
  chatButtonText?: string;
  /** Call button label */
  callButtonText?: string;
  /** Footer quote */
  quoteText?: string;
  /** Display locale for service labels */
  locale?: 'ar' | 'en';
}

const SERVICES = [
  { emoji: '', label: { ar: 'تنظيم المواعيد', en: 'Appointment scheduling' } },
  { emoji: '', label: { ar: 'اقتراح خدمات', en: 'Service suggestions' } },
  { emoji: '', label: { ar: 'تنسيق المفاجآت', en: 'Surprise coordination' } },
  { emoji: '', label: { ar: 'ترتيب التوصيل', en: 'Delivery arrangement' } },
  { emoji: '', label: { ar: 'استشارة سريعة', en: 'Quick consultation' } },
  { emoji: '', label: { ar: 'أولوية الحجز', en: 'Booking priority' } },
];

export function BeautyConciergeCard({
  conciergeName = 'سارة',
  onChat,
  onCall,
  className = '',
  title = 'مرشدة الجمال الخاصة',
  subtitle = 'مرشدتكِ الشخصية للعناية بجمالكِ',
  chatButtonText = 'محادثة',
  callButtonText = 'اتصال',
  quoteText = '“دللي نفسكِ — ونحن نتولى الباقي”',
  locale = 'ar',
}: BeautyConciergeCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-amber-900 dark:from-amber-950 dark:to-yellow-950',
        className,
      )}
    >
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-yellow-200 text-3xl dark:from-amber-800 dark:to-yellow-800">
          ‍
        </div>
        <h4 className="mt-2 text-sm font-bold text-amber-800 dark:text-amber-200">{title}</h4>
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          {conciergeName} — {subtitle}
        </p>
      </div>

      {/* Services */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {SERVICES.map((s) => (
          <div
            key={s.label.ar}
            className="flex items-center gap-2 rounded-xl bg-white/60 px-2.5 py-2 dark:bg-gray-800/60"
          >
            <span className="text-sm" aria-hidden="true">
              {s.emoji}
            </span>
            <span className="text-[10px] font-medium text-amber-800 dark:text-amber-200">
              {s.label[locale]}
            </span>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onChat}
          className="flex-1 rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white hover:bg-amber-700 active:scale-[0.98] transition-all"
        >
          {chatButtonText}
        </button>
        <button
          type="button"
          onClick={onCall}
          className="rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:bg-gray-800 dark:text-amber-300"
        >
          {callButtonText}
        </button>
      </div>

      <p className="mt-2 text-center text-[9px] text-amber-600 dark:text-amber-400">{quoteText}</p>
    </div>
  );
}
