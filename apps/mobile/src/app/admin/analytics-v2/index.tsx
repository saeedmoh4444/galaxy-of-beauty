import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface AnalyticsKpi {
  today?: number;
  week?: number;
  month?: number;
  growth?: number;
  chart?: number[];
}

interface TopService {
  name?: string;
  bookings?: number;
  revenue?: number;
  growth?: number;
}

interface AnalyticsData {
  revenue?: AnalyticsKpi;
  bookings?: AnalyticsKpi;
  users?: Record<string, number>;
  technicians?: Record<string, number>;
  topServices?: TopService[];
  forecast?: Record<string, number>;
}

export default function AdminAnalyticsV2Screen(): JSX.Element {
  const { t } = useLocale();
  const q = trpc.adminAnalyticsV2.dashboard.useQuery();
  const data = (q.data as unknown as AnalyticsData | null) ?? {};

  if (q.isLoading) return <SkeletonList count={5} />;
  if (q.isError)
    return (
      <ErrorAlert message={t('mobile.admin.analytics.load-error')} onRetry={() => q.refetch()} />
    );

  const d = data ?? {};
  const revenue = d.revenue ?? {};
  const bookings = d.bookings ?? {};
  const top = d.topServices ?? [];

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
      <Text style={styles.t}>{t('admin.analytics-v2.title')}</Text>
      <View style={styles.kpiRow}>
        <View style={styles.kpi}>
          <Text style={styles.kpiEmoji}></Text>
          <Text style={styles.kpiVal}>{(revenue.today ?? 0)?.toLocaleString()}</Text>
          <Text style={styles.kpiLabel}>{t('admin.analytics-v2.revenue-today')}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiEmoji}></Text>
          <Text style={[styles.kpiVal, { color: '#2563eb' }]}>{bookings.today ?? 0}</Text>
          <Text style={styles.kpiLabel}>{t('admin.analytics-v2.bookings-today')}</Text>
        </View>
      </View>
      {top.length > 0 && (
        <Text style={styles.sectionTitle}>{t('mobile.admin.analytics-v2.top')}</Text>
      )}
      {top.map((s, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.rank}>#{i + 1}</Text>
          <Text style={styles.name}>{s.name}</Text>
          <Text style={styles.stat}>
            {t('admin.analytics-v2.bookings-count', { count: s.bookings ?? 0 })}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  kpi: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  kpiEmoji: { fontSize: 28, marginBottom: 4 },
  kpiVal: { fontSize: 20, fontWeight: '800', color: '#111827' },
  kpiLabel: { fontSize: 11, color: '#9ca3af' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
  },
  rank: { fontSize: 12, fontWeight: '700', color: '#4f46e5', width: 28 },
  name: { flex: 1, fontSize: 13, fontWeight: '600', color: '#111827' },
  stat: { fontSize: 12, color: '#6b7280' },
});
