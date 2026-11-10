import type { JSX } from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { sumSeries, barHeights, deltaPct } from '@/utils/vendorAnalytics';

const RANGES = [7, 30, 90] as const;

/**
 * D1 (SELLER_FIRST_CLASS_ROLE_PLAN) — the seller analytics mirror on
 * mobile: the same read-model the web analytics tab uses (daily series,
 * top products, storefront funnel), rendered dependency-free.
 */
export default function VendorAnalyticsScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const isAuthed = useAuthState();
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);

  const q = trpc.vendorPortal.analyticsSeries.useQuery({ days }, { enabled: isAuthed });
  const funnelQ = trpc.vendorPortal.funnel.useQuery(undefined, { enabled: isAuthed });

  const series = q.data?.series ?? [];
  const topProducts = q.data?.topProducts ?? [];
  const totalRevenue = sumSeries(series, 'revenue');
  const totalOrders = sumSeries(series, 'orders');
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const heights = barHeights(series, 'revenue');

  const half = Math.ceil(series.length / 2);
  const firstHalf = series.slice(0, half);
  const secondHalf = series.slice(half);
  const revenueDelta = deltaPct(sumSeries(secondHalf, 'revenue'), sumSeries(firstHalf, 'revenue'));

  const num = (n: number) => n.toLocaleString(locale === 'en' ? 'en-GB' : 'ar-SA');

  return (
    <ScreenState
      isLoading={isAuthed && q.isLoading}
      isError={!!q.error}
      isEmpty={false}
      errorMessage={q.error?.message}
    >
      <ScrollView
        style={styles.s}
        contentContainerStyle={styles.c}
        refreshControl={
          <RefreshControl
            refreshing={q.isRefetching || funnelQ.isRefetching}
            onRefresh={() => {
              void q.refetch();
              void funnelQ.refetch();
            }}
            colors={['#c2255c']}
          />
        }
      >
        <Text style={styles.title}>{t('mobile.vendorPortal.analytics.title')}</Text>

        {/* Range toggle — same 7/30/90 windows as the web panel. */}
        <View style={styles.rangeRow}>
          {RANGES.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.rangeBtn, days === d && styles.rangeBtnActive]}
              onPress={() => setDays(d)}
              accessibilityRole="button"
              accessibilityState={{ selected: days === d }}
            >
              <Text style={[styles.rangeText, days === d && styles.rangeTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KPI tiles. */}
        <View style={styles.kpiRow}>
          <View style={styles.kpi}>
            <Text style={styles.kpiValue}>{num(totalRevenue)}</Text>
            <Text style={styles.kpiLabel}>{t('mobile.vendorPortal.analytics.revenue')}</Text>
            {revenueDelta ? <Text style={styles.kpiDelta}>{revenueDelta}</Text> : null}
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiValue}>{num(totalOrders)}</Text>
            <Text style={styles.kpiLabel}>{t('mobile.vendorPortal.analytics.orders')}</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiValue}>{num(avgOrder)}</Text>
            <Text style={styles.kpiLabel}>{t('mobile.vendorPortal.analytics.aov')}</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiValue}>
              {((funnelQ.data?.conversion ?? 0) * 100).toFixed(1)}%
            </Text>
            <Text style={styles.kpiLabel}>{t('mobile.vendorPortal.analytics.conversion')}</Text>
          </View>
        </View>

        {/* Revenue bars — one bar per day, normalized 4–100. */}
        {heights.length > 0 ? (
          <View style={styles.chart}>
            {heights.map((h, i) => (
              <View key={`${series[i]?.day ?? i}`} style={styles.barCol}>
                <View style={[styles.bar, { height: `${h}%` }]} />
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>{t('mobile.vendorPortal.analytics.empty')}</Text>
        )}

        {/* Top products by units sold. */}
        {topProducts.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('mobile.vendorPortal.analytics.topProducts')}
            </Text>
            {topProducts.map((p) => (
              <View key={p.productId} style={styles.productRow}>
                <Text style={styles.productName} numberOfLines={1}>
                  {p.nameAr}
                </Text>
                <Text style={styles.productQty}>
                  {num(p.quantity)} {t('mobile.vendorPortal.analytics.units')}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  s: { flex: 1, backgroundColor: '#fff' },
  c: { padding: 16, gap: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#111' },
  rangeRow: { flexDirection: 'row', gap: 8 },
  rangeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#f1f3f5',
  },
  rangeBtnActive: { backgroundColor: '#c2255c' },
  rangeText: { color: '#495057', fontWeight: '600' },
  rangeTextActive: { color: '#fff' },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kpi: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  kpiValue: { fontSize: 20, fontWeight: '800', color: '#111' },
  kpiLabel: { fontSize: 12, color: '#868e96', marginTop: 2 },
  kpiDelta: { fontSize: 12, color: '#059669', marginTop: 2, fontWeight: '700' },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 120,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  barCol: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { backgroundColor: '#c2255c', borderRadius: 4, minHeight: 4 },
  empty: { color: '#868e96', textAlign: 'center', paddingVertical: 24 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  productName: { flex: 1, color: '#212529', fontWeight: '600' },
  productQty: { color: '#868e96', fontSize: 12 },
});
