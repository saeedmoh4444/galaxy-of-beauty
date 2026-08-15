import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';

const STATUS_COLORS: Record<string, string> = {
  healthy: '#059669',
  warning: '#d97706',
  error: '#dc2626',
};

interface ServiceHealth {
  status?: string;
  ping?: number;
}

interface HealthPerformance {
  avgResponseMs?: number;
  activeSessions?: number;
}

interface HealthReport {
  services?: Record<string, ServiceHealth>;
  performance?: HealthPerformance;
}

export default function MonitoringScreen(): JSX.Element {
  const q = trpc.monitoring.health.useQuery();
  const health = (q.data as unknown as HealthReport | null) ?? {};

  if (q.isLoading) return <SkeletonList count={5} />;
  if (q.isError) return <ErrorAlert message="فشل تحميل حالة الأنظمة" onRetry={() => q.refetch()} />;

  const services = (health.services ?? {}) as Record<string, ServiceHealth>;
  const perf = (health.performance ?? {}) as HealthPerformance;

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
      <Text style={styles.t}> Monitoring</Text>
      <Text style={styles.sectionTitle}> الخدمات</Text>
      <View style={styles.grid}>
        {Object.entries(services).map(([key, svc]) => (
          <View
            key={key}
            style={[styles.svcCard, { borderColor: STATUS_COLORS[svc.status ?? ''] ?? '#6b7280' }]}
          >
            <Text style={styles.svcEmoji}>{svc.status === 'healthy' ? '' : ''}</Text>
            <Text style={styles.svcKey}>{key}</Text>
            <Text style={styles.svcPing}>{svc.ping ?? 0}ms</Text>
          </View>
        ))}
      </View>
      <View style={styles.kpiRow}>
        <View style={styles.kpi}>
          <Text style={styles.kpiEmoji}></Text>
          <Text style={styles.kpiVal}>{perf.avgResponseMs ?? 0}ms</Text>
          <Text style={styles.kpiLabel}>الاستجابة</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiEmoji}></Text>
          <Text style={[styles.kpiVal, { color: '#2563eb' }]}>{perf.activeSessions ?? 0}</Text>
          <Text style={styles.kpiLabel}>جلسات</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  svcCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  svcEmoji: { fontSize: 24 },
  svcKey: { fontSize: 11, fontWeight: '600', color: '#111827', marginTop: 4 },
  svcPing: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  kpiRow: { flexDirection: 'row', gap: 8 },
  kpi: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  kpiEmoji: { fontSize: 28, marginBottom: 4 },
  kpiVal: { fontSize: 20, fontWeight: '800', color: '#111827' },
  kpiLabel: { fontSize: 11, color: '#9ca3af' },
});
