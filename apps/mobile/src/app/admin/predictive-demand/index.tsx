import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

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
  const [data, setData] = useState<DemandForecast>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().predictiveDemand.forecast.query() as Promise<DemandForecast>)
      .then((d: DemandForecast) => {
        setData(d || {});
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
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}> توقعات الطلب</Text>
      <View style={styles.kpi}>
        <Text style={styles.kpiTitle}> الأسبوع القادم</Text>
        <Text style={styles.kpiVal}>{nw.predictedBookings ?? 0} حجز</Text>
        <Text style={styles.kpiMeta}>الذروة: {nw.peakDay ?? ''}</Text>
      </View>
      <View style={styles.kpi}>
        <Text style={styles.kpiTitle}> الشهر القادم</Text>
        <Text style={[styles.kpiVal, { color: '#059669' }]}>
          {nm.predictedBookings ?? 0} حجز
        </Text>
        <Text style={styles.kpiMeta}>
          ثقة {nm.confidence ?? 0}% · نمو +{nm.growth ?? 0}%
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
