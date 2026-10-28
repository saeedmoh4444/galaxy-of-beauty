'use client';

import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Button } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const STORAGE_KEY = 'vendor-portal-tour-done';

/** D4 — first-visit onboarding tour: one card per portal tab, each step
 *  deep-links to its tab; localStorage suppresses future visits. */
const STEPS = [
  { tab: 'overview', labelKey: 'vendorPortal.tour.step.overview' },
  { tab: 'products', labelKey: 'vendorPortal.tour.step.products' },
  { tab: 'orders', labelKey: 'vendorPortal.tour.step.orders' },
  { tab: 'earnings', labelKey: 'vendorPortal.tour.step.earnings' },
] as const satisfies ReadonlyArray<{ tab: string; labelKey: TranslationKey }>;

export function VendorTour({
  onNavigate,
}: {
  onNavigate: (tab: string) => void;
}): JSX.Element | null {
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== '1') setVisible(true);
    } catch {
      // Private mode / blocked storage — skip the tour silently.
    }
  }, []);

  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Dismiss works without persistence.
    }
    setVisible(false);
  };

  if (!visible) return null;

  const current = STEPS[step]!;
  const last = step === STEPS.length - 1;
  return (
    <div
      data-testid="vendor-tour"
      className="rounded-2xl border border-border-muted bg-surface-elevated p-4 shadow-sm"
    >
      <p className="text-sm font-bold text-text-primary">{t('vendorPortal.tour.title')}</p>
      <p className="mt-1 text-xs leading-relaxed text-text-secondary">{t(current.labelKey)}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-text-secondary">
          {step + 1} / {STEPS.length}
        </span>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={finish}>
            {t('vendorPortal.tour.skip')}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onNavigate(current.tab);
              if (last) finish();
              else setStep((s) => s + 1);
            }}
          >
            {last ? t('vendorPortal.tour.done') : t('vendorPortal.tour.next')}
          </Button>
        </div>
      </div>
    </div>
  );
}
