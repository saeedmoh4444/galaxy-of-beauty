import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface ReportRow {
  name?: string;
  bookings?: number;
}

interface DashboardData {
  topTechs?: ReportRow[];
  byService?: ReportRow[];
}

export default function AdminReportsScreen(): JSX.Element {
  const { t } = useLocale();
  const q = trpc.adminReports.dashboard.useQuery();
  const data = (q.data as unknown as DashboardData | null) ?? {};

  if (q.isLoading) return <SkeletonList count={5} />;
  if (q.isError)
    return (
      <ErrorAlert message={t('mobile.admin.reports.load-error')} onRetry={() => q.refetch()} />
    );

  const d = data ?? {};
  const topTechs = d.topTechs ?? [];
  const byService = d.byService ?? [];

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
      <Text style={styles.t}>{t('admin.reports.title')}</Text>
      {topTechs.length > 0 && (
        <Text style={styles.st}>{t('mobile.admin.reports.top-technicians')}</Text>
      )}
      {topTechs.map((row, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.r}>#{i + 1}</Text>
          <Text style={styles.n}>{row.name}</Text>
          <Text style={styles.s}>
            {t('admin.reports.bookings-count', { count: row.bookings ?? 0 })}
          </Text>
        </View>
      ))}
      {byService.length > 0 && <Text style={styles.st}>{t('admin.reports.by-service')}</Text>}
      {byService.map((svc, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.r}>#{i + 1}</Text>
          <Text style={styles.n}>{svc.name}</Text>
          <Text style={styles.s}>
            {t('admin.reports.bookings-count', { count: svc.bookings ?? 0 })}
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
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
  },
  r: { fontSize: 12, fontWeight: '700', color: '#4f46e5', width: 28 },
  n: { flex: 1, fontSize: 13, fontWeight: '600', color: '#111827' },
  s: { fontSize: 12, color: '#6b7280' },
});
