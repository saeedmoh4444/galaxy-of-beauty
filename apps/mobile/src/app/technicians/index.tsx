import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface TechnicianItem {
  id?: number;
  name?: string;
  specialtyAr?: string;
  specialty?: string;
  rating?: number;
  totalBookings?: number;
  startingPrice?: number;
}

export default function TechniciansScreen(): JSX.Element {
  const { t } = useLocale();
  const q = trpc.technicians.list.useQuery({});
  const techs = (q.data as unknown as { items?: TechnicianItem[] } | null)?.items ?? [];
  if (q.isLoading) return <SkeletonList count={5} />;
  if (q.isError)
    return (
      <ErrorAlert message={t('mobile.public.technicians.load-error')} onRetry={() => q.refetch()} />
    );
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#db2777']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.technicians.title')}</Text>
      {techs.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.av}>‍</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tn}>{item.name}</Text>
            <Text style={styles.ts}>{item.specialtyAr ?? item.specialty}</Text>
            <View style={styles.tm}>
              <Text style={styles.tr}> {item.rating ?? 0}</Text>
              <Text style={styles.tb}>
                {t('mobile.public.bookings-count', { count: item.totalBookings ?? 0 })}
              </Text>
              <Text style={styles.tp}>
                {t('mobile.public.currency', { price: item.startingPrice?.toLocaleString() ?? '' })}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  av: { fontSize: 40 },
  tn: { fontSize: 15, fontWeight: '700', color: '#111827' },
  ts: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  tm: { flexDirection: 'row', gap: 12, marginTop: 6 },
  tr: { fontSize: 12, color: '#f59e0b' },
  tb: { fontSize: 12, color: '#6b7280' },
  tp: { fontSize: 13, fontWeight: '700', color: '#db2777' },
});
