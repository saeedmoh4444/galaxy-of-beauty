import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function BirthdayRewardsScreen(): JSX.Element {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    ((trpc as any).birthdayRewards.status.query() as any)
      .then((d: any) => {
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
      <Text style={styles.t}>🎂 مكافآت الميلاد</Text>
      {data ? (
        <View style={styles.card}>
          <Text style={styles.emoji}>🎁</Text>
          <Text style={styles.reward}>{data.rewardName as string}</Text>
          <Text style={styles.code}>كود: {data.promoCode as string}</Text>
          <TouchableOpacity style={styles.claimBtn}>
            <Text style={styles.claimText}>استلام</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.e}>لا توجد مكافآت</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbcfe8',
  },
  emoji: { fontSize: 48 },
  reward: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 8 },
  code: {
    fontSize: 14,
    fontWeight: '600',
    color: '#db2777',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  claimBtn: {
    backgroundColor: '#db2777',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 16,
  },
  claimText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
