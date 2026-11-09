'use client';

import { useEffect, useState } from 'react';

/**
 * True once the first passive effect has flushed — i.e. after the client
 * tree hydrated. The first render deliberately mirrors the SSR output
 * (false), so a control using `disabled={!hydrated}`:
 *  - ships disabled in the server HTML (no hydration mismatch),
 *  - makes Playwright's actionability wait (enabled) absorb the
 *    pre-hydration window deterministically, and
 *  - stops real users on slow devices from clicking before React has
 *    attached the submit handler (the lost-click race that took down the
 *    E2E suite under CI CPU contention).
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
