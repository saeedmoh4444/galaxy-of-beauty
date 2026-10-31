import type { JSX } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, Redirect } from 'expo-router';
import { trpc } from '@/lib/trpc-react';
import { useAuthState } from '@/hooks/useAuthState';
import { useLocale } from '@/components/LocaleProvider';

/**
 * D4 — technician role guard. Every screen under /tech renders behind
 * this layout: unauthenticated visitors and non-technician roles are
 * redirected before any tech shell (or its queries) mounts. Screen
 * titles moved here from the root Stack when the group was nested.
 */
export default function TechLayout(): JSX.Element {
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
  if (me.data?.role !== 'TECHNICIAN' && me.data?.role !== 'ADMIN') {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard/index" options={{ title: t('mobile.techDashboard') }} />
      <Stack.Screen name="slots/index" options={{ title: t('mobile.slots') }} />
      <Stack.Screen name="bookings/index" options={{ title: t('mobile.myBookings') }} />
      <Stack.Screen name="earnings/index" options={{ title: t('mobile.earnings') }} />
      <Stack.Screen name="profile/index" options={{ title: t('mobile.myProfile') }} />
      <Stack.Screen name="calendar/index" options={{ title: t('mobile.calendar') }} />
      <Stack.Screen name="video/[bookingId]/index" options={{ title: t('mobile.videoConsult') }} />
      <Stack.Screen
        name="video/[bookingId]/room/index"
        options={{ title: t('mobile.videoRoom') }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
