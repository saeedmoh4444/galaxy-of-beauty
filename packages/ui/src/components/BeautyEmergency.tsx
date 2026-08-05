'use client';

/**
 * Beauty Emergency — quick-booking for urgent beauty needs.
 * From Phase W9: Safety Micro-Features — "Emergency Beauty Fund".
 *
 * Usage:
 *   <BeautyEmergency onBook={() => router.push('/emergency-booking')} />
 */

const EMERGENCIES = [
  { emoji: '💼', label: 'مقابلة عمل غداً' },
  { emoji: '👰', label: 'مناسبة مفاجئة' },
  { emoji: '📸', label: 'جلسة تصوير' },
  { emoji: '🎉', label: 'حفلة الليلة' },
  { emoji: '😢', label: 'يوم سيء — أحتاج عناية' },
];

interface BeautyEmergencyProps {
  onBook: (reason: string) => void;
  className?: string;
}

export function BeautyEmergency({ onBook, className = '' }: BeautyEmergencyProps): JSX.Element {
  return (
    <div className={`rounded-2xl border-2 border-pink-200 bg-pink-50 p-5 dark:border-pink-800 dark:bg-pink-950 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">🚨</span>
        <div>
          <h3 className="text-sm font-bold text-pink-800 dark:text-pink-200">طوارئ التجميل</h3>
          <p className="text-xs text-pink-600 dark:text-pink-400">احجزي خلال ساعة — نصل إليكِ أينما كنتِ</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {EMERGENCIES.map((e, i) => (
          <button
            key={i}
            onClick={() => onBook(e.label)}
            className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-pink-700 shadow-sm transition-all hover:bg-pink-100 active:scale-95 dark:bg-pink-900 dark:text-pink-200 dark:hover:bg-pink-800"
          >
            {e.emoji} {e.label}
          </button>
        ))}
      </div>
    </div>
  );
}
