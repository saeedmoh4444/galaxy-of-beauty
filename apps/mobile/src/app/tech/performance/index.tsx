import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

function monthShort(month: string | undefined, locale: string): string {
  if (!month) return '';
  const d = new Date(`${month}-01T00:00:00`);
  return isNaN(d.getTime())
    ? month
    : d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', { month: 'short' });
}

export default function TechPerformanceScreen(): JSX.Element {
  const { locale, t } = useLocale();
  // Mirrors the web page: performance.myDashboard (technician stats).
  const perf = trpc.performance.myDashboard.useQuery();
  const d = perf.data;
  const monthly = d?.monthlyEarnings ?? [];
  const maxCount = monthly.reduce((m, x) => Math.max(m, x.count), 1);
  const bookingsThisMonth =
    monthly.length > 0 ? monthly[monthly.length - 1]!.count : (d?.totalBookings ?? 0);

  return (
    <ScreenState
      isLoading={perf.isLoading}
      isError={perf.isError}
      isEmpty={false}
      onRetry={() => perf.refetch()}
    >
      <ScrollView style={s.c} contentContainerStyle={s.i}>
        <Text style={s.h}>{t('tech.performance.title')}</Text>
        <Text style={s.sub}>{t('mobile.tech.performance.subtitle')}</Text>
        <View style={s.row}>
          <View style={s.stat}>
            <Text style={s.sv}>{bookingsThisMonth}</Text>
            <Text style={s.sl}>{t('mobile.tech.performance.bookings-this-month')}</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.sv}>{(d?.avgRating ?? 0).toFixed(1)}</Text>
            <Text style={s.sl}>{t('mobile.tech.performance.rating')}</Text>
          </View>
        </View>
        <View style={s.row}>
          <View style={s.stat}>
            <Text style={s.sv}>{(d?.totalEarnings ?? 0).toLocaleString()}</Text>
            <Text style={s.sl}>{t('mobile.tech.performance.revenue-sar')}</Text>
          </View>
          <View style={s.stat}>
            {/* NO API: attendance-rate is not in myDashboard — completionRate used as the closest available metric */}
            <Text style={s.sv}>{d?.completionRate ?? 0}%</Text>
            <Text style={s.sl}>{t('mobile.tech.performance.attendance-rate')}</Text>
          </View>
        </View>
        <View style={s.card}>
          <Text style={s.ct}>{t('mobile.tech.performance.bookings-trend')}</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: 8,
              height: 80,
              marginTop: 12,
            }}
          >
            {monthly.map((m, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: '#8b5cf6',
                  borderRadius: 6,
                  height: `${Math.max(6, Math.round((m.count / maxCount) * 100))}%`,
                  opacity: 0.5 + (monthly.length > 1 ? (i / (monthly.length - 1)) * 0.45 : 0),
                }}
              />
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ fontSize: 10, color: '#9ca3af' }}>
              {monthShort(monthly[0]?.month, locale)}
            </Text>
            <Text style={{ fontSize: 10, color: '#9ca3af' }}>
              {monthShort(monthly[monthly.length - 1]?.month, locale)}
            </Text>
          </View>
        </View>
        {/* NO API: top-services breakdown not available for technicians — only admin analytics expose it */}
        <View style={s.card}>
          <Text style={s.ct}>{t('mobile.tech.performance.top-services')}</Text>
          {[
            { name: 'مكياج', count: 15, emoji: '' },
            { name: 'تسريحة شعر', count: 12, emoji: '' },
            { name: 'مانيكير', count: 8, emoji: '' },
          ].map((sv, i) => (
            <View
              key={i}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}
            >
              <Text>{sv.emoji}</Text>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '600' }}>{sv.name}</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#7c3aed' }}>{sv.count}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenState>
  );
}
const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f9fafb' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center' },
  sv: { fontSize: 28, fontWeight: '800', color: '#7c3aed' },
  sl: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10 },
  ct: { fontSize: 16, fontWeight: '700', color: '#111827' },
});
const s = sc;
