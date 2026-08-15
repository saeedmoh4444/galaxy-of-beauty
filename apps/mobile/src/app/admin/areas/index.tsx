import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface Area {
  id: number;
  nameAr?: string;
  nameEn?: string;
}

export default function AdminAreasScreen(): JSX.Element {
  const [data, setData] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().platform.listAreas.query({}) as unknown as Promise<Area[]>)
      .then((d: Area[]) => {
        setData(d || []);
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

  const remove = (id: number) => {
    typedTrpc().platform.deleteArea.mutate({ id }).then(() => fetch());
  };

  if (loading) return <SkeletonList count={5} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#0891b2']}
        />
      }
    >
      <Text style={styles.t}> المناطق</Text>
      {data.map((a, i) => (
        <View key={i} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{a.nameAr ?? ''}</Text>
            <Text style={styles.meta}>{a.nameEn ?? ''}</Text>
          </View>
          <TouchableOpacity onPress={() => remove(a.id)}>
            <Text style={styles.del}>️</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  del: { fontSize: 20 },
});
