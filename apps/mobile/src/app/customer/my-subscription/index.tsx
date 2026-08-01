import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function MySubscriptionScreen(): JSX.Element {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).subscriptions.getMySubscription.query({}) as any).then((d: any) => { setData(d); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <SkeletonList count={3} />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#7c3aed']} />}>
      <Text style={styles.t}>💎 اشتراكي</Text>
      {data ? (
        <View style={styles.card}>
          <Text style={styles.plan}>{data.planName as string ?? 'غير مشترك'}</Text>
          <Text style={styles.status}>{data.autoRenew ? 'تجديد تلقائي' : 'بدون تجديد'}</Text>
        </View>
      ) : <Text style={styles.e}>لا يوجد اشتراك نشط</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
  plan: { fontSize: 18, fontWeight: '700', color: '#111827' }, status: { fontSize: 14, color: '#6b7280', marginTop: 4 },
});
