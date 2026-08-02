import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { EXTENDED_PAGE_SIZE } from '@galaxy/shared';

export default function PaymentsScreen(): JSX.Element {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).payments.history.query({ page: 1, limit: EXTENDED_PAGE_SIZE }) as any).then((d: any) => { setData(d?.items || []); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <SkeletonList count={5} />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#0891b2']} />}>
      <Text style={styles.t}>💳 المدفوعات</Text>
      {data.length === 0 ? <Text style={styles.e}>لا توجد مدفوعات</Text> :
        data.map((p: any, i: number) => (
          <View key={i} style={styles.card}>
            <View style={{flex:1}}>
              <Text style={styles.pn}>{p.description as string ?? p.serviceName as string ?? 'دفعة'}</Text>
              <Text style={styles.pd}>{new Date(p.createdAt as string ?? Date.now()).toLocaleDateString('ar-SA')}</Text>
            </View>
            <View style={{alignItems:'flex-end'}}>
              <Text style={[styles.pa, {color: p.type === 'CREDIT' || p.status === 'CAPTURED' ? '#059669' : '#dc2626'}]}>{p.type === 'CREDIT' || p.status === 'CAPTURED' ? '+' : '-'}{(p.amount as number)?.toLocaleString()} ر.س</Text>
              <View style={[styles.pb, p.status === 'CAPTURED' ? styles.ps : styles.pp]}>
                <Text style={[styles.pbt, p.status === 'CAPTURED' ? {color:'#059669'} : {color:'#d97706'}]}>{p.status === 'CAPTURED' ? 'مكتمل' : p.status === 'PENDING' ? 'معلق' : p.status as string}</Text>
              </View>
            </View>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 6 },
  pn: { fontSize: 14, fontWeight: '600', color: '#111827' }, pd: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  pa: { fontSize: 16, fontWeight: '700' },
  pb: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 }, ps: { backgroundColor: '#dcfce7' }, pp: { backgroundColor: '#fef3c7' },
  pbt: { fontSize: 11, fontWeight: '600' },
});
