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
  className?: string;
}

export function AlumniNetworkCard({ graduates, onJoin, className = '' }: AlumniNetworkCardProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 p-5 dark:border-purple-900 dark:from-purple-950 dark:to-indigo-950', className)}>
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">🎓</span>
        <h4 className="mt-1 text-sm font-bold text-purple-800 dark:text-purple-200">شبكة الخريجات</h4>
        <p className="text-[10px] text-purple-500 dark:text-purple-400">{graduates} خريجة</p>
      </div>

      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-purple-800 dark:text-purple-200">🤝 مزايا الشبكة</p>
        <div className="mt-1.5 space-y-0.5 text-[10px] text-purple-700 dark:text-purple-300">
          <p>• فرص عمل حصرية للخريجات</p>
          <p>• لقاءات سنوية للخريجات</p>
          <p>• خصومات على الدورات المتقدمة</p>
          <p>• إرشاد مهني مستمر</p>
        </div>
      </div>

      <button type="button" onClick={onJoin} className="mt-3 w-full rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-700 active:scale-[0.98] transition-all">
        انضمي للشبكة 🎓
      </button>

      <p className="mt-2 text-center text-[9px] text-purple-500 dark:text-purple-400">🎓 التعلم لا ينتهي — والخريجات عائلة</p>
    </div>
  );
}
