import { redirect } from 'next/navigation';

/**
 * Legacy card-wall wellness route (pre-Phase-3 sprint 3). Deep links
 * land on the stage-aware tabs hub instead of a 404.
 */
export default function WellnessRedirectPage(): never {
  redirect('/wellness-hub');
}
