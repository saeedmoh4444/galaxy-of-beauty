import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface DisputeItem {
  status?: string;
  reason?: string;
  createdAt?: string;
}

export default function AdminDisputesScreen(): JSX.Element {
  const [data, setData] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    typedTrpc().disputes.list.query({}).then((d) => {
        setData((d?.items ?? []) as unknown as DisputeItem[]);
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

  if (loading) return <SkeletonList count={5} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#dc2626']}
        />
      }
    >
      <Text style={styles.t}>️ النزاعات</Text>
      {data.map((d, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.status}>{d.status}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.reason}>{d.reason}</Text>
            <Text style={styles.date}>
              {new Date(d.createdAt ?? '').toLocaleDateString('ar-SA')}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fef2f2' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#dc2626', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  reason: { fontSize: 13, fontWeight: '600', color: '#111827' },
  date: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
});
