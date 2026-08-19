import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface AnalyticsSummary {
  totalBookings: number;
  completedBookings: number;
  completionRate: number;
  totalSpent: number;
}

interface CategoryCount {
  category: string;
  pct: number;
  count: number;
}

interface MonthlyTrend {
  month: string;
  count: number;
}

export default function BeautyAnalyticsScreen(): JSX.Element {
  const { t } = useLocale();
  const summaryQ = trpc.beautyAnalytics.summary.useQuery();
  const byCatQ = trpc.beautyAnalytics.byCategory.useQuery();
  const trendQ = trpc.beautyAnalytics.monthlyTrend.useQuery();

  if (summaryQ.isLoading || byCatQ.isLoading || trendQ.isLoading) return <SkeletonList count={4} />;
  const s = (summaryQ.data as unknown as AnalyticsSummary | null) ?? {
    totalBookings: 0,
    completedBookings: 0,
    completionRate: 0,
    totalSpent: 0,
  };
  const byCat = (byCatQ.data as CategoryCount[] | undefined) ?? [];
  const trend = (trendQ.data as MonthlyTrend[] | undefined) ?? [];
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={summaryQ.isRefetching || byCatQ.isRefetching || trendQ.isRefetching}
          onRefresh={() => {
            void summaryQ.refetch();
            void byCatQ.refetch();
            void trendQ.refetch();
          }}
          colors={['#8b5cf6']}
        />
      }
    >
      <Text style={styles.t}>{t('beautyAnalytics.title')}</Text>
      <View style={styles.kr}>
        <View style={styles.k}>
          <Text style={styles.ke}></Text>
          <Text style={styles.kv}>{s.totalBookings}</Text>
          <Text style={styles.kl}>{t('beautyAnalytics.bookings')}</Text>
        </View>
        <View style={styles.k}>
          <Text style={styles.ke}></Text>
          <Text style={[styles.kv, { color: '#059669' }]}>{s.completedBookings}</Text>
          <Text style={styles.kl}>{t('beautyAnalytics.completed')}</Text>
        </View>
        <View style={styles.k}>
          <Text style={styles.ke}></Text>
          <Text style={[styles.kv, { color: '#2563eb' }]}>{s.completionRate}%</Text>
          <Text style={styles.kl}>{t('beautyAnalytics.rate')}</Text>
        </View>
        <View style={styles.k}>
          <Text style={styles.ke}></Text>
          <Text style={[styles.kv, { color: '#7c3aed' }]}>{s.totalSpent?.toLocaleString()}</Text>
          <Text style={styles.kl}>{t('beautyAnalytics.currency')}</Text>
        </View>
      </View>
      {byCat.length > 0 && (
        <View style={styles.sec}>
          <Text style={styles.st}>{t('beautyAnalytics.by-category')}</Text>
          {byCat.map((cat, i) => (
            <View key={i} style={styles.cr}>
              <Text style={styles.cn}>{cat.category}</Text>
              <View style={styles.cb}>
                <View style={[styles.cf, { width: `${cat.pct}%` }]} />
              </View>
              <Text style={styles.cc}>{cat.count}</Text>
            </View>
          ))}
        </View>
      )}
      {trend.length > 0 && (
        <View style={styles.sec}>
          <Text style={styles.st}>{t('beautyAnalytics.monthly-trend')}</Text>
          <View style={styles.tr}>
            {trend.map((m, i) => (
              <View key={i} style={styles.tb}>
                <Text style={styles.tc}>{m.count}</Text>
                <View
                  style={[
                    styles.tf,
                    {
                      height: `${(m.count / Math.max(1, ...trend.map((x) => x.count))) * 80}%`,
                    },
                  ]}
                />
                <Text style={styles.tm}>{m.month}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  kr: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  k: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  ke: { fontSize: 28, marginBottom: 4 },
  kv: { fontSize: 24, fontWeight: '800', color: '#111827' },
  kl: { fontSize: 11, color: '#9ca3af' },
  sec: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  cr: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cn: { width: 70, fontSize: 12, color: '#6b7280', textAlign: 'right' },
  cb: { flex: 1, height: 8, backgroundColor: '#f3f4f6', borderRadius: 4 },
  cf: { height: 8, backgroundColor: '#8b5cf6', borderRadius: 4 },
  cc: { width: 30, fontSize: 12, fontWeight: '600', color: '#111827' },
  tr: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 140,
    paddingTop: 10,
  },
  tb: { alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
  tc: { fontSize: 11, fontWeight: '600', color: '#111827', marginBottom: 2 },
  tf: { width: 24, backgroundColor: '#8b5cf6', borderRadius: 4, minHeight: 4 },
  tm: { fontSize: 10, color: '#9ca3af', marginTop: 4 },
});
