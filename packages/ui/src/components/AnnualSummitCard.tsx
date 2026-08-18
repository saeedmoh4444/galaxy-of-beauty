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
  /** Title of the summit */
  title?: string;
  /** Label prefixing the edition year, e.g. 'Annual edition {year}' */
  editionLabel?: string;
  /** Label for the city field */
  cityLabel?: string;
  /** Label for the date field */
  dateLabel?: string;
  /** Label for the topics section */
  topicsLabel?: string;
  /** Label for the speakers section */
  speakersLabel?: string;
  /** Text following the attendees count */
  attendeesLabel?: string;
  /** Label for the early-bird pricing block */
  earlyBirdLabel?: string;
  /** Currency suffix displayed after prices */
  currencySuffix?: string;
  /** Register call-to-action label */
  registerLabel?: string;
  /** Sponsor call-to-action label */
  sponsorLabel?: string;
  /** Footer pledge text */
  footerText?: string;
  /** Locale for internal sample data strings */
  locale?: 'ar' | 'en';
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
  title = 'ملتقى المرأة في الجمال',
  editionLabel = 'النسخة السنوية',
  cityLabel = 'المدينة',
  dateLabel = 'التاريخ',
  topicsLabel = ' محاور الملتقى',
  speakersLabel = '️ متحدثات',
  attendeesLabel = ' سيدة مسجلة حتى الآن',
  earlyBirdLabel = ' الحجز المبكر',
  currencySuffix = 'ر.س',
  registerLabel = 'سجّلي الآن ️',
  sponsorLabel = 'راعي الملتقى',
  footerText = 'معاً نبني مستقبل المرأة السعودية في قطاع التجميل',
  locale = 'ar',
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
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-yellow-200 text-2xl dark:from-amber-800 dark:to-yellow-800"></div>
        <h4 className="mt-2 text-sm font-bold text-amber-800 dark:text-amber-200">{title}</h4>
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          {editionLabel} {year}
        </p>
      </div>

      {/* Event details */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{cityLabel}</p>
          <p className="text-xs font-bold text-amber-800 dark:text-amber-200"> {city}</p>
        </div>
        <div className="rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{dateLabel}</p>
          <p className="text-xs font-bold text-amber-800 dark:text-amber-200"> {date}</p>
        </div>
      </div>

      {/* Topics */}
      <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200">{topicsLabel}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {[
            { ar: 'ريادة الأعمال', en: 'Entrepreneurship' },
            { ar: 'تقنيات التجميل', en: 'Beauty Technology' },
            { ar: 'الاستدامة', en: 'Sustainability' },
            { ar: 'التمكين المالي', en: 'Financial Empowerment' },
            { ar: 'الصحة والجمال', en: 'Health & Beauty' },
            { ar: 'التسويق الرقمي', en: 'Digital Marketing' },
          ].map((t) => (
            <span
              key={t.ar}
              className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300"
            >
              {t[locale]}
            </span>
          ))}
        </div>
      </div>

      {/* Speakers */}
      {speakers.length > 0 && (
        <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
          <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200">
            {speakersLabel}
          </p>
          <div className="mt-1.5 space-y-1.5">
            {speakers.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-200 text-xs dark:bg-amber-800">
                  {s.emoji || ''}
                </span>
                <div>
                  <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
                    {s.name}
                  </p>
                  <p className="text-[9px] text-text-tertiary dark:text-gray-500">{s.title}</p>
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
            ️ {attendees.toLocaleString('ar-SA')}
            {attendeesLabel}
          </p>
        </div>
      )}

      {/* Pricing + CTA */}
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{earlyBirdLabel}</p>
          <p className="text-lg font-bold text-amber-800 dark:text-amber-200">
            {earlyBirdPrice} {currencySuffix}
          </p>
        </div>
        <button
          type="button"
          onClick={onRegister}
          className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2.5 text-xs font-bold text-white hover:from-amber-600 hover:to-yellow-600 active:scale-[0.98] transition-all shadow-sm"
        >
          {registerLabel}
        </button>
      </div>

      {/* Sponsor CTA */}
      <button
        type="button"
        onClick={onSponsor}
        className="mt-2 w-full rounded-lg border border-amber-200 bg-white/60 py-1.5 text-[10px] font-medium text-amber-700 hover:bg-white dark:border-amber-800 dark:bg-gray-800/60 dark:text-amber-300"
      >
        {sponsorLabel}
      </button>

      <p className="mt-2 text-center text-[9px] text-amber-600 dark:text-amber-400">{footerText}</p>
    </div>
  );
}
