import { useEffect, useState } from 'react';
import { getAuthToken, subscribeAuthToken } from '@/lib/authToken';

/**
 * Reactive auth state — true while a token is stored.
 *
 * Guest sessions (no token) fire no protected queries: screens gate their
 * useQuery calls with `enabled: isAuthed` and render their guest states,
 * matching the design contract in lib/trpc-react.tsx's UNAUTHORIZED handler.
 */
export function useAuthState(): boolean {
  const [authed, setAuthed] = useState<boolean>(() => !!getAuthToken());

  useEffect(() => subscribeAuthToken(() => setAuthed(!!getAuthToken())), []);

  return authed;
}
