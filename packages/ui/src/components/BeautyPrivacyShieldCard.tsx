'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Privacy Shield Card — privacy status & settings overview.
 * From Phase W1: Safety & Privacy Architecture.
 *
 * Usage:
 *   <BeautyPrivacyShieldCard status={{ photosEncrypted: true, locationHidden: true, dataEncrypted: true }} />
 */

interface PrivacyStatus {
  photosEncrypted: boolean;
  locationHidden: boolean;
  dataEncrypted: boolean;
  anonymousMode?: boolean;
}

interface BeautyPrivacyShieldCardProps {
  status: PrivacyStatus;
  onManageSettings?: () => void;
  className?: string;
}

export function BeautyPrivacyShieldCard({
  status,
  onManageSettings,
  className = '',
}: BeautyPrivacyShieldCardProps): JSX.Element {
  const items = [
    { key: 'photosEncrypted', emoji: '🔒', label: 'الصور مشفرة', active: status.photosEncrypted },
    { key: 'locationHidden', emoji: '📍', label: 'الموقع مخفي', active: status.locationHidden },
    { key: 'dataEncrypted', emoji: '🛡️', label: 'البيانات مشفرة', active: status.dataEncrypted },
    {
      key: 'anonymousMode',
      emoji: '🕶️',
      label: 'وضع التخفي',
      active: status.anonymousMode ?? false,
    },
  ];
  const activeCount = items.filter((i) => i.active).length;

  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-5 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">
            🛡️
          </span>
          <div>
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              حالة الخصوصية
            </h4>
            <p className="text-[10px] text-emerald-500 dark:text-emerald-400">
              {activeCount}/{items.length} ميزات نشطة
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {items.map((item) => (
          <div
            key={item.key}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2',
              item.active
                ? 'bg-emerald-50 dark:bg-emerald-950'
                : 'bg-gray-50 dark:bg-gray-800 opacity-50',
            )}
          >
            <span className="text-sm">{item.emoji}</span>
            <span
              className={cn(
                'flex-1 text-[10px]',
                item.active
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-gray-400 dark:text-gray-600',
              )}
            >
              {item.label}
            </span>
            <span className="text-xs">{item.active ? '✅' : '—'}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onManageSettings}
        className="mt-3 w-full rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all"
      >
        إدارة الخصوصية 🔒
      </button>
    </div>
  );
}
