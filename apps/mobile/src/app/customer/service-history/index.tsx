import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { MAX_LIST_SIZE } from '@galaxy/shared';

export default function ServiceHistoryScreen(): JSX.Element {
  const { data, loading, error, refreshing, refetch, refresh } = useQuery(() => trpc.bookings.list.query({ limit: MAX_LIST_SIZE }) as any);

  if (loading) return <View style={styles.c}><Text style={styles.t}>📋 سجل الخدمات</Text><SkeletonList count={5} /></View>;
  if (error) return <ErrorAlert message="فشل تحميل السجل" onRetry={refetch} />;

  const bookings = ((data as any)?.bookings ?? []) as Record<string, unknown>[];

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#7c3aed']} />}>
      <Text style={styles.t}>📋 سجل الخدمات</Text>
      {bookings.length === 0 ? <Text style={styles.e}>لا توجد حجوزات سابقة</Text> :
        bookings.map((b: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.code}>{b.bookingCode as string}</Text>
            <Text style={styles.date}>{new Date(b.startAt as string).toLocaleDateString('ar-SA')}</Text>
            <Text style={styles.status}>{b.status as string}</Text>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 6 },
  code: { fontSize: 13, fontWeight: '600', color: '#111827', fontFamily: 'monospace' },
  date: { fontSize: 12, color: '#6b7280' }, status: { fontSize: 12, fontWeight: '600', color: '#7c3aed' },
});
