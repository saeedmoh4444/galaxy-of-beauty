import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function MyJourneyScreen(): JSX.Element {
  const { data: bData, loading, error, refreshing, refetch, refresh } = useQuery(() => trpc.bookings.list.query({ limit: 100 }) as any);
  const { data: insights } = useQuery(() => trpc.analytics.customerInsights.query());

  if (loading) return <View style={styles.c}><Text style={styles.t}>🚀 رحلتي</Text><SkeletonList count={5} /></View>;
  if (error) return <ErrorAlert message="فشل تحميل الرحلة" onRetry={refetch} />;

  const bookings = ((bData as any)?.bookings ?? []) as Record<string, unknown>[];
  const totalSpent = (insights as any)?.totalSpent ?? 0;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#ec4899']} />}>
      <Text style={styles.t}>🚀 رحلتي</Text>
      <View style={styles.statCard}>
        <Text style={styles.statVal}>{bookings.length}</Text>
        <Text style={styles.statLabel}>حجز</Text>
        <Text style={styles.statVal}>{(totalSpent as number)?.toLocaleString()} ر.س</Text>
        <Text style={styles.statLabel}>إنفاق</Text>
      </View>
      <Text style={styles.sectionTitle}>📋 آخر الحجوزات</Text>
      {bookings.length === 0 ? <Text style={styles.e}>لا توجد حجوزات</Text> :
        bookings.slice(0, 10).map((b: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.code}>{b.bookingCode as string}</Text>
            <Text style={styles.date}>{new Date(b.startAt as string).toLocaleDateString('ar-SA')}</Text>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  statCard: { flexDirection: 'row', justifyContent: 'center', gap: 20, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20 },
  statVal: { fontSize: 18, fontWeight: '800', color: '#db2777' },
  statLabel: { fontSize: 12, color: '#9ca3af' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 20 },
  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 4 },
  code: { fontSize: 13, fontWeight: '600', color: '#111827', fontFamily: 'monospace' },
  date: { fontSize: 12, color: '#6b7280' },
});
