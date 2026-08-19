import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface TodayHealthData {
  water?: number;
  sleep?: number;
  steps?: number;
}

export default function WellnessTrackerScreen(): JSX.Element {
  const { t } = useLocale();
  const todayQ = trpc.wellnessTracker.today.useQuery();
  if (todayQ.isLoading) return <SkeletonList count={3} />;
  const d: TodayHealthData = (todayQ.data as unknown as TodayHealthData) ?? {};
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={todayQ.isRefetching}
          onRefresh={() => todayQ.refetch()}
          colors={['#059669']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.wellnessTracker.title')}</Text>
      <View style={styles.kpiRow}>
        <View style={styles.kpi}>
          <Text style={styles.kpiEmoji}></Text>
          <Text style={styles.kpiVal}>{d.water ?? 0}</Text>
          <Text style={styles.kpiLabel}>{t('mobile.wellnessTracker.cups')}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiEmoji}></Text>
          <Text style={[styles.kpiVal, { color: '#2563eb' }]}>{d.sleep ?? 0}h</Text>
          <Text style={styles.kpiLabel}>{t('mobile.wellnessTracker.sleep')}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiEmoji}></Text>
          <Text style={[styles.kpiVal, { color: '#059669' }]}>{d.steps ?? 0}</Text>
          <Text style={styles.kpiLabel}>{t('mobile.wellnessTracker.steps')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  kpiRow: { flexDirection: 'row', gap: 8 },
  kpi: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  kpiEmoji: { fontSize: 28, marginBottom: 4 },
  kpiVal: { fontSize: 20, fontWeight: '800', color: '#111827' },
  kpiLabel: { fontSize: 11, color: '#9ca3af' },
});
