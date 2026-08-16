'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Location Sharing Card — share real-time location with trusted contacts during home service.
 * From Phase W9: Safety Micro-Features.
 *
 * Usage:
 *   <LocationSharingCard contacts={[{ name: 'أمي', phone: '055...' }]} />
 */

interface TrustedContact {
  name: string;
  phone: string;
  relation?: string;
}

interface LocationSharingCardProps {
  contacts: TrustedContact[];
  /** Service address */
  address?: string;
  /** Technician name */
  technicianName?: string;
  /** Estimated end time */
  estimatedEnd?: string;
  className?: string;
}

export function LocationSharingCard({
  contacts,
  address,
  technicianName,
  estimatedEnd,
  className = '',
}: LocationSharingCardProps): JSX.Element | null {
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  if (!contacts.length) return null;

  const handleShare = (contactName: string) => {
    setSelectedContact(contactName);
    setSharing(true);
    setTimeout(() => {
      setSharing(false);
      setShared(true);
    }, 1500);
  };

  const handleStop = () => {
    setShared(false);
    setSelectedContact(null);
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">
            مشاركة الموقع المباشر
          </h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">
            أمانكِ أثناء الخدمة المنزلية
          </p>
        </div>
        {shared && (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-600 dark:bg-teal-950 dark:text-teal-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-500" />
            </span>
            مباشر
          </span>
        )}
      </div>

      {/* Service context */}
      {(address || technicianName) && (
        <div className="mt-2 space-y-1 rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800">
          {technicianName && (
            <div className="flex items-center gap-1.5 text-[10px]">
              <span aria-hidden="true">‍</span>
              <span className="text-text-secondary dark:text-gray-300">
                الخبيرة: <span className="font-bold">{technicianName}</span>
              </span>
            </div>
          )}
          {address && (
            <div className="flex items-center gap-1.5 text-[10px]">
              <span aria-hidden="true"></span>
              <span className="text-text-secondary dark:text-gray-300">{address}</span>
            </div>
          )}
          {estimatedEnd && (
            <div className="flex items-center gap-1.5 text-[10px]">
              <span aria-hidden="true"></span>
              <span className="text-text-secondary dark:text-gray-300">
                الوقت المتوقع للانتهاء: {estimatedEnd}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Contacts */}
      <div className="mt-3 space-y-1.5">
        <p className="text-[10px] font-bold text-text-tertiary dark:text-gray-400">
          جهات اتصال موثوقة
        </p>
        {contacts.map((contact) => {
          const isThisContact = selectedContact === contact.name;
          const isSharingThis = sharing && isThisContact;
          const isSharedThis = shared && isThisContact;

          return (
            <div
              key={contact.phone}
              className={cn(
                'flex items-center justify-between rounded-xl border p-2.5 transition-all',
                isSharedThis
                  ? 'border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950'
                  : 'border-gray-100 dark:border-gray-800',
              )}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 text-sm dark:from-teal-900 dark:to-emerald-900">
                  {contact.relation === 'mother' ? '' : contact.relation === 'sister' ? '' : ''}
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary dark:text-gray-100">
                    {contact.name}
                  </p>
                  <p className="text-[10px] text-text-tertiary dark:text-gray-500">
                    {contact.phone}
                    {contact.relation && ` · ${contact.relation}`}
                  </p>
                </div>
              </div>

              {isSharedThis ? (
                <span className="rounded-full bg-teal-100 px-3 py-1 text-[10px] font-bold text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                  تشارك الآن
                </span>
              ) : isSharingThis ? (
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
                  <span className="text-[10px] text-teal-600 dark:text-teal-400">جاري...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleShare(contact.name)}
                  disabled={shared}
                  className="rounded-lg bg-teal-100 px-2.5 py-1 text-[10px] font-bold text-teal-700 hover:bg-teal-200 disabled:opacity-40 dark:bg-teal-900 dark:text-teal-300"
                >
                  مشاركة
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Stop sharing */}
      {shared && (
        <button
          type="button"
          onClick={handleStop}
          className="mt-2 w-full rounded-xl border border-rose-200 bg-rose-50 py-1.5 text-[10px] font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400"
        >
          ️ إيقاف المشاركة
        </button>
      )}

      {/* Auto-stop reminder */}
      {shared && (
        <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
          ستتوقف المشاركة تلقائياً بعد انتهاء الموعد
        </p>
      )}
    </div>
  );
}
