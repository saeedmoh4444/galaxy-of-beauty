/**
 * First-run onboarding flag (audit stage 12).
 *
 * The public/onboarding walkthrough was orphaned — nothing routed to it.
 * index.tsx consults this flag and routes first launches there; finishing
 * the walkthrough marks it so the funnel shows exactly once per install.
 * Versioned like the web tour gate (gob_tour_v1): bump the suffix to
 * re-show the funnel to existing installs after a content refresh.
 */
import { AsyncStorage } from '@/utils/storage';

export const ONBOARDING_FLAG_KEY = 'gob_onboarding_v1';

/** True once the user has finished (or skipped) the onboarding funnel. */
export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(ONBOARDING_FLAG_KEY);
    return raw === '1';
  } catch {
    // Fail-open to showing the funnel — a one-time re-show is harmless.
    return false;
  }
}

/** Persist completion so the funnel never returns (until the key version bumps). */
export async function markSeenOnboarding(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_FLAG_KEY, '1');
}
