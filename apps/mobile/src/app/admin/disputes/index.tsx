import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function AdminDisputesScreen(): JSX.Element {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).disputes.list.query({}) as any).then((d: any) => { setData(d || []); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <SkeletonList count={5} />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#dc2626']} />}>
      <Text style={styles.t}>⚖️ النزاعات</Text>
      {data.map((d: any, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.status}>{d.status as string}</Text>
          <View style={{flex:1}}><Text style={styles.reason}>{d.reason as string}</Text><Text style={styles.date}>{new Date(d.createdAt as string).toLocaleDateString('ar-SA')}</Text></View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fef2f2' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#dc2626', textAlign: 'center', marginBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 6 },
  status: { fontSize: 12, fontWeight: '700', color: '#dc2626', backgroundColor: '#fee2e2', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  reason: { fontSize: 13, fontWeight: '600', color: '#111827' }, date: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
});
