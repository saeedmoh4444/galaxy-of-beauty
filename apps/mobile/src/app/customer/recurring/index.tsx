import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

interface RecurringBooking {
  id?: number;
  serviceName?: string;
  recurrence?: string;
  occurrences?: number;
}

export default function RecurringScreen(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = useAuthState();
  const bookingsQ = trpc.recurringBookings.list.useQuery(undefined, { enabled: isAuthed });
  const data: RecurringBooking[] =
    (bookingsQ.data as unknown as RecurringBooking[] | undefined) ?? [];

  if (bookingsQ.isLoading) return <SkeletonList count={4} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={bookingsQ.isRefetching}
          onRefresh={() => bookingsQ.refetch()}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.recurring.title')}</Text>
      {data.map((r, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}></Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{r.serviceName ?? ''}</Text>
            <Text style={styles.freq}>
              {t('mobile.recurring.freq', {
                recurrence: r.recurrence ?? '',
                count: r.occurrences ?? 0,
              })}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  emoji: { fontSize: 28 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  freq: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
