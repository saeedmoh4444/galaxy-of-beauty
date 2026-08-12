'use client';

import { cn } from '@galaxy/shared';

/**
 * Media Feature Card — press mentions and media recognition.
 * From Phase W10: Saudi Women Leadership.
 *
 * Usage:
 *   <MediaFeatureCard
 *     feature={{ outlet: 'العربية', title: 'منصة سعودية تمكّن 1000 امرأة', date: '2026-07' }}
 *   />
 */

interface MediaFeature {
  outlet: string;
  title: string;
  date: string;
  type?: 'tv' | 'newspaper' | 'podcast' | 'magazine' | 'online';
}

interface MediaFeatureCardProps {
  feature: MediaFeature;
  onRead?: () => void;
  className?: string;
}

const TYPE_ICONS: Record<string, string> = {
  tv: '',
  newspaper: '',
  podcast: '️',
  magazine: '',
  online: '',
};

export function MediaFeatureCard({
  feature,
  onRead,
  className = '',
}: MediaFeatureCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-sky-100 bg-white p-4 dark:border-sky-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 text-lg dark:from-sky-900 dark:to-blue-900">
          {TYPE_ICONS[feature.type || 'online']}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">ذكرنا في الإعلام</h4>
          <p className="mt-0.5 text-xs font-bold text-text-primary dark:text-gray-100">
            {feature.title}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-text-tertiary dark:text-gray-500">
            <span>
              {TYPE_ICONS[feature.type || 'online']} {feature.outlet}
            </span>
            <span> {feature.date}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onRead}
        className="mt-3 w-full rounded-xl border border-sky-200 py-2 text-[10px] font-bold text-sky-700 hover:bg-sky-50 dark:border-sky-800 dark:text-sky-300 dark:hover:bg-sky-950 transition-colors"
      >
        اقرئي التغطية كاملة 
      </button>

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
         قصتنا تُروى في الإعلام
      </p>
    </div>
  );
}
