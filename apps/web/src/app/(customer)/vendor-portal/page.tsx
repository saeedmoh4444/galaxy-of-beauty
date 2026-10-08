'use client';
import type { JSX } from 'react';
import { VendorPortal } from '@/components/vendor/VendorPortal';

/**
 * Provider portal (customer-shell entry). Store/clinic/gym/nail-bar/athome
 * owners get the same portal under the dedicated /store shell (S1).
 */
export default function VendorPortalPage(): JSX.Element {
  return <VendorPortal />;
}
