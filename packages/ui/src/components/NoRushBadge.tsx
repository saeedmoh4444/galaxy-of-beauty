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
}

export function NoRushBadge({
  bufferMinutes = 15,
  salonName,
  hasRefreshments = true,
  className = '',
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
        <span className="text-xl" aria-hidden="true">⏰</span>
        <div>
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">
            بدون استعجال
          </h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">
            خذي وقتكِ — {bufferMinutes} دقيقة إضافية بعد كل موعد
          </p>
        </div>
        <span className="ml-auto rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
          🧘 مريح
        </span>
      </div>

      {/* Policy explanation */}
      <div className="mt-3 space-y-2">
        {[
          {
            emoji: '⏱️',
            title: `${bufferMinutes} دقيقة إضافية`,
            description: 'نضيف وقتاً إضافياً بين المواعيد حتى لا تشعري بالاستعجال',
          },
          {
            emoji: '☕',
            title: hasRefreshments ? 'مشروبات مجانية' : 'بيئة مريحة',
            description: hasRefreshments
              ? 'قهوة عربية، كرك، شاي أعشاب — مجاناً مع كل خدمة'
              : 'أجواء هادئة ومريحة لتستمتعي بوقتكِ',
          },
          {
            emoji: '📱',
            title: 'شاحن جوال',
            description: 'شاحن متوفر في كل محطة — لا داعي للقلق على بطاريتكِ',
          },
          {
            emoji: '💆‍♀️',
            title: 'لا داعي للعجلة',
            description: 'استرخي بعد الخدمة — لا نطلب منكِ المغادرة فوراً',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-2 rounded-lg bg-teal-50 p-2.5 dark:bg-teal-950"
          >
            <span className="text-sm shrink-0" aria-hidden="true">{item.emoji}</span>
            <div>
              <p className="text-[10px] font-bold text-teal-800 dark:text-teal-200">
                {item.title}
              </p>
              <p className="text-[10px] text-teal-600 dark:text-teal-400">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Salon name */}
      {salonName && (
        <div className="mt-2 rounded-lg bg-teal-50 p-2 text-center dark:bg-teal-950">
          <p className="text-[10px] text-teal-700 dark:text-teal-300">
            💚 {salonName} — راحتكِ أولاً
          </p>
        </div>
      )}

      {/* Footer */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        🧘 جمالكِ يستحق وقتكِ — لا تستعجلي
      </p>
    </div>
  );
}
