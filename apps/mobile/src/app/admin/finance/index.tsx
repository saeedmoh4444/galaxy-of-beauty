import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';

interface AdminFinanceDashboard {
  totalRevenue?: number;
  totalPayouts?: number;
  platformFees?: number;
}

export default function AdminFinanceScreen(): JSX.Element {
  const q = trpc.admin.dashboardStats.useQuery();
  const data = (q.data as unknown as AdminFinanceDashboard | null) ?? {};

  if (q.isLoading) return <SkeletonList count={4} />;
  if (q.isError)
    return <ErrorAlert message="فشل تحميل البيانات المالية" onRetry={() => q.refetch()} />;

  const d: AdminFinanceDashboard = data ?? {};

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#059669']}
        />
      }
    >
      <Text style={styles.t}> المالية</Text>
      <View style={styles.kpiRow}>
        <View style={styles.kpi}>
          <Text style={styles.kpiEmoji}></Text>
          <Text style={styles.kpiVal}>{(d.totalRevenue ?? 0).toLocaleString()}</Text>
          <Text style={styles.kpiLabel}>الإيرادات</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiEmoji}></Text>
          <Text style={[styles.kpiVal, { color: '#dc2626' }]}>
            {(d.totalPayouts ?? 0).toLocaleString()}
          </Text>
          <Text style={styles.kpiLabel}>المدفوعات</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiEmoji}></Text>
          <Text style={[styles.kpiVal, { color: '#059669' }]}>
            {(d.platformFees ?? 0).toLocaleString()}
          </Text>
          <Text style={styles.kpiLabel}>رسوم المنصة</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kpi: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  kpiEmoji: { fontSize: 28, marginBottom: 4 },
  kpiVal: { fontSize: 20, fontWeight: '800', color: '#111827' },
  kpiLabel: { fontSize: 11, color: '#9ca3af' },
});
