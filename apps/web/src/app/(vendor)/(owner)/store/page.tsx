'use client';
import type { JSX } from 'react';
import { VendorPortal } from '@/components/vendor/VendorPortal';

/**
 * /store — the dedicated store/provider dashboard (S1).
 *
 * Ownership gating lives in the (vendor)/(owner) layout: this page only
 * renders for authenticated store owners. Non-owners are sent to the
 * registration wizard at /vendor-portal by the layout, never a dead path.
 * The URL is unchanged (/store) — route groups don't affect paths.
 */
export default function StoreDashboardPage(): JSX.Element {
  return <VendorPortal shellRole="STORE" />;
}
