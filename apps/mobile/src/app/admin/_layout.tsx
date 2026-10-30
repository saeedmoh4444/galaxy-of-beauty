import type { JSX } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, Redirect } from 'expo-router';
import { trpc } from '@/lib/trpc-react';
import { useAuthState } from '@/hooks/useAuthState';
import { useLocale } from '@/components/LocaleProvider';

/**
 * D4 — admin role guard. Every screen under /admin renders behind this
 * layout: unauthenticated visitors and non-admin roles are redirected
 * before any admin shell (or its queries) mounts. Screen titles moved
 * here from the root Stack when the group was nested.
 */
export default function AdminLayout(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = useAuthState();
  const me = trpc.users.getMe.useQuery(undefined, { enabled: isAuthed });

  if (!isAuthed) return <Redirect href="/(auth)/login" />;
  if (me.isLoading) {
    return (
      <View style={styles.c}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }
  if (me.data?.role !== 'ADMIN') return <Redirect href="/(tabs)/home" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard/index" options={{ title: t('mobile.adminDashboard') }} />
      <Stack.Screen name="users/index" options={{ title: t('mobile.users') }} />
      <Stack.Screen name="bookings/index" options={{ title: t('mobile.bookings') }} />
      <Stack.Screen name="finance/index" options={{ title: t('mobile.adminFinance') }} />
      <Stack.Screen name="categories/index" options={{ title: t('mobile.categories') }} />
      <Stack.Screen name="services/index" options={{ title: t('mobile.services') }} />
      <Stack.Screen name="technicians/index" options={{ title: t('mobile.technicians') }} />
      <Stack.Screen name="analytics/index" options={{ title: t('mobile.analytics') }} />
      <Stack.Screen name="disputes/index" options={{ title: t('mobile.disputes') }} />
      <Stack.Screen name="zatca/index" options={{ title: t('mobile.zatca') }} />
      <Stack.Screen name="settings/index" options={{ title: t('mobile.settings') }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
