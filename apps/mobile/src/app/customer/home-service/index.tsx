import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';
import { DEFAULT_SAUDI_CITY } from '@galaxy/shared';

interface HomeServiceEstimate {
  totalEstimate?: number;
  estimatedDuration?: string;
}

export default function HomeServiceScreen(): JSX.Element {
  const [estimate, setEstimate] = useState<HomeServiceEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    typedTrpc()
      .homeService.estimate.query({ city: DEFAULT_SAUDI_CITY /* TODO: use user location */ })
      .then((d: HomeServiceEstimate) => {
        setEstimate(d);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);
  if (loading) return <SkeletonList count={3} />;
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
      <Text style={styles.t}> خدمة منزلية</Text>
      <TouchableOpacity onPress={() => fetch(false)} style={styles.btn}>
        <Text style={styles.bt}> تقدير التكلفة — الرياض</Text>
      </TouchableOpacity>
      {estimate && (
        <View style={styles.card}>
          <Text style={styles.ep}>{(estimate.totalEstimate ?? 0).toLocaleString()} ر.س</Text>
          <Text style={styles.em}>️ {estimate.estimatedDuration ?? ''}</Text>
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  btn: {
    backgroundColor: '#059669',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
  ep: { fontSize: 28, fontWeight: '800', color: '#059669' },
  em: { fontSize: 14, color: '#6b7280', marginTop: 4 },
});
