'use client';

import { cn } from '@galaxy/shared';

/**
 * Annual Summit Card — Women in Beauty Leadership Summit announcement.
 * From Phase W10: Saudi Women Leadership — Annual Summit.
 *
 * Usage:
 *   <AnnualSummitCard
 *     year={2027}
 *     speakers={['د. نورة', 'م. سارة']}
 *     onRegister={() => {}}
 *   />
 */

interface SummitSpeaker {
  name: string;
  title: string;
  emoji?: string;
}

interface AnnualSummitCardProps {
  year?: number;
  city?: string;
  date?: string;
  speakers?: SummitSpeaker[];
  attendees?: number;
  earlyBirdPrice?: number;
  onRegister?: () => void;
  onSponsor?: () => void;
  className?: string;
}

export function AnnualSummitCard({
  year = 2027,
  city = 'الرياض',
  date = '8-9 مارس',
  speakers = [],
  attendees,
  earlyBirdPrice = 499,
  onRegister,
  onSponsor,
  className = '',
}: AnnualSummitCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-amber-900 dark:from-amber-950 dark:to-yellow-950',
        className,
      )}
    >
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-yellow-200 text-2xl dark:from-amber-800 dark:to-yellow-800">
          🏆
        </div>
        <h4 className="mt-2 text-sm font-bold text-amber-800 dark:text-amber-200">
          ملتقى المرأة في الجمال
        </h4>
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          النسخة السنوية {year}
        </p>
      </div>

      {/* Event details */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">المدينة</p>
          <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
            📍 {city}
          </p>
        </div>
        <div className="rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">التاريخ</p>
          <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
            📅 {date}
          </p>
        </div>
      </div>

      {/* Topics */}
      <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200">
          🎤 محاور الملتقى
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {['ريادة الأعمال', 'تقنيات التجميل', 'الاستدامة', 'التمكين المالي', 'الصحة والجمال', 'التسويق الرقمي'].map((t) => (
            <span
              key={t}
              className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Speakers */}
      {speakers.length > 0 && (
        <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
          <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200">
            🎙️ متحدثات
          </p>
          <div className="mt-1.5 space-y-1.5">
            {speakers.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-200 text-xs dark:bg-amber-800">
                  {s.emoji || '👩'}
                </span>
                <div>
                  <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
                    {s.name}
                  </p>
                  <p className="text-[9px] text-text-tertiary dark:text-gray-500">
                    {s.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendees */}
      {attendees && (
        <div className="mt-2 rounded-lg bg-white/60 p-2 text-center dark:bg-gray-800/60">
          <p className="text-[10px] text-amber-700 dark:text-amber-300">
            🎟️ {attendees.toLocaleString('ar-SA')} سيدة مسجلة حتى الآن
          </p>
        </div>
      )}

      {/* Pricing + CTA */}
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">
            🐦 الحجز المبكر
          </p>
          <p className="text-lg font-bold text-amber-800 dark:text-amber-200">
            {earlyBirdPrice} ر.س
          </p>
        </div>
        <button
          type="button"
          onClick={onRegister}
          className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2.5 text-xs font-bold text-white hover:from-amber-600 hover:to-yellow-600 active:scale-[0.98] transition-all shadow-sm"
        >
          سجّلي الآن 🎟️
        </button>
      </div>

      {/* Sponsor CTA */}
      <button
        type="button"
        onClick={onSponsor}
        className="mt-2 w-full rounded-lg border border-amber-200 bg-white/60 py-1.5 text-[10px] font-medium text-amber-700 hover:bg-white dark:border-amber-800 dark:bg-gray-800/60 dark:text-amber-300"
      >
        🤝 راعي الملتقى
      </button>

      <p className="mt-2 text-center text-[9px] text-amber-600 dark:text-amber-400">
        👑 معاً نبني مستقبل المرأة السعودية في قطاع التجميل
      </p>
    </div>
  );
}
