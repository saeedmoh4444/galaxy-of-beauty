import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

const TL: Record<string, { name: string; emoji: string; color: string }> = {
  SILVER: { name: 'الفضية', emoji: '', color: '#9ca3af' },
  GOLD: { name: 'الذهبية', emoji: '', color: '#f59e0b' },
  PLATINUM: { name: 'البلاتينية', emoji: '', color: '#7c3aed' },
};

export default function RewardsScreen(): JSX.Element {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().loyalty.rewards.query() as any)
      .then((d: any) => {
        setRewards(d || []);
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
  if (loading) return <SkeletonList count={4} />;
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
      <Text style={styles.t}> برنامج المكافآت</Text>
      <View style={styles.tr}>
        {Object.entries(TL).map(([key, t]) => (
          <View
            key={key}
            style={[styles.tc, { backgroundColor: t.color + '20', borderColor: t.color }]}
          >
            <Text style={styles.te}>{t.emoji}</Text>
            <Text style={[styles.tn, { color: t.color }]}>{t.name}</Text>
          </View>
        ))}
      </View>
      {rewards.map((r: any) => (
        <View key={r.id} style={styles.card}>
          <Text style={styles.re}>{(r.emoji as string) ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.rn}>{(r.nameAr as string) ?? (r.titleAr as string)}</Text>
            <Text style={styles.rd}>{r.descAr as string}</Text>
          </View>
          <Text style={styles.rp}>
            {((r.pointsCost as number) ?? (r.points as number))?.toLocaleString()} نقطة
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 20 },
  tr: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  tc: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 2 },
  te: { fontSize: 28 },
  tn: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  re: { fontSize: 30 },
  rn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  rd: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  rp: { fontSize: 14, fontWeight: '700', color: '#d97706' },
});
