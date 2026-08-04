import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { EXTENDED_PAGE_SIZE } from '@galaxy/ui';

export default function InvoicesScreen(): JSX.Element {
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
      <Text style={styles.t}>🧾 الفواتير</Text>
      {data.length === 0 ? <Text style={styles.e}>لا توجد فواتير</Text> :
        data.map((inv: any, i: number) => (
          <View key={i} style={styles.card}>
            <View style={{flex:1}}>
              <Text style={styles.invNum}>{inv.invoiceNumber as string ?? `#${i + 1}`}</Text>
              <Text style={styles.invDate}>{new Date(inv.createdAt as string ?? Date.now()).toLocaleDateString('ar-SA')}</Text>
            </View>
            <View style={{alignItems:'flex-end'}}>
              <Text style={styles.invAmt}>{(inv.totalAmount as number ?? inv.amount as number)?.toLocaleString()} ر.س</Text>
              <View style={[styles.invBadge, inv.status === 'PAID' ? styles.paid : styles.pending]}>
                <Text style={[styles.invBt, inv.status === 'PAID' ? {color:'#059669'} : {color:'#d97706'}]}>{inv.status === 'PAID' ? 'مدفوع' : 'معلق'}</Text>
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
  invNum: { fontSize: 14, fontWeight: '600', color: '#111827', fontFamily: 'monospace' }, invDate: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  invAmt: { fontSize: 16, fontWeight: '700', color: '#0891b2' },
  invBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 }, paid: { backgroundColor: '#dcfce7' }, pending: { backgroundColor: '#fef3c7' },
  invBt: { fontSize: 11, fontWeight: '600' },
});
