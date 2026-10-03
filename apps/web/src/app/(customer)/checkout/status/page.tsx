import type { JSX } from 'react';
import { getServerCaller } from '@/lib/server-trpc';
import { CheckoutStatusClient } from './CheckoutStatusClient';

/**
 * MyFatoorah CallBackUrl landing for store checkouts. Verification is
 * server-side (GetPaymentStatus) — the redirect query alone is never
 * trusted.
 */
export default async function CheckoutStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string; invoiceId?: string }>;
}): Promise<JSX.Element> {
  const params = await searchParams;
  let status: 'PAID' | 'FAILED' | 'PENDING' = 'PENDING';

  if (params.paymentId || params.invoiceId) {
    try {
      const caller = await getServerCaller();
      const result = await caller.payments.verifyCartPayment({
        paymentId: params.paymentId,
        invoiceId: params.invoiceId,
      });
      status = result.status;
    } catch {
      // Verification unavailable — show pending, never success.
      status = 'PENDING';
    }
  }

  return <CheckoutStatusClient status={status} />;
}
