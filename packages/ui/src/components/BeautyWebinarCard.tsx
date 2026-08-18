'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Webinar Card — live online beauty education sessions.
 * From Phase W6: Education & Empowerment — Galaxy Beauty Academy.
 *
 * Usage:
 *   <BeautyWebinarCard
 *     webinar={{ title: 'أساسيات المكياج', instructor: 'نورة', date: '20 أغسطس' }}
 *   />
 */

interface Webinar {
  title: string;
  instructor: string;
  date: string;
  time?: string;
  registered?: number;
  maxSeats?: number;
  isFree?: boolean;
  topic?: string;
}

interface BeautyWebinarCardProps {
  webinar: Webinar;
  onRegister?: () => void;
  className?: string;
  freeBadgeText?: string;
  dateLabel?: string;
  timeLabel?: string;
  defaultTime?: string;
  registeredCountText?: string;
  fullText?: string;
  registerText?: string;
  footerText?: string;
}

export function BeautyWebinarCard({
  webinar,
  onRegister,
  className = '',
  freeBadgeText = 'مجاني',
  dateLabel = 'التاريخ',
  timeLabel = 'الوقت',
  defaultTime = '8:00 مساءً',
  registeredCountText = 'مسجلة',
  fullText = 'اكتمل التسجيل',
  registerText = 'سجّلي الآن ',
  footerText = 'تعلمي من خبيرات الجمال — مباشر وتفاعلي',
}: BeautyWebinarCardProps): JSX.Element {
  const isFull =
    webinar.maxSeats !== undefined &&
    webinar.registered !== undefined &&
    webinar.registered >= webinar.maxSeats;

  return (
    <div
      className={cn(
        'rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 text-xl dark:from-indigo-900 dark:to-blue-900"></div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
            {webinar.title}
          </h4>
          <p className="text-[10px] text-text-tertiary dark:text-gray-500">
            ‍ {webinar.instructor}
            {webinar.topic && ` · ${webinar.topic}`}
          </p>
        </div>
        {webinar.isFree && (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            {freeBadgeText}
          </span>
        )}
      </div>

      {/* Schedule */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-indigo-50 p-2.5 text-center dark:bg-indigo-950">
          <p className="text-[9px] text-indigo-600 dark:text-indigo-400">{dateLabel}</p>
          <p className="text-xs font-bold text-indigo-800 dark:text-indigo-200">{webinar.date}</p>
        </div>
        <div className="rounded-xl bg-indigo-50 p-2.5 text-center dark:bg-indigo-950">
          <p className="text-[9px] text-indigo-600 dark:text-indigo-400">{timeLabel}</p>
          <p className="text-xs font-bold text-indigo-800 dark:text-indigo-200">
            {webinar.time || defaultTime}
          </p>
        </div>
      </div>

      {/* Seats */}
      {webinar.registered !== undefined && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-text-tertiary dark:text-gray-500">
              {webinar.registered} {registeredCountText}
              {webinar.maxSeats && ` / ${webinar.maxSeats}`}
            </span>
          </div>
          {webinar.maxSeats && (
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-blue-500 transition-all"
                style={{ width: `${Math.round((webinar.registered / webinar.maxSeats) * 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={onRegister}
        disabled={isFull}
        className={cn(
          'mt-3 w-full rounded-xl py-2 text-xs font-bold transition-all active:scale-[0.98]',
          isFull
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
            : 'bg-indigo-600 text-white hover:bg-indigo-700',
        )}
      >
        {isFull ? fullText : registerText}
      </button>

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}
