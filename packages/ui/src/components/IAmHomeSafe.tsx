'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * I'm Home Safe — post-appointment auto check-in for safety.
 * From Phase W9: Safety Micro-Features.
 *
 * Usage:
 *   <IAmHomeSafe appointmentEnd="21:00" onCheckIn={() => {}} />
 */

interface IAmHomeSafeProps {
  /** When the appointment ended */
  appointmentEnd?: string;
  /** Grace period in minutes before alerting contacts */
  graceMinutes?: number;
  /** Trusted contact who gets alerted if no check-in */
  alertContact?: { name: string; phone: string };
  onCheckIn?: () => void;
  className?: string;
}

export function IAmHomeSafe({
  appointmentEnd,
  graceMinutes = 30,
  alertContact,
  onCheckIn,
  className = '',
}: IAmHomeSafeProps): JSX.Element {
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckIn = () => {
    setCheckedIn(true);
    onCheckIn?.();
  };

  // Countdown text (simplified — would be real-time in production)
  const getAlertTime = () => {
    if (!appointmentEnd) return `${graceMinutes} دقيقة`;
    const [h, m] = appointmentEnd.split(':').map(Number);
    if (h === undefined || m === undefined) return `${graceMinutes} دقيقة`;
    let totalMin = h * 60 + m + graceMinutes;
    const alertH = Math.floor(totalMin / 60) % 24;
    const alertM = totalMin % 60;
    return `${String(alertH).padStart(2, '0')}:${String(alertM).padStart(2, '0')}`;
  };

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 transition-all',
        checkedIn
          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30'
          : 'border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30',
        className,
      )}
    >
      {/* Status */}
      <div className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden="true">
          {checkedIn ? '✅' : '🏠'}
        </span>
        <div>
          <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">
            {checkedIn ? 'وصلتِ للمنزل بأمان' : 'تأكيد الوصول للمنزل'}
          </h4>
          <p className="text-[10px] text-text-tertiary dark:text-gray-400">
            {checkedIn
              ? 'الحمد لله على سلامتِك — تم إشعار جهة الاتصال'
              : `سيتم إشعار جهة اتصالكِ إذا لم تؤكدي وصولكِ قبل ${getAlertTime()}`
            }
          </p>
        </div>
      </div>

      {/* Check-in button */}
      {!checkedIn && (
        <button
          type="button"
          onClick={handleCheckIn}
          className="mt-3 w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm shadow-emerald-200 dark:shadow-emerald-900"
        >
          ✅ وصلت للمنزل بأمان
        </button>
      )}

      {/* Checked-in state */}
      {checkedIn && (
        <div className="mt-3 space-y-2">
          <div className="rounded-xl bg-emerald-100 p-3 text-center dark:bg-emerald-900">
            <p className="text-lg" aria-hidden="true">🤲</p>
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
              الحمد لله على سلامتِك
            </p>
            <p className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
              تم التأكيد — شكراً لاستخدامكِ جالاكسي بيوتي
            </p>
          </div>

          {/* Rate experience */}
          <button
            type="button"
            className="w-full rounded-xl border border-emerald-200 bg-white py-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-gray-800 dark:text-emerald-300"
          >
            ⭐ قيّمي تجربتكِ
          </button>
        </div>
      )}

      {/* Alert contact info */}
      {alertContact && !checkedIn && (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-white/60 p-2 dark:bg-black/20">
          <span className="text-xs" aria-hidden="true">📞</span>
          <span className="text-[10px] text-text-secondary dark:text-gray-300">
            سيتم إشعار {alertContact.name} ({alertContact.phone}) إذا لم تؤكدي وصولكِ
          </span>
        </div>
      )}

      {/* Timer indicator */}
      {!checkedIn && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-[9px] text-text-tertiary dark:text-gray-500">
            <span>⏰ وقت التأكيد المتبقي</span>
            <span>{graceMinutes} دقيقة</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/60 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-1000"
              style={{ width: `${(graceMinutes / graceMinutes) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
