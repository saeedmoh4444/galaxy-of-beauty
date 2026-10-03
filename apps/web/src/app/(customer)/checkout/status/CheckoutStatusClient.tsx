'use client';
import type { JSX } from 'react';
import Link from 'next/link';
import { Card, Icon } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

/**
 * Post-gateway-redirect landing card for store checkouts. The server
 * component already called verifyCartPayment (server-side verification —
 * never trust the redirect alone); this just renders the outcome.
 */
export function CheckoutStatusClient({
  status,
}: {
  status: 'PAID' | 'FAILED' | 'PENDING';
}): JSX.Element {
  const { t } = useLocale();

  const tone =
    status === 'PAID'
      ? {
          border: 'border-green-300 bg-green-50 dark:bg-green-950',
          icon: 'check',
          color: 'text-green-600 dark:text-green-400',
          title: t('wallet.payment-success'),
        }
      : status === 'FAILED'
        ? {
            border: 'border-red-300 bg-red-50 dark:bg-red-950',
            icon: 'close',
            color: 'text-red-600 dark:text-red-400',
            title: t('wallet.payment-failed'),
          }
        : {
            border: 'border-amber-300 bg-amber-50 dark:bg-amber-950',
            icon: 'clock',
            color: 'text-amber-600 dark:text-amber-400',
            title: t('wallet.payment-pending'),
          };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-xl">
        <Card padding="lg" className={`text-center border-2 ${tone.border}`}>
          <Icon name={tone.icon as 'check'} size="xl" className={`mx-auto ${tone.color}`} />
          <p className={`font-bold mt-2 ${tone.color}`}>{tone.title}</p>
          {status === 'PENDING' && (
            <p className="text-sm text-text-secondary mt-1">{t('wallet.check-payment-status')}</p>
          )}
          <Link
            href={status === 'PAID' ? '/orders' : '/checkout'}
            className="mt-4 inline-block text-sm font-bold text-brand-500 hover:underline"
          >
            {status === 'PAID' ? t('wallet.order-summary') : t('wallet.checkout')}
          </Link>
        </Card>
      </div>
    </DashboardLayout>
  );
}
