import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function AdminCampaignsScreen(): JSX.Element {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).campaigns.listAll.query() as any).then((d: any) => { setData(d || []); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <SkeletonList count={5} />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#f59e0b']} />}>
      <Text style={styles.t}>📢 الحملات</Text>
      {data.map((c: any, i: number) => (
        <View key={i} style={styles.card}>
          <View style={{flex:1}}><Text style={styles.name}>{(c.nameJson as any)?.ar as string}</Text><Text style={styles.discount}>{c.discountType === 'percent' ? `-${c.discountValue}%` : `-${c.discountValue} ر.س`}</Text></View>
          <View style={[styles.badge, c.isActive ? styles.active : styles.inactive]}><Text style={styles.badgeText}>{c.isActive ? 'نشط' : 'غير نشط'}</Text></View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 6 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' }, discount: { fontSize: 12, color: '#dc2626', marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }, active: { backgroundColor: '#dcfce7' }, inactive: { backgroundColor: '#f3f4f6' },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
