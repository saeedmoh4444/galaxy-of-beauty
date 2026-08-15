import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface FollowEntry {
  id?: number;
  technicianId: number;
  createdAt?: string;
}

export default function FollowingScreen(): JSX.Element {
  const [follows, setFollows] = useState<FollowEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().technicianFollows.myFollows.query() as Promise<FollowEntry[]>)
      .then((d) => {
        setFollows(d || []);
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
  const unfollow = (technicianId: number) => {
    (typedTrpc().technicianFollows.unfollow.mutate({ technicianId }) as Promise<unknown>).then(() => fetch());
  };
  if (loading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>‍ متابعة الفنيات</Text>
      {follows.map((f) => (
        <View key={f.technicianId} style={styles.card}>
          <Text style={styles.av}>‍</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.nm}>فنية #{f.technicianId}</Text>
            <Text style={styles.meta}>
              منذ {f.createdAt ? new Date(f.createdAt).toLocaleDateString('ar-SA') : ''}
            </Text>
          </View>
          <TouchableOpacity onPress={() => unfollow(f.technicianId)} style={styles.ub}>
            <Text style={styles.ut}>إلغاء المتابعة</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  av: { fontSize: 36 },
  nm: { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  ub: { backgroundColor: '#fee2e2', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  ut: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
});
