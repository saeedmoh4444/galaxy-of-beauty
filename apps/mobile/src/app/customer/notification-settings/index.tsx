import { View, Text, ScrollView, Switch, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

interface NotificationPrefs {
  bookings?: boolean;
  promo?: boolean;
  chat?: boolean;
  reviews?: boolean;
}

export default function NotificationSettingsScreen(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = useAuthState();
  const prefsQ = trpc.notificationPrefs.get.useQuery(undefined, { enabled: isAuthed });
  const data = (prefsQ.data as NotificationPrefs | undefined) ?? {};

  if (prefsQ.isLoading) return <SkeletonList count={3} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={prefsQ.isRefetching}
          onRefresh={() => prefsQ.refetch()}
          colors={['#6366f1']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.notificationSettings.title')}</Text>
      {(['bookings', 'promo', 'chat', 'reviews'] as const).map((key) => (
        <View key={key} style={styles.row}>
          <Text style={styles.label}>
            {key === 'bookings'
              ? t('mobile.notificationSettings.bookings')
              : key === 'promo'
                ? t('mobile.notificationSettings.promo')
                : key === 'chat'
                  ? t('mobile.notificationSettings.chat')
                  : t('mobile.notificationSettings.reviews')}
          </Text>
          <Switch
            value={data[key] ?? true}
            onValueChange={() => {}}
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
    marginBottom: 6,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#111827' },
});
