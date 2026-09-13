import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface ForecastWindow {
  predictedBookings?: number;
  peakDay?: string;
  confidence?: number;
  growth?: number;
}

interface ServiceDemand {
  name?: string;
  currentDemand?: number;
  trend?: string;
  prediction?: string;
}

interface DemandForecast {
  nextWeek?: ForecastWindow;
  nextMonth?: ForecastWindow;
  byService?: ServiceDemand[];
}

export default function PredictiveDemandScreen(): JSX.Element {
  const { t } = useLocale();
  const q = trpc.predictiveDemand.forecast.useQuery();
  const data = (q.data as unknown as DemandForecast | null) ?? {};

  if (q.isLoading) return <SkeletonList count={4} />;
  if (q.isError)
    return (
      <ErrorAlert
        message={t('mobile.admin.predictive-demand.load-error')}
        onRetry={() => q.refetch()}
      />
    );

  const f = data ?? {};
  const nw = f.nextWeek ?? {};
  const nm = f.nextMonth ?? {};
  const bySvc = f.byService ?? [];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>{t('admin.predictive-demand.title')}</Text>
      <View style={styles.kpi}>
        <Text style={styles.kpiTitle}>{t('admin.predictive-demand.next-week')}</Text>
        <Text style={styles.kpiVal}>
          {t('admin.predictive-demand.bookings-count', { count: nw.predictedBookings ?? 0 })}
        </Text>
        <Text style={styles.kpiMeta}>
          {t('admin.predictive-demand.peak', { peak: nw.peakDay ?? '' })}
        </Text>
      </View>
      <View style={styles.kpi}>
        <Text style={styles.kpiTitle}>{t('admin.predictive-demand.next-month')}</Text>
        <Text style={[styles.kpiVal, { color: '#059669' }]}>
          {t('admin.predictive-demand.bookings-count', { count: nm.predictedBookings ?? 0 })}
        </Text>
        <Text style={styles.kpiMeta}>
          {t('admin.predictive-demand.confidence-growth', {
            confidence: nm.confidence ?? 0,
            growth: nm.growth ?? 0,
          })}
        </Text>
      </View>
      {bySvc.map((s, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.svcName}>{s.name ?? ''}</Text>
          <Text style={styles.svcDemand}>{s.currentDemand ?? 0}%</Text>
          <Text
            style={[
              styles.svcTrend,
              { color: s.trend === 'up' ? '#059669' : s.trend === 'down' ? '#dc2626' : '#6b7280' },
            ]}
          >
            {s.prediction ?? ''}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 16 },
  kpi: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10 },
  kpiTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 6 },
  kpiVal: { fontSize: 22, fontWeight: '800', color: '#7c3aed' },
  kpiMeta: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
  },
  svcName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#111827' },
  svcDemand: { fontSize: 12, color: '#6b7280' },
  svcTrend: { fontSize: 12, fontWeight: '600' },
});
