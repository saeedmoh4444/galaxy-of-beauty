import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface Technician {
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
  const techsQ = trpc.technicians.list.useQuery({});

  if (techsQ.isLoading) return <SkeletonList count={6} />;
  if (techsQ.isError)
    return (
      <ErrorAlert
        message={t('mobile.public.technicians.load-error')}
        onRetry={() => techsQ.refetch()}
      />
    );

  const items = ((techsQ.data as unknown as { items?: Technician[] } | null)?.items ??
    []) as Technician[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={techsQ.isRefetching}
          onRefresh={() => techsQ.refetch()}
          colors={['#db2777']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.technicians.title')}</Text>
      <Text style={styles.sub}>{t('mobile.public.technicians.subtitle')}</Text>
      {items.length === 0 ? (
        <Text style={styles.e}>{t('mobile.public.technicians.empty')}</Text>
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.avatar}>‍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.techName}>{item.name as string}</Text>
              <Text style={styles.techSpecialty}>
                {(item.specialtyAr as string) ?? (item.specialty as string)}
              </Text>
              <View style={styles.techMeta}>
                <Text style={styles.rating}> {(item.rating as number) ?? 0}</Text>
                <Text style={styles.bookings}>
                  {t('mobile.public.bookings-count', {
                    count: (item.totalBookings as number) ?? 0,
                  })}
                </Text>
                <Text style={styles.price}>
                  {t('mobile.public.currency', {
                    price: (item.startingPrice as number)?.toLocaleString() ?? '',
                  })}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  avatar: { fontSize: 40 },
  techName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  techSpecialty: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  techMeta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  rating: { fontSize: 12, color: '#f59e0b' },
  bookings: { fontSize: 12, color: '#6b7280' },
  price: { fontSize: 13, fontWeight: '700', color: '#db2777' },
});
