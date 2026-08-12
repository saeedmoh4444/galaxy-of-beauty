'use client';

import { cn } from '@galaxy/shared';

/**
 * Technician CRM Card — mini customer relationship dashboard for technicians.
 * From Phase W5: Financial Empowerment — Technician Entrepreneurship.
 *
 * Usage:
 *   <TechnicianCRMCard
 *     customers={{ total: 45, regulars: 18, newThisMonth: 5 }}
 *   />
 */

interface CRMMetrics {
  total: number;
  regulars: number;
  newThisMonth: number;
}

interface TechnicianCRMCardProps {
  customers: CRMMetrics;
  revenueThisMonth?: number;
  avgRating?: number;
  className?: string;
}

export function TechnicianCRMCard({
  customers,
  revenueThisMonth,
  avgRating,
  className = '',
}: TechnicianCRMCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-blue-100 bg-white p-4 dark:border-blue-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          ‍
        </span>
        <div>
          <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300">زبوناتي</h4>
          <p className="text-[10px] text-blue-500 dark:text-blue-400">
            لوحة تحكم مصغرة لإدارة زبوناتكِ
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-blue-50 p-2.5 text-center dark:bg-blue-950">
          <p className="text-lg font-bold text-blue-800 dark:text-blue-200">{customers.total}</p>
          <p className="text-[9px] text-blue-600 dark:text-blue-400">كل الزبونات</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-2.5 text-center dark:bg-emerald-950">
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
            {customers.regulars}
          </p>
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">دائمات</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-2.5 text-center dark:bg-amber-950">
          <p className="text-lg font-bold text-amber-800 dark:text-amber-200">
            +{customers.newThisMonth}
          </p>
          <p className="text-[9px] text-amber-600 dark:text-amber-400">جديدات</p>
        </div>
      </div>

      {/* Additional metrics */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        {revenueThisMonth !== undefined && (
          <div className="rounded-xl bg-gray-50 p-2.5 text-center dark:bg-gray-800">
            <p className="text-[9px] text-text-tertiary dark:text-gray-500">الإيراد الشهري</p>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              {revenueThisMonth.toLocaleString('ar-SA')} ر.س
            </p>
          </div>
        )}
        {avgRating !== undefined && (
          <div className="rounded-xl bg-gray-50 p-2.5 text-center dark:bg-gray-800">
            <p className="text-[9px] text-text-tertiary dark:text-gray-500">التقييم</p>
            <p className="text-sm font-bold text-amber-700 dark:text-amber-300"> {avgRating}</p>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          { emoji: '', label: 'إرسال عرض' },
          { emoji: '', label: 'تهنئة ميلاد' },
          { emoji: '', label: 'طلب تقييم' },
          { emoji: '', label: 'تقرير كامل' },
        ].map((a) => (
          <button
            key={a.label}
            type="button"
            className="rounded-lg bg-blue-50 py-1.5 text-[10px] font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900 transition-colors"
          >
            {a.emoji} {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
