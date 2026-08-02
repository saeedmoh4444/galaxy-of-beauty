import { Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_PAGE_SIZE } from '@galaxy/shared';
import { SkeletonList } from '@/components/SkeletonCard';

export default function BookingsScreen(): JSX.Element {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).bookings.list.query({ page: 1, limit: DEFAULT_PAGE_SIZE }) as any).then((d: any) => { setData(d?.bookings || []); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  if (loading) return <SkeletonList count={4} />;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#7c3aed']} />}>
      <Text style={styles.t}>📅 حجوزاتي</Text>
      {data.map((b: any, i: number) => (<TouchableOpacity key={i} style={styles.card}><Text style={styles.bc}>{b.bookingCode as string}</Text><Text style={styles.bd}>{new Date(b.startAt as string).toLocaleDateString('ar-SA')}</Text><Text style={styles.bs}>{b.status as string}</Text></TouchableOpacity>))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 6 },
  bc: { fontSize: 13, fontWeight: '600', color: '#111827', fontFamily: 'monospace' }, bd: { fontSize: 12, color: '#6b7280' }, bs: { fontSize: 12, fontWeight: '600', color: '#7c3aed' },
});
