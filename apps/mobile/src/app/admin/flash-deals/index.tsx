import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface FlashDeal {
  id?: number;
  serviceNameAr?: string;
  serviceNameEn?: string;
  titleAr?: string | null;
  discountPercent?: number;
  originalPrice?: number;
  dealPrice?: number;
  currentRedemptions?: number;
  maxRedemptions?: number;
  endsAt?: string;
}

export default function AdminFlashDealsScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const q = trpc.flashDeals.active.useQuery();
  const deals = (q.data as unknown as FlashDeal[] | null) ?? [];

  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('mobile.admin.flash-deals.title')}</Text>
      <Text style={s.sub}>{t('mobile.admin.flash-deals.subtitle')}</Text>
      <ScreenState
        isLoading={q.isLoading}
        isError={q.isError}
        isEmpty={deals.length === 0}
        emptyTitle={t('admin.flash-deals.no-active')}
        onRetry={() => q.refetch()}
      >
        {deals.map((d) => {
          const sold = d.currentRedemptions ?? 0;
          const max = d.maxRedemptions ?? 0;
          const pct = max > 0 ? (sold / max) * 100 : 0;
          const hoursLeft = d.endsAt
            ? Math.max(0, Math.ceil((new Date(d.endsAt).getTime() - Date.now()) / 3600000))
            : 0;
          const endsIn =
            hoursLeft < 1
              ? locale === 'ar'
                ? 'أقل من ساعة'
                : '< 1h'
              : locale === 'ar'
                ? `${hoursLeft} ساعة`
                : `${hoursLeft}h`;
          const name = locale === 'ar' ? d.serviceNameAr : d.serviceNameEn || d.serviceNameAr;
          return (
            <View key={d.id} style={s.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cn}>{name ?? d.titleAr ?? ''}</Text>
                  <View
                    style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 2 }}
                  >
                    <Text style={s.cp}>
                      {Number(d.dealPrice ?? 0).toLocaleString()} {t('misc.sar')}
                    </Text>
                    <Text style={s.co}>
                      {Number(d.originalPrice ?? 0).toLocaleString()} {t('misc.sar')}
                    </Text>
                    <View style={s.db}>
                      <Text style={s.dt}>-{d.discountPercent ?? 0}%</Text>
                    </View>
                  </View>
                </View>
                <View style={s.pb}>
                  <View style={[s.pf, { width: `${pct}%` }]} />
                </View>
                <Text style={s.ps}>
                  {t('mobile.admin.flash-deals.sold', { sold, max, endsIn })}
                </Text>
              </View>
            </View>
          );
        })}
      </ScreenState>
      <TouchableOpacity style={s.btn}>
        <Text style={s.bt}>{t('mobile.admin.flash-deals.new-deal')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12 },
  cn: { fontSize: 15, fontWeight: '700', color: '#111827' },
  cp: { fontSize: 18, fontWeight: '800', color: '#ef4444' },
  co: { fontSize: 13, color: '#9ca3af', textDecorationLine: 'line-through' },
  db: { backgroundColor: '#fee2e2', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  dt: { fontSize: 12, fontWeight: '700', color: '#dc2626' },
  pb: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, marginTop: 10, overflow: 'hidden' },
  pf: { height: 8, backgroundColor: '#f59e0b', borderRadius: 4 },
  ps: { fontSize: 11, color: '#6b7280', marginTop: 6 },
  btn: {
    backgroundColor: '#f59e0b',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
const s = sc;
