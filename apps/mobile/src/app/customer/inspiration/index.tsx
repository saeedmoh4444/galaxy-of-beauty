import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface InspirationPin {
  id?: number;
  imageUrl?: string;
  title?: string;
}

export default function InspirationScreen(): JSX.Element {
  const [pins, setPins] = useState<InspirationPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().inspiration.list.query() as Promise<InspirationPin[]>)
      .then((d) => {
        setPins(d || []);
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
    (typedTrpc().inspiration.delete.mutate({ id }) as Promise<unknown>).then(() => fetch());
  };
  if (loading) return <SkeletonList count={6} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}> لوحة الإلهام</Text>
      <View style={styles.grid}>
        {pins.map((p) => (
          <View key={p.id} style={styles.card}>
            {p.imageUrl ? (
              <Image source={{ uri: p.imageUrl }} style={styles.img} />
            ) : (
              <View style={styles.ph}>
                <Text style={{ fontSize: 36 }}>️</Text>
              </View>
            )}
            <View style={styles.cb}>
              <Text style={styles.pt}>{p.title ?? ''}</Text>
              <TouchableOpacity onPress={() => remove(p.id)}>
                <Text>️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  img: { width: '100%', height: 120 },
  ph: {
    width: '100%',
    height: 120,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cb: { padding: 10 },
  pt: { fontSize: 13, fontWeight: '600', color: '#111827' },
});
