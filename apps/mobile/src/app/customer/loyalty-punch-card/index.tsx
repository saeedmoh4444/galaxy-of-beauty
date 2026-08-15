import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { rawTrpc } from '@/lib/trpc-react';

interface PunchCardStatus {
  punches?: number;
  total?: number;
}

export default function LoyaltyPunchCardScreen(): JSX.Element {
  const [data, setData] = useState<PunchCardStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    rawTrpc.loyaltyPunchCard.myCard
      .query()
      .then((d: PunchCardStatus) => {
        setData(d);
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

  const punches = data?.punches ?? 0;
  const total = data?.total ?? 10;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#f59e0b']}
        />
      }
    >
      <Text style={styles.t}> بطاقة الولاء</Text>
      <View style={styles.card}>
        <Text style={styles.count}>
          {punches}/{total}
        </Text>
        <View style={styles.grid}>
          {Array.from({ length: total }, (_, i) => (
            <View key={i} style={[styles.punch, i < punches && styles.punched]}>
              <Text style={styles.punchText}>{i < punches ? '' : '○'}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' },
  i: { padding: 16, paddingTop: 30, alignItems: 'center', paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  count: { fontSize: 28, fontWeight: '800', color: '#d97706', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  punch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  punched: { backgroundColor: '#fef3c7', borderWidth: 2, borderColor: '#f59e0b' },
  punchText: { fontSize: 16 },
});
