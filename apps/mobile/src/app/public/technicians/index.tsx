import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function TechniciansScreen(): JSX.Element {
  const {
    data: techs,
    loading,
    error,
    refreshing,
    refetch,
    refresh,
  } = useQuery(() => (trpc as any).technicians.list.query());

  if (loading) return <SkeletonList count={6} />;
  if (error) return <ErrorAlert message="فشل تحميل الفنيات" onRetry={refetch} />;

  const items = (techs ?? []) as any[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#db2777']} />
      }
    >
      <Text style={styles.t}>‍ الفنيات</Text>
      <Text style={styles.sub}>تعرفي على نخبة فنيات التجميل</Text>
      {items.length === 0 ? (
        <Text style={styles.e}>لا توجد فنيات</Text>
      ) : (
        items.map((t: any) => (
          <View key={t.id} style={styles.card}>
            <Text style={styles.avatar}>‍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.techName}>{t.name as string}</Text>
              <Text style={styles.techSpecialty}>
                {(t.specialtyAr as string) ?? (t.specialty as string)}
              </Text>
              <View style={styles.techMeta}>
                <Text style={styles.rating}> {(t.rating as number) ?? 0}</Text>
                <Text style={styles.bookings}> {(t.totalBookings as number) ?? 0} حجز</Text>
                <Text style={styles.price}>
                  {(t.startingPrice as number)?.toLocaleString()} ر.س
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
