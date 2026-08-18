'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Walk Me to Car — request technician escort to vehicle after dark.
 * From Phase W9: Safety Micro-Features.
 *
 * Usage:
 *   <WalkMeToCar appointmentTime="20:30" onRequest={() => {}} />
 */

interface WalkMeToCarProps {
  /** Appointment time in 24h format, e.g. "20:30" */
  appointmentTime?: string;
  /** Whether it's a home service (technician comes to you) */
  isHomeService?: boolean;
  onRequest?: () => void;
  homeServiceTitle?: string;
  carServiceTitle?: string;
  darkSubtitle?: string;
  lightSubtitle?: string;
  escortingTitle?: string;
  escortingSubtitle?: string;
  sendingText?: string;
  homeButtonText?: string;
  carButtonText?: string;
  safeCallText?: string;
  liveLocationText?: string;
  verifiedExpertText?: string;
  className?: string;
}

function isAfterDark(time24?: string): boolean {
  if (!time24) return false;
  const [h] = time24.split(':').map(Number);
  return h !== undefined && (h >= 18 || h <= 5);
}

export function WalkMeToCar({
  appointmentTime,
  isHomeService = false,
  onRequest,
  className = '',
  homeServiceTitle = 'أمان الخدمة المنزلية',
  carServiceTitle = 'توصيل للسيارة',
  darkSubtitle = ' موعد مسائي — سلامتكِ أولاً',
  lightSubtitle = '️ خدمة متاحة في أي وقت تحتاجينها',
  escortingTitle = 'الخبيرة في طريقها لمرافقتكِ',
  escortingSubtitle = 'انتظري لحظة — لا تغادري وحدكِ',
  sendingText = 'جاري إرسال الطلب... الخبيرة ستصل خلال دقيقة',
  homeButtonText = 'شاركي موقعكِ المباشر',
  carButtonText = 'رافقيني للسيارة ‍️',
  safeCallText = ' اتصال آمن',
  liveLocationText = ' موقع مباشر',
  verifiedExpertText = ' خبيرة موثقة',
}: WalkMeToCarProps): JSX.Element {
  const [requested, setRequested] = useState(false);
  const [escorting, setEscorting] = useState(false);

  const isDark = isAfterDark(appointmentTime);

  const handleRequest = () => {
    setRequested(true);
    onRequest?.();
    // Simulate escort arriving
    setTimeout(() => {
      setEscorting(true);
      setTimeout(() => {
        setRequested(false);
        setEscorting(false);
      }, 3000);
    }, 2000);
  };

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 transition-all',
        isDark
          ? 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-900 dark:bg-indigo-950/30'
          : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900',
        className,
      )}
    >
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <span className="text-xl" aria-hidden="true">
            {isHomeService ? '' : ''}
          </span>
          {escorting && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-500" />
            </span>
          )}
        </div>
        <div>
          <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
            {isHomeService ? homeServiceTitle : carServiceTitle}
          </h4>
          <p className="text-[10px] text-indigo-500 dark:text-indigo-400">
            {isDark ? darkSubtitle : lightSubtitle}
          </p>
        </div>
      </div>

      {/* Active escort indicator */}
      {escorting && (
        <div className="mt-3 rounded-xl bg-indigo-100 p-3 dark:bg-indigo-900">
          <div className="flex items-center gap-2">
            <span className="animate-pulse text-lg" aria-hidden="true">
              ‍️
            </span>
            <div>
              <p className="text-xs font-bold text-indigo-700 dark:text-indigo-200">
                {escortingTitle}
              </p>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
                {escortingSubtitle}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Requested state */}
      {requested && !escorting && (
        <div className="mt-3 rounded-xl bg-indigo-50 p-3 dark:bg-indigo-800">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <p className="text-xs text-indigo-700 dark:text-indigo-200">{sendingText}</p>
          </div>
        </div>
      )}

      {/* Idle: request button */}
      {!requested && !escorting && (
        <button
          type="button"
          onClick={handleRequest}
          className={cn(
            'mt-3 w-full rounded-xl py-2.5 text-xs font-bold transition-all active:scale-[0.98]',
            isDark
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 dark:shadow-indigo-900'
              : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-gray-800 dark:text-gray-300',
          )}
        >
          {isHomeService ? homeButtonText : carButtonText}
        </button>
      )}

      {/* Safety features footer */}
      <div className="mt-2 flex items-center justify-center gap-3 text-[9px] text-text-tertiary dark:text-gray-500">
        <span>{safeCallText}</span>
        <span>{liveLocationText}</span>
        <span>{verifiedExpertText}</span>
      </div>
    </div>
  );
}
