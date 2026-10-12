'use client';
import { useEffect } from 'react';
import type { JSX } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { CardSkeleton } from '@galaxy/ui';
import { useVendorStore } from '@/hooks/useVendorStore';

/**
 * (vendor)/(owner) subgroup — owner-only vendor pages are protected by
 * placement: anything under this group inherits the ownership gate.
 *
 * Loading → skeleton. No store → the registration wizard at /vendor-portal
 * (never a dead bounce). Store → children.
 */
export default function VendorOwnerLayout({ children }: { children: ReactNode }): JSX.Element {
  const router = useRouter();
  const { isLoading, isOwner } = useVendorStore();

  useEffect(() => {
    // Hydration-safe: only redirect once auth AND the store lookup resolved.
    if (!isLoading && !isOwner) {
      router.replace('/vendor-portal');
    }
  }, [isLoading, isOwner, router]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!isOwner) return <></>;

  return <>{children}</>;
}
