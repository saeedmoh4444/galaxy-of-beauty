'use client';

/**
 * Beauty Emergency — quick-booking for urgent beauty needs.
 * From Phase W9: Safety Micro-Features — "Emergency Beauty Fund".
 *
 * Usage:
 *   <BeautyEmergency onBook={() => router.push('/emergency-booking')} />
 */

const EMERGENCIES = [
  { emoji: '', label: { ar: 'مقابلة عمل غداً', en: 'Job interview tomorrow' } },
  { emoji: '', label: { ar: 'مناسبة مفاجئة', en: 'Surprise occasion' } },
  { emoji: '', label: { ar: 'جلسة تصوير', en: 'Photo shoot' } },
  { emoji: '', label: { ar: 'حفلة الليلة', en: 'Party tonight' } },
  { emoji: '', label: { ar: 'يوم سيء — أحتاج عناية', en: 'Bad day — I need pampering' } },
];

interface BeautyEmergencyProps {
  onBook: (reason: string) => void;
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
}

export function BeautyEmergency({
  onBook,
  className = '',
  locale = 'ar',
  title = 'طوارئ التجميل',
  subtitle = 'احجزي خلال ساعة — نصل إليكِ أينما كنتِ',
}: BeautyEmergencyProps): JSX.Element {
  return (
    <div
      className={`rounded-2xl border-2 border-pink-200 bg-pink-50 p-5 dark:border-pink-800 dark:bg-pink-950 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl"></span>
        <div>
          <h3 className="text-sm font-bold text-pink-800 dark:text-pink-200">{title}</h3>
          <p className="text-xs text-pink-600 dark:text-pink-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {EMERGENCIES.map((e, i) => (
          <button
            key={i}
            onClick={() => onBook(e.label[locale])}
            className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-pink-700 shadow-sm transition-all hover:bg-pink-100 active:scale-95 dark:bg-pink-900 dark:text-pink-200 dark:hover:bg-pink-800"
          >
            {e.emoji} {e.label[locale]}
          </button>
        ))}
      </div>
    </div>
  );
}
