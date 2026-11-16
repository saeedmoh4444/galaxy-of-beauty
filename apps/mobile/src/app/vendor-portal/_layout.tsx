import type { JSX } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, Redirect } from 'expo-router';
import { trpc } from '@/lib/trpc-react';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthHydrated } from '@/hooks/useAuthHydrated';
import { vendorPortalGate } from '@/utils/vendorPortalGate';

/**
 * W3-3 — vendor-portal group guard. Every screen under /vendor-portal
 * renders behind this layout: guests are redirected to login and
 * authenticated non-vendors to home, before any vendor shell or query
 * mounts. Mirrors the D4 /tech guard; stricter than the web boundary
 * because mobile has no registration wizard — the portal here is a
 * vendor-management surface only.
 *
 * myStore's contract: a successful query returns the vendor OR null
 * (resolveVendorActor found no vendor link) — it does NOT throw for
 * non-vendors. Both shapes (null data, or a NOT_FOUND error if some
 * path throws) mean "not a vendor".
 */
export default function VendorPortalLayout(): JSX.Element {
  const isAuthed = useAuthState();
  const authHydrated = useAuthHydrated();
  const storeQ = trpc.vendorPortal.myStore.useQuery(undefined, {
    enabled: isAuthed && authHydrated,
  });
  const isNonVendor =
    !storeQ.isLoading &&
    (storeQ.data === null ||
      (storeQ.error as { data?: { code?: string } } | null)?.data?.code === 'NOT_FOUND');

  const decision = vendorPortalGate(isAuthed, !authHydrated, storeQ.isLoading, isNonVendor);

  if (decision === 'login') return <Redirect href="/(auth)/login" />;
  if (decision === 'home') return <Redirect href="/(tabs)/home" />;
  if (decision === 'hold') {
    // Hold while the token restores / the ownership check resolves — don't
    // bounce a session that is about to hydrate, and don't flash vendor
    // chrome to someone who is about to be redirected.
    return (
      <View style={styles.c}>
        <ActivityIndicator size="large" color="#c2255c" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="earnings" />
      <Stack.Screen name="inbox" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="orders/[id]" />
      <Stack.Screen name="socials" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
