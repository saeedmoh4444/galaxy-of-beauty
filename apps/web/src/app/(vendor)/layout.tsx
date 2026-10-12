'use client';
import { useEffect } from 'react';
import type { JSX } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@galaxy/ui';

/**
 * (vendor) route group — vendor-facing pages live outside the (customer)
 * group, with their own auth boundary.
 *
 * The portal itself stays open to authenticated users WITHOUT a store: it
 * hosts the registration wizard (providerSubmission → PENDING_REVIEW).
 * Ownership gating belongs on owner-only pages like /store, not here.
 */
export default function VendorLayout({ children }: { children: ReactNode }): JSX.Element {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth hydration before redirecting — otherwise the race
    // bounces authenticated users too (rulebook gotcha #7).
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Don't flash vendor content before auth resolves.
  if (isLoading) return <></>;

  return <>{children}</>;
}
