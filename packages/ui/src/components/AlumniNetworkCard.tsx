'use client';

import { cn } from '@galaxy/shared';

/**
 * Alumni Network Card — graduate network for Galaxy Beauty Academy alumni.
 * From Phase W10: Saudi Women Leadership — "She Leads" Program.
 *
 * Usage:
 *   <AlumniNetworkCard graduates={234} onJoin={() => {}} />
 */

interface AlumniNetworkCardProps {
  graduates: number;
  onJoin?: () => void;
  title?: string;
  graduatesSuffix?: string;
  benefitsLabel?: string;
  item1?: string;
  item2?: string;
  item3?: string;
  item4?: string;
  joinButtonText?: string;
  footerText?: string;
  className?: string;
}

export function AlumniNetworkCard({
  graduates,
  onJoin,
  className = '',
  title = 'شبكة الخريجات',
  graduatesSuffix = 'خريجة',
  benefitsLabel = 'مزايا الشبكة',
  item1 = '• فرص عمل حصرية للخريجات',
  item2 = '• لقاءات سنوية للخريجات',
  item3 = '• خصومات على الدورات المتقدمة',
  item4 = '• إرشاد مهني مستمر',
  joinButtonText = 'انضمي للشبكة',
  footerText = 'التعلم لا ينتهي — والخريجات عائلة',
}: AlumniNetworkCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 p-5 dark:border-purple-900 dark:from-purple-950 dark:to-indigo-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-purple-800 dark:text-purple-200">{title}</h4>
        <p className="text-[10px] text-purple-500 dark:text-purple-400">
          {graduates} {graduatesSuffix}
        </p>
      </div>

      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-purple-800 dark:text-purple-200">
          {benefitsLabel}
        </p>
        <div className="mt-1.5 space-y-0.5 text-[10px] text-purple-700 dark:text-purple-300">
          <p>{item1}</p>
          <p>{item2}</p>
          <p>{item3}</p>
          <p>{item4}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onJoin}
        className="mt-3 w-full rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-700 active:scale-[0.98] transition-all"
      >
        {joinButtonText}
      </button>

      <p className="mt-2 text-center text-[9px] text-purple-500 dark:text-purple-400">
        {footerText}
      </p>
    </div>
  );
}
