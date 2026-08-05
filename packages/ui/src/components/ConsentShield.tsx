'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Consent Shield — explicit consent management for photo and data sharing.
 * From Phase W1: Safety & Privacy Architecture.
 *
 * Usage:
 *   <ConsentShield
 *     permissions={['photo_gallery', 'before_after', 'testimonial']}
 *     onChange={(p) => console.log(p)}
 *   />
 */

type Permission = 'photo_gallery' | 'before_after' | 'testimonial' | 'data_analytics' | 'marketing_email' | 'location_sharing';

interface PermDef {
  emoji: string;
  label: string;
  description: string;
  required?: boolean;
}

const PERMISSIONS: Record<Permission, PermDef> = {
  photo_gallery: {
    emoji: '🖼️',
    label: 'صور المعرض',
    description: 'السماح بعرض صوري في المعرض العام للمنصة',
  },
  before_after: {
    emoji: '📸',
    label: 'صور قبل/بعد',
    description: 'السماح بمشاركة صور التحول (يمكن تعتيم الوجه)',
  },
  testimonial: {
    emoji: '💬',
    label: 'شهادة',
    description: 'السماح بنشر تقييمي وشهادتي على المنصة',
  },
  data_analytics: {
    emoji: '📊',
    label: 'تحليل البيانات',
    description: 'استخدام بياناتي بشكل مجهول لتحسين الخدمات',
  },
  marketing_email: {
    emoji: '📧',
    label: 'رسائل تسويقية',
    description: 'استلام عروض وخصومات عبر البريد الإلكتروني',
  },
  location_sharing: {
    emoji: '📍',
    label: 'مشاركة الموقع',
    description: 'مشاركة موقعي مع الخبيرة أثناء الخدمة المنزلية',
    required: true,
  },
};

interface ConsentShieldProps {
  /** Currently granted permissions */
  permissions?: Permission[];
  onChange?: (permissions: Permission[]) => void;
  className?: string;
}

export function ConsentShield({
  permissions: initialPermissions = [],
  onChange,
  className = '',
}: ConsentShieldProps): JSX.Element {
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);

  const toggle = (perm: Permission) => {
    const def = PERMISSIONS[perm];
    if (def.required) return; // Can't toggle required permissions

    const next = permissions.includes(perm)
      ? permissions.filter((p) => p !== perm)
      : [...permissions, perm];
    setPermissions(next);
    onChange?.(next);
  };

  const granted = permissions.length;
  const total = Object.keys(PERMISSIONS).length;

  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-5 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">🛡️</span>
        <div>
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
            درع الموافقة
          </h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">
            أنتِ تتحكمين ببياناتكِ — لا نشارك شيئاً بدون إذنكِ
          </p>
        </div>
        <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {granted}/{total}
        </span>
      </div>

      {/* Permissions list */}
      <div className="mt-3 space-y-2">
        {Object.entries(PERMISSIONS).map(([key, def]) => {
          const isGranted = permissions.includes(key as Permission);
          const isRequired = def.required;

          return (
            <div
              key={key}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3 transition-all',
                isGranted
                  ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950'
                  : 'border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800',
              )}
            >
              <span className="text-lg shrink-0" aria-hidden="true">{def.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-text-primary dark:text-gray-100">
                    {def.label}
                  </p>
                  {isRequired && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[8px] font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                      مطلوب
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-text-tertiary dark:text-gray-400">
                  {def.description}
                </p>
              </div>

              {/* Toggle */}
              <button
                type="button"
                onClick={() => toggle(key as Permission)}
                disabled={isRequired}
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
                  isGranted || isRequired
                    ? 'bg-emerald-500'
                    : 'bg-gray-300 dark:bg-gray-600',
                  isRequired && 'opacity-80 cursor-not-allowed',
                )}
              >
                <span
                  className={cn(
                    'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform',
                    isGranted || isRequired ? 'translate-x-4' : 'translate-x-0.5',
                  )}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* Privacy pledge */}
      <div className="mt-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 p-3 text-center dark:from-emerald-950 dark:to-teal-950">
        <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
          🔒 تعهد الخصوصية
        </p>
        <p className="mt-0.5 text-[9px] text-emerald-600 dark:text-emerald-400">
          بياناتكِ ملككِ وحدكِ. يمكنكِ تغيير هذه الإعدادات في أي وقت. نحن لا نبيع بياناتكِ
          لأي طرف ثالث.
        </p>
      </div>
    </div>
  );
}
