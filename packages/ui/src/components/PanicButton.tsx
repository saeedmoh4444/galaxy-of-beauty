'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Panic Button — in-app emergency button alerts trusted contact + authorities.
 * From Phase W9: Safety Micro-Features.
 *
 * Usage:
 *   <PanicButton contacts={[{ name: 'أمي', phone: '055...' }]} />
 */

interface EmergencyContact {
  name: string;
  phone: string;
  relation?: string;
}

interface PanicButtonProps {
  contacts: EmergencyContact[];
  /** Current appointment address */
  address?: string;
  /** Technician name */
  technicianName?: string;
  onActivate?: () => void;
  className?: string;
  /** Idle-state button title */
  title?: string;
  /** Idle-state button description */
  idleDescription?: string;
  /** Confirmation-state heading */
  confirmTitle?: string;
  /** Confirmation-state description */
  confirmDescription?: string;
  /** "Will be notified" label */
  willNotifyLabel?: string;
  /** Police row label */
  policeLabel?: string;
  /** Prefix before the address */
  locationPrefix?: string;
  /** Prefix before the technician name */
  technicianPrefix?: string;
  /** Confirm-send button label */
  confirmButtonText?: string;
  /** Cancel button label */
  cancelButtonText?: string;
  /** Activated-state heading */
  activatedTitle?: string;
  /** Prefix before the notified contacts count */
  notifiedPrefix?: string;
  /** Suffix after the notified contacts count */
  notifiedSuffix?: string;
  /** Done-state heading */
  doneTitle?: string;
  /** Done-state description */
  doneDescription?: string;
  /** Done-state button label */
  doneButtonText?: string;
}

export function PanicButton({
  contacts,
  address,
  technicianName,
  onActivate,
  className = '',
  title = 'زر الطوارئ',
  idleDescription = 'اضغطي في حالة الطوارئ — سيتم إشعار جهات اتصالكِ فوراً',
  confirmTitle = 'تأكيد الطوارئ',
  confirmDescription = 'سيتم إرسال موقعكِ الحالي إلى جهات اتصالكِ',
  willNotifyLabel = 'سيتم إشعار',
  policeLabel = 'الشرطة',
  locationPrefix = ' الموقع: ',
  technicianPrefix = '‍ الخبيرة: ',
  confirmButtonText = 'نعم، إرسال الطوارئ 🆘',
  cancelButtonText = 'إلغاء',
  activatedTitle = 'تم إرسال الطوارئ!',
  notifiedPrefix = 'تم إشعار ',
  notifiedSuffix = ' جهات اتصال بموقعكِ الحالي',
  doneTitle = 'المساعدة في الطريق',
  doneDescription = 'جهات الاتصال تم إشعارها. ابقِي في مكان آمن.',
  doneButtonText = 'تم — أنا بأمان الآن',
}: PanicButtonProps): JSX.Element {
  const [stage, setStage] = useState<'idle' | 'confirm' | 'activated' | 'done'>('idle');
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handlePress = () => {
    if (stage === 'idle') {
      setStage('confirm');
      setCountdown(3);
      return;
    }
  };

  const handleConfirm = () => {
    setStage('activated');
    onActivate?.();

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setStage('done');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCancel = () => {
    setStage('idle');
    setCountdown(3);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 transition-all',
        stage === 'activated'
          ? 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950'
          : stage === 'done'
            ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950'
            : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900',
        className,
      )}
    >
      {/* Idle state */}
      {stage === 'idle' && (
        <button
          type="button"
          onClick={handlePress}
          className="flex w-full items-center gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-4 text-left transition-all hover:border-red-300 hover:bg-red-100 active:scale-[0.98] dark:border-red-900 dark:bg-red-950 dark:hover:bg-red-900"
        >
          <span className="text-2xl shrink-0" aria-hidden="true">
            🆘
          </span>
          <div>
            <p className="text-sm font-bold text-red-700 dark:text-red-300">{title}</p>
            <p className="text-[10px] text-red-500 dark:text-red-400">{idleDescription}</p>
          </div>
        </button>
      )}

      {/* Confirmation state */}
      {stage === 'confirm' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true"></span>
            <div>
              <p className="text-sm font-bold text-red-700 dark:text-red-300">{confirmTitle}</p>
              <p className="text-[10px] text-red-500 dark:text-red-400">{confirmDescription}</p>
            </div>
          </div>

          {/* Who will be notified */}
          <div className="rounded-xl bg-white p-2.5 dark:bg-gray-800">
            <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
              {willNotifyLabel}
            </p>
            <div className="mt-1 space-y-1">
              {contacts.map((c) => (
                <div
                  key={c.phone}
                  className="flex items-center gap-1.5 text-[10px] text-text-secondary dark:text-gray-300"
                >
                  <span>{c.relation === 'mother' ? '' : ''}</span>
                  <span className="font-bold">{c.name}</span>
                  <span className="text-text-tertiary">{c.phone}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 text-[10px] text-text-secondary dark:text-gray-300">
                <span></span>
                <span className="font-bold">{policeLabel}</span>
                <span className="text-text-tertiary">999</span>
              </div>
            </div>
          </div>

          {/* Address context */}
          {address && (
            <p className="text-[10px] text-red-600 dark:text-red-400">
              {locationPrefix}
              {address}
            </p>
          )}
          {technicianName && (
            <p className="text-[10px] text-red-600 dark:text-red-400">
              {technicianPrefix}
              {technicianName}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 active:scale-[0.98] transition-all"
            >
              {confirmButtonText}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {cancelButtonText}
            </button>
          </div>
        </div>
      )}

      {/* Activated state */}
      {stage === 'activated' && (
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <span className="text-3xl animate-pulse" aria-hidden="true"></span>
          </div>
          <div>
            <p className="text-sm font-bold text-red-700 dark:text-red-300">{activatedTitle}</p>
            <p className="text-[10px] text-red-500 dark:text-red-400">
              {notifiedPrefix}
              {contacts.length + 1}
              {notifiedSuffix}
            </p>
          </div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">{countdown}</div>
        </div>
      )}

      {/* Done state */}
      {stage === 'done' && (
        <div className="text-center space-y-2">
          <span className="text-3xl" aria-hidden="true"></span>
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{doneTitle}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">{doneDescription}</p>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-xl bg-emerald-600 px-4 py-1.5 text-[10px] font-bold text-white"
          >
            {doneButtonText}
          </button>
        </div>
      )}
    </div>
  );
}
