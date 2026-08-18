'use client';

import { cn } from '@galaxy/shared';

/**
 * No Rush Badge — signals "take your time" no-rush salon policy.
 * From Phase W9: The Small Details — Thoughtful Touches.
 *
 * Usage:
 *   <NoRushBadge bufferMinutes={15} />
 */

interface NoRushBadgeProps {
  /** Extra buffer minutes after each appointment */
  bufferMinutes?: number;
  /** Salon name */
  salonName?: string;
  /** Whether complimentary tea/coffee is offered */
  hasRefreshments?: boolean;
  className?: string;
  /** Badge heading */
  title?: string;
  /** Prefix before the buffer minutes */
  takeYourTimePrefix?: string;
  /** Suffix after the buffer minutes */
  bufferSuffix?: string;
  /** Comfort badge text */
  comfortBadgeText?: string;
  /** Text after the salon name */
  comfortFirstText?: string;
  /** Footer text */
  footerText?: string;
  /** Display locale for policy item labels */
  locale?: 'ar' | 'en';
}

export function NoRushBadge({
  bufferMinutes = 15,
  salonName,
  hasRefreshments = true,
  className = '',
  title = 'بدون استعجال',
  takeYourTimePrefix = 'خذي وقتكِ — ',
  bufferSuffix = 'دقيقة إضافية بعد كل موعد',
  comfortBadgeText = 'مريح',
  comfortFirstText = 'راحتكِ أولاً',
  footerText = 'جمالكِ يستحق وقتكِ — لا تستعجلي',
  locale = 'ar',
}: NoRushBadgeProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">{title}</h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">
            {takeYourTimePrefix}
            {bufferMinutes} {bufferSuffix}
          </p>
        </div>
        <span className="ml-auto rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
          {comfortBadgeText}
        </span>
      </div>

      {/* Policy explanation */}
      <div className="mt-3 space-y-2">
        {[
          {
            emoji: '️',
            title: {
              ar: `${bufferMinutes} دقيقة إضافية`,
              en: `${bufferMinutes} extra minutes`,
            },
            description: {
              ar: 'نضيف وقتاً إضافياً بين المواعيد حتى لا تشعري بالاستعجال',
              en: 'We add extra time between appointments so you never feel rushed',
            },
          },
          {
            emoji: '',
            title: hasRefreshments
              ? { ar: 'مشروبات مجانية', en: 'Free drinks' }
              : { ar: 'بيئة مريحة', en: 'Comfortable environment' },
            description: hasRefreshments
              ? {
                  ar: 'قهوة عربية، كرك، شاي أعشاب — مجاناً مع كل خدمة',
                  en: 'Arabic coffee, karak, herbal tea — free with every service',
                }
              : {
                  ar: 'أجواء هادئة ومريحة لتستمتعي بوقتكِ',
                  en: 'A calm, comfortable atmosphere to enjoy your time',
                },
          },
          {
            emoji: '',
            title: { ar: 'شاحن جوال', en: 'Phone charger' },
            description: {
              ar: 'شاحن متوفر في كل محطة — لا داعي للقلق على بطاريتكِ',
              en: 'A charger at every station — no need to worry about your battery',
            },
          },
          {
            emoji: '‍️',
            title: { ar: 'لا داعي للعجلة', en: 'No need to hurry' },
            description: {
              ar: 'استرخي بعد الخدمة — لا نطلب منكِ المغادرة فوراً',
              en: 'Relax after your service — we never ask you to leave right away',
            },
          },
        ].map((item) => (
          <div
            key={item.title.ar}
            className="flex items-start gap-2 rounded-lg bg-teal-50 p-2.5 dark:bg-teal-950"
          >
            <span className="text-sm shrink-0" aria-hidden="true">
              {item.emoji}
            </span>
            <div>
              <p className="text-[10px] font-bold text-teal-800 dark:text-teal-200">
                {item.title[locale]}
              </p>
              <p className="text-[10px] text-teal-600 dark:text-teal-400">
                {item.description[locale]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Salon name */}
      {salonName && (
        <div className="mt-2 rounded-lg bg-teal-50 p-2 text-center dark:bg-teal-950">
          <p className="text-[10px] text-teal-700 dark:text-teal-300">
            {salonName} — {comfortFirstText}
          </p>
        </div>
      )}

      {/* Footer */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}
