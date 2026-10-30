import type { JSX } from 'react';
import { View, Text, ScrollView, Switch, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

/** The real NotificationPreference fields (the screen previously used a
 *  local interface with phantom bookings/promo/chat/reviews names). */
interface NotificationPrefs {
  bookingReminders: boolean;
  promotions: boolean;
  tips: boolean;
  community: boolean;
  emailDigest: boolean;
  smsAlerts: boolean;
  whatsappAlerts: boolean;
}

// UI rows → real preference fields (chat maps to community, reviews to
// tips — the nearest content switches; email/sms/whatsapp rows arrive
// with the full preference UI later).
const ROWS = [
  { field: 'bookingReminders', labelKey: 'mobile.notificationSettings.bookings' },
  { field: 'promotions', labelKey: 'mobile.notificationSettings.promo' },
  { field: 'community', labelKey: 'mobile.notificationSettings.chat' },
  { field: 'tips', labelKey: 'mobile.notificationSettings.reviews' },
] as const;

export default function NotificationSettingsScreen(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = useAuthState();
  const utils = trpc.useUtils();

  const prefsQ = trpc.notificationPrefs.get.useQuery(undefined, { enabled: isAuthed });
  const data = (prefsQ.data as NotificationPrefs | undefined) ?? ({} as NotificationPrefs);

  // D3 — the switches were dead (onValueChange={() => {}}). Persist each
  // toggle through notificationPrefs.update.
  const updateMut = trpc.notificationPrefs.update.useMutation({
    onSuccess: () => void utils.notificationPrefs.get.invalidate(),
  });

  if (prefsQ.isLoading) return <SkeletonList count={3} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={prefsQ.isRefetching}
          onRefresh={async () => {
            await prefsQ.refetch();
          }}
          colors={['#c2255c']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.notificationSettings.title')}</Text>
      {ROWS.map(({ field, labelKey }) => (
        <View key={field} style={styles.row}>
          <Text style={styles.label}>{t(labelKey)}</Text>
          <Switch
            value={data[field] ?? true}
            onValueChange={(value) => updateMut.mutate({ [field]: value })}
            trackColor={{ false: '#e5e7eb', true: '#6366f1' }}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  label: { fontSize: 15, fontWeight: '600', color: '#111827' },
});
