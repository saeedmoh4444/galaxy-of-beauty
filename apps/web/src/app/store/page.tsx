'use client';
import { useEffect } from 'react';
import type { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/trpc';
import { useAuth } from '@galaxy/ui';
import { CardSkeleton } from '@galaxy/ui';
import { VendorPortal } from '@/components/vendor/VendorPortal';

/**
 * S1 — dedicated store/provider dashboard at /store. Store owners get the
 * portal in the STORE shell; visitors without a store are sent to the
 * customer-shell portal where the registration wizard lives.
 */
export default function StoreDashboardPage(): JSX.Element {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = api.vendorPortal.myStore.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    // Only redirect once authenticated and the store lookup resolved —
    // otherwise the auth hydration race sends store owners away too.
    if (isAuthenticated && !isLoading && !data) {
      router.replace('/customer/vendor-portal');
    }
  }, [isAuthenticated, isLoading, data, router]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!data) return <></>;

  return <VendorPortal shellRole="STORE" />;
}
