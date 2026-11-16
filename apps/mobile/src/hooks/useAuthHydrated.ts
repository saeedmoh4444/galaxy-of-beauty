import { useEffect, useState } from 'react';
import { isAuthHydrated, subscribeAuthHydrated } from '@/lib/authToken';

/**
 * Whether the persisted auth token has been restored (loadAuthToken
 * completed). Role guards (vendor-portal, tech) must hold a spinner until
 * this flips — a full-page load or deep link renders before the async
 * restore, and bouncing `false` straight to login would log out a
 * session that was about to hydrate.
 */
export function useAuthHydrated(): boolean {
  const [hydrated, setHydrated] = useState<boolean>(() => isAuthHydrated());

  useEffect(() => subscribeAuthHydrated(() => setHydrated(isAuthHydrated())), []);

  return hydrated;
}
