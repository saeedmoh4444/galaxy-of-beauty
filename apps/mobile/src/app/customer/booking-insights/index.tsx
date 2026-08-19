import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface AnalyticsSummary {
  totalSpent?: number;
  totalBookings?: number;
}

interface CategoryStat {
  category?: string;
  pct?: number;
  spent?: number;
}

export default function BookingInsightsScreen(): JSX.Element {
  const { t } = useLocale();
  const analyticsQ = trpc.beautyAnalytics.summary.useQuery();
  const byCatQ = trpc.beautyAnalytics.byCategory.useQuery();
  if (analyticsQ.isLoading || byCatQ.isLoading) return <SkeletonList count={3} />;
  const s: AnalyticsSummary = (analyticsQ.data as unknown as AnalyticsSummary | null) ?? {};
  const totalSpent = s.totalSpent ?? 0;
  const totalBookings = s.totalBookings ?? 0;
  const avgPerBooking = totalBookings > 0 ? Math.round(totalSpent / totalBookings) : 0;
  const byCat = (byCatQ.data as CategoryStat[] | undefined) ?? [];
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={analyticsQ.isRefetching || byCatQ.isRefetching}
          onRefresh={() => {
            void analyticsQ.refetch();
            void byCatQ.refetch();
          }}
          colors={['#0891b2']}
        />
      }
    >
      <Text style={styles.t}>{t('bookingInsights.title')}</Text>
      <View style={styles.kr}>
        <View style={styles.k}>
          <Text style={styles.ke}></Text>
          <Text style={styles.kv}>{totalSpent.toLocaleString()}</Text>
          <Text style={styles.kl}>{t('bookingInsights.spent-label')}</Text>
        </View>
        <View style={styles.k}>
          <Text style={styles.ke}></Text>
          <Text style={[styles.kv, { color: '#2563eb' }]}>{totalBookings}</Text>
          <Text style={styles.kl}>{t('bookingInsights.booking-label')}</Text>
        </View>
        <View style={styles.k}>
          <Text style={styles.ke}></Text>
          <Text style={[styles.kv, { color: '#059669' }]}>{avgPerBooking.toLocaleString()}</Text>
          <Text style={styles.kl}>{t('bookingInsights.avg-label')}</Text>
        </View>
      </View>
      {byCat.length > 0 && (
        <View style={styles.sec}>
          <Text style={styles.st}>{t('bookingInsights.by-category')}</Text>
          {byCat.map((cat, i) => (
            <View key={i} style={styles.cr}>
              <Text style={styles.cn}>{cat.category}</Text>
              <View style={styles.cb}>
                <View style={[styles.cf, { width: `${cat.pct ?? 0}%` }]} />
              </View>
              <Text style={styles.cp}>{cat.pct}%</Text>
              <Text style={styles.cs}>
                {t('bookingInsights.amount', { value: cat.spent?.toLocaleString() ?? '' })}
              </Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.ic}>
        <Text style={styles.ie}></Text>
        <Text style={styles.it}>{t('bookingInsights.smart-tip')}</Text>
        <Text style={styles.ix}>
          {totalBookings < 5
            ? t('bookingInsights.tip-low')
            : avgPerBooking > 300
              ? t('bookingInsights.tip-quality')
              : t('bookingInsights.tip-package')}
        </Text>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 20 },
  kr: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  k: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  ke: { fontSize: 28, marginBottom: 4 },
  kv: { fontSize: 20, fontWeight: '800', color: '#111827' },
  kl: { fontSize: 10, color: '#9ca3af' },
  sec: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  cr: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cn: { width: 70, fontSize: 11, color: '#6b7280', textAlign: 'right' },
  cb: { flex: 1, height: 8, backgroundColor: '#f3f4f6', borderRadius: 4 },
  cf: { height: 8, backgroundColor: '#0891b2', borderRadius: 4 },
  cp: { width: 36, fontSize: 11, fontWeight: '600', color: '#111827' },
  cs: { width: 55, fontSize: 10, color: '#6b7280', textAlign: 'right' },
  ic: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
  ie: { fontSize: 36 },
  it: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 8 },
  ix: { fontSize: 13, color: '#6b7280', marginTop: 8, textAlign: 'center', lineHeight: 22 },
});
