import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface AdminService {
  id?: number;
  emoji?: string;
  titleJson?: { ar?: string };
  basePrice?: number;
}

interface ServicesListResponse {
  items?: AdminService[];
}

export default function AdminServicesScreen(): JSX.Element {
  const [data, setData] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    typedTrpc()
      .services.list.query({})
      .then((d: ServicesListResponse) => {
        setData(d?.items || []);
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

  if (loading) return <SkeletonList count={6} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#6366f1']}
        />
      }
    >
      <Text style={styles.t}>‍️ الخدمات</Text>
      {data.map((s, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}>{s.emoji ?? '‍️'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{s.titleJson?.ar ?? ''}</Text>
            <Text style={styles.price}>{(s.basePrice ?? 0).toLocaleString()} ر.س</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  emoji: { fontSize: 28 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  price: { fontSize: 13, fontWeight: '700', color: '#059669', marginTop: 2 },
});
