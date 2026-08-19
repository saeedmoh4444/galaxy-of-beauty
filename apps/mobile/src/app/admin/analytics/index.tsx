import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface AdminDashboard {
  totalUsers?: number;
  totalBookings?: number;
  totalRevenue?: number;
}

export default function AdminAnalyticsScreen(): JSX.Element {
  const { t } = useLocale();
  const q = trpc.admin.dashboardStats.useQuery();
  const data = (q.data as unknown as AdminDashboard | null) ?? {};

  if (q.isLoading) return <SkeletonList count={4} />;
  if (q.isError)
    return (
      <ErrorAlert message={t('mobile.admin.analytics.load-error')} onRetry={() => q.refetch()} />
    );

  const d: AdminDashboard = data ?? {};

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#6366f1']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.admin.analytics.title')}</Text>
      <View style={styles.kpiRow}>
        <View style={styles.kpi}>
          <Text style={styles.kpiEmoji}></Text>
          <Text style={styles.kpiVal}>{d.totalUsers ?? 0}</Text>
          <Text style={styles.kpiLabel}>{t('mobile.admin.analytics.users')}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiEmoji}></Text>
          <Text style={[styles.kpiVal, { color: '#2563eb' }]}>{d.totalBookings ?? 0}</Text>
          <Text style={styles.kpiLabel}>{t('mobile.admin.analytics.bookings')}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiEmoji}></Text>
          <Text style={[styles.kpiVal, { color: '#059669' }]}>
            {(d.totalRevenue ?? 0).toLocaleString()}
          </Text>
          <Text style={styles.kpiLabel}>{t('misc.sar')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
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
