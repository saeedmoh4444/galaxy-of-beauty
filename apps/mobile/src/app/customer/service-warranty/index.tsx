import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function ServiceWarrantyScreen(): JSX.Element {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).serviceWarranty.list.query() as any).then((d: any) => { setData(d || []); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  if (loading) return <SkeletonList count={4} />;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#2563eb']} />}>
      <Text style={styles.t}>🛡️ ضمان الخدمة</Text>
      {data.map((w: any, i: number) => (
        <View key={i} style={styles.card}><Text style={styles.emoji}>{w.emoji as string ?? '🛡️'}</Text><View style={{flex:1}}><Text style={styles.name}>{w.serviceName as string}</Text><Text style={styles.exp}>ينتهي: {new Date(w.expiresAt as string).toLocaleDateString('ar-SA')}</Text></View></View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eff6ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#2563eb', textAlign: 'center', marginBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 6 },
  emoji: { fontSize: 28 }, name: { fontSize: 14, fontWeight: '600', color: '#111827' }, exp: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
