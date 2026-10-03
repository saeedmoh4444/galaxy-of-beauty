import type { JSX } from 'react';
import { redirect } from 'next/navigation';
import { getServerCaller } from '@/lib/server-trpc';

/**
 * MyFatoorah CallBackUrl landing for booking payments. Verifies the
 * gateway status server-side (statusCallback → GetPaymentStatus), which
 * transitions the payment/booking, then sends the customer to their
 * bookings list.
 */
export default async function PaymentStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string }>;
}): Promise<JSX.Element> {
  const params = await searchParams;

  if (params.paymentId) {
    try {
      const caller = await getServerCaller();
      await caller.payments.statusCallback({ paymentId: params.paymentId });
    } catch {
      // Verification failed — the customer can retry from the booking.
    }
  }

  redirect('/bookings');
}
