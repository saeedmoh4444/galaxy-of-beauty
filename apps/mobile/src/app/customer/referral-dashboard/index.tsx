import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

interface ReferralDashboardData {
  totalReferred?: number;
  totalEarned?: number;
}

export default function ReferralDashboardScreen(): JSX.Element {
  const statsQ = trpc.referrals.getStats.useQuery();

  if (statsQ.isLoading) return <SkeletonList count={3} />;

  const d: ReferralDashboardData = (statsQ.data as unknown as ReferralDashboardData) ?? {};

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={statsQ.isRefetching}
          onRefresh={() => statsQ.refetch()}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}> لوحة الإحالات</Text>
      <View style={styles.kpiRow}>
        <View style={styles.kpi}>
          <Text style={styles.kpiEmoji}>‍️</Text>
          <Text style={styles.kpiVal}>{d.totalReferred ?? 0}</Text>
          <Text style={styles.kpiLabel}>إحالة</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiEmoji}></Text>
          <Text style={[styles.kpiVal, { color: '#059669' }]}>
            {(d.totalEarned ?? 0).toLocaleString()}
          </Text>
          <Text style={styles.kpiLabel}>ر.س</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  kpiRow: { flexDirection: 'row', gap: 8 },
  kpi: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  kpiEmoji: { fontSize: 28, marginBottom: 4 },
  kpiVal: { fontSize: 20, fontWeight: '800', color: '#111827' },
  kpiLabel: { fontSize: 11, color: '#9ca3af' },
});
