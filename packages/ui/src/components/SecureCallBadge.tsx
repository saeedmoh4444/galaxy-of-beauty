'use client';

import { cn } from '@galaxy/shared';

/**
 * Secure Call Badge — anonymous proxy communication via Twilio for technician calls.
 * From Phase W1: Safety & Privacy — Burner Phone Number.
 *
 * Usage:
 *   <SecureCallBadge proxyNumber="+966 50 000 0000" expiresIn="24 ساعة" />
 */

interface SecureCallBadgeProps {
  /** Temporary proxy phone number */
  proxyNumber?: string;
  /** When the number expires */
  expiresIn?: string;
  /** Number of calls remaining */
  callsRemaining?: number;
  /** Whether the proxy is active */
  isActive?: boolean;
  onActivate?: () => void;
  className?: string;
}

export function SecureCallBadge({
  proxyNumber,
  expiresIn = '24 ساعة',
  callsRemaining,
  isActive = false,
  onActivate,
  className = '',
}: SecureCallBadgeProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <span className="text-xl" aria-hidden="true">📞</span>
          {isActive && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
          )}
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
            اتصال آمن
          </h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">
            رقمكِ الحقيقي يبقى مخفياً — نستخدم رقم وسيط
          </p>
        </div>
        {isActive && (
          <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            🔒 نشط
          </span>
        )}
      </div>

      {/* Proxy number */}
      {isActive && proxyNumber && (
        <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-950">
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">
            رقم الاتصال المؤقت
          </p>
          <p className="mt-0.5 text-lg font-mono font-bold text-emerald-800 dark:text-emerald-200" dir="ltr">
            {proxyNumber}
          </p>
          <p className="mt-1 text-[9px] text-emerald-500 dark:text-emerald-400">
            ⏰ ينتهي بعد {expiresIn} · 📞 {callsRemaining ?? 'غير محدود'} مكالمات متبقية
          </p>
        </div>
      )}

      {/* Feature list */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          { emoji: '🔒', label: 'رقمكِ مخفي' },
          { emoji: '⏰', label: 'رقم مؤقت' },
          { emoji: '📝', label: 'المكالمات مسجلة' },
          { emoji: '🚫', label: 'لا رسائل مزعجة' },
        ].map((f) => (
          <div
            key={f.label}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-50/50 px-2.5 py-1.5 dark:bg-emerald-950/30"
          >
            <span className="text-xs" aria-hidden="true">{f.emoji}</span>
            <span className="text-[10px] font-medium text-emerald-800 dark:text-emerald-200">
              {f.label}
            </span>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="mt-2 rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800">
        <p className="text-[10px] font-bold text-text-secondary dark:text-gray-300">
          💡 كيف يعمل؟
        </p>
        <p className="mt-0.5 text-[9px] leading-relaxed text-text-tertiary dark:text-gray-500">
          عندما تتصل الخبيرة، يمر الاتصال عبر رقم وسيط (Twilio). ترين رقمها المؤقت، وترى
          رقمكِ المؤقت. بعد انتهاء الموعد بـ {expiresIn}، تُحذف الأرقام تلقائياً.
        </p>
      </div>

      {/* Activate button */}
      {!isActive && (
        <button
          type="button"
          onClick={onActivate}
          className="mt-3 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all"
        >
          فعّلي الاتصال الآمن 📞
        </button>
      )}

      {/* Active state CTA */}
      {isActive && (
        <button
          type="button"
          className="mt-3 w-full rounded-xl border border-rose-200 bg-rose-50 py-2 text-[10px] font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400"
        >
          ⏹️ إلغاء الرقم المؤقت
        </button>
      )}

      {/* Privacy guarantee */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        🛡️ خصوصيتكِ أمانة — لا نشارك رقمكِ الحقيقي مع أحد
      </p>
    </div>
  );
}
