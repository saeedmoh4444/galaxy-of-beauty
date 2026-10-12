'use client';
import type { JSX } from 'react';
import type * as React from 'react';
import { useLocale } from '@/components/LocaleProvider';

/** E2 — file upload input for KSA provider documents (top-level: the
 *  react-hooks/static-components rule forbids creating components during
 *  render). */
export function DocUploadInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}): JSX.Element {
  const { t } = useLocale();
  return (
    <div className="flex items-center gap-2">
      <label className="cursor-pointer rounded-lg border px-3 py-2 text-sm">
        {value
          ? `${t('vendorPortal.apply.uploaded')} ✓`
          : `${t('vendorPortal.apply.upload')} — ${label}`}
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={onChange} />
      </label>
    </div>
  );
}
