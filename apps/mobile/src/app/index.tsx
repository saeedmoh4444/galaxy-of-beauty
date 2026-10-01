import { Redirect, useRootNavigationState } from 'expo-router';
import { useEffect, useState } from 'react';
import { hasSeenOnboarding } from '@/utils/onboarding';

/**
 * Entry route — routes first launches to the onboarding funnel (stage 12)
 * and everyone else to the home tab. The blank-until-known state lasts one
 * AsyncStorage read; defaulting to home would flash it before the funnel.
 */
export default function Index() {
  const navReady = useRootNavigationState()?.key;
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    if (!navReady) return;
    let cancelled = false;
    void hasSeenOnboarding().then((value) => {
      if (!cancelled) setSeen(value);
    });
    return () => {
      cancelled = true;
    };
  }, [navReady]);

  if (seen === null) return null;

  return <Redirect href={seen ? '/(tabs)/home' : '/public/onboarding'} />;
}
