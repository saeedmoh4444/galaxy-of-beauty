import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface FeatureFlag {
  id?: number;
  key: string;
  nameAr?: string;
  rolloutPercent?: number;
  enabled?: boolean;
}

export default function FeatureFlagsScreen(): JSX.Element {
  const [data, setData] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().featureFlags.list.query() as unknown as Promise<FeatureFlag[]>)
      .then((d: FeatureFlag[]) => {
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

  const toggle = (key: string) => {
    typedTrpc().featureFlags.toggle.mutate({ flagKey: key }).then(() => fetch());
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
          colors={['#6366f1']}
        />
      }
    >
      <Text style={styles.t}> Feature Flags</Text>
      {data.map((f, i) => (
        <View key={i} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{f.nameAr ?? f.key}</Text>
            <Text style={styles.meta}>{f.rolloutPercent ?? 0}%</Text>
          </View>
          <TouchableOpacity
            onPress={() => toggle(f.key)}
            style={[styles.toggle, f.enabled ? styles.on : styles.off]}
          >
            <Text style={styles.toggleText}>{f.enabled ? 'مفعل' : 'معطل'}</Text>
          </TouchableOpacity>
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
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  toggle: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  on: { backgroundColor: '#dcfce7' },
  off: { backgroundColor: '#f3f4f6' },
  toggleText: { fontSize: 12, fontWeight: '600' },
});
