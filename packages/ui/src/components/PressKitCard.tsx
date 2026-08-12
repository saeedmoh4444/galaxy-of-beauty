'use client';

import { cn } from '@galaxy/shared';

/**
 * Press Kit Card — media press kit with brand assets for journalists.
 * From Phase W10: Saudi Women Leadership.
 *
 * Usage:
 *   <PressKitCard onDownload={() => {}} />
 */

interface PressKitCardProps {
  onDownload?: () => void;
  className?: string;
}

const KIT_ITEMS = [
  { emoji: '️', label: 'شعار المنصة', format: 'PNG, SVG' },
  { emoji: '', label: 'صور عالية الدقة', format: '10 صور' },
  { emoji: '', label: 'البيان الصحفي', format: 'PDF' },
  { emoji: '', label: 'إحصائيات وأرقام', format: 'PDF' },
  { emoji: '‍', label: 'صور المؤسسات', format: '5 صور' },
  { emoji: '', label: 'دليل الهوية البصرية', format: 'PDF' },
];

export function PressKitCard({ onDownload, className = '' }: PressKitCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-sky-100 bg-white p-4 dark:border-sky-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          
        </span>
        <div>
          <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">الملف الصحفي</h4>
          <p className="text-[10px] text-sky-500 dark:text-sky-400">
            كل ما يحتاجه الإعلام للكتابة عنا
          </p>
        </div>
      </div>

      {/* Kit items */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {KIT_ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-2 rounded-lg bg-sky-50 px-2.5 py-2 dark:bg-sky-950"
          >
            <span className="text-sm shrink-0" aria-hidden="true">
              {item.emoji}
            </span>
            <div>
              <p className="text-[10px] font-bold text-sky-800 dark:text-sky-200">{item.label}</p>
              <p className="text-[9px] text-sky-600 dark:text-sky-400">{item.format}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onDownload}
        className="mt-3 w-full rounded-xl bg-sky-600 py-2 text-xs font-bold text-white hover:bg-sky-700 active:scale-[0.98] transition-all"
      >
         تحميل الملف الصحفي
      </button>

      <p className="mt-1.5 text-center text-[9px] text-sky-500 dark:text-sky-400">
         للإعلام والصحافة — للتواصل: press@galaxyofbeauty.com
      </p>
    </div>
  );
}
