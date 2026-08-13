import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { LARGE_PAGE_SIZE } from '@galaxy/ui';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface CashbackInfo {
  balance?: number;
  totalBalance?: number;
  rate?: number;
}

interface CashbackTransaction {
  id?: number;
  amount?: number;
  createdAt: string;
}

interface CashbackHistory {
  items?: CashbackTransaction[];
}

export default function CashbackScreen(): JSX.Element {
  const [info, setInfo] = useState<CashbackInfo | null>(null);
  const [history, setHistory] = useState<CashbackHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    Promise.all([
      typedTrpc().cashback.info.query() as Promise<CashbackInfo>,
      typedTrpc().cashback.history.query({ page: 1, limit: LARGE_PAGE_SIZE }) as Promise<CashbackHistory>,
    ])
      .then(([i, h]) => {
        setInfo(i);
        setHistory(h);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);
  useEffect(() => {
    fetch();
  }, [fetch]);
  if (loading) return <SkeletonList count={3} />;
  const items = history?.items ?? [];
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#059669']}
        />
      }
    >
      <Text style={styles.t}> استرداد نقدي</Text>
      <View style={styles.br}>
        <View style={styles.bc}>
          <Text style={styles.bl}>رصيد الكاش باك</Text>
          <Text style={styles.ba}>{(info?.balance ?? 0)?.toLocaleString()} ر.س</Text>
        </View>
        <View style={styles.bc}>
          <Text style={styles.bl}>الرصيد الإجمالي</Text>
          <Text style={[styles.ba, { color: '#7c3aed' }]}>
            {(info?.totalBalance ?? 0)?.toLocaleString()} ر.س
          </Text>
        </View>
      </View>
      {items.map((t) => (
        <View key={t.id} style={styles.card}>
          <Text style={styles.em}></Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.ta}>+{t.amount?.toLocaleString()} ر.س</Text>
            <Text style={styles.td}>
              {new Date(t.createdAt).toLocaleDateString('ar-SA')}
            </Text>
          </View>
          <Text style={styles.tr}>{info?.rate ?? 5}%</Text>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  br: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  bc: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center' },
  bl: { fontSize: 11, color: '#6b7280' },
  ba: { fontSize: 20, fontWeight: '800', color: '#059669', marginTop: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  em: { fontSize: 24 },
  ta: { fontSize: 14, fontWeight: '700', color: '#059669' },
  td: { fontSize: 11, color: '#9ca3af' },
  tr: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
});
