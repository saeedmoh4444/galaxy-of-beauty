import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface Promo {
  id?: number;
  code?: string;
  discountType?: string;
  discountValue?: number;
  maxUses?: number | null;
  currentUses?: number;
  validUntil?: string | null;
  isActive?: boolean;
  usages?: Array<Record<string, unknown>>;
}

export default function AdminPromoScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const q = trpc.promo.list.useQuery();
  const promos = (q.data as unknown as Promo[] | null) ?? [];

  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('mobile.admin.promo.title')}</Text>
      <Text style={s.sub}>{t('mobile.admin.promo.subtitle')}</Text>
      <ScreenState
        isLoading={q.isLoading}
        isError={q.isError}
        isEmpty={promos.length === 0}
        emptyTitle={t('admin.promo.empty')}
        onRetry={() => q.refetch()}
      >
        {promos.map((p) => {
          const used = p.usages?.length ?? p.currentUses ?? 0;
          const max = p.maxUses ?? 0;
          const pct = max > 0 ? (used / max) * 100 : 0;
          return (
            <View key={p.id} style={[s.card, { opacity: p.isActive ? 1 : 0.6 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cc}>{p.code}</Text>
                  <Text style={s.cd}>
                    {p.discountType === 'percent'
                      ? t('mobile.admin.promo.discount-percent', {
                          discount: Number(p.discountValue ?? 0).toLocaleString(),
                        })
                      : t('mobile.admin.promo.discount-fixed', {
                          discount: Number(p.discountValue ?? 0).toLocaleString(),
                        })}
                    {' · '}
                    {p.validUntil
                      ? new Date(p.validUntil).toLocaleDateString(
                          locale === 'ar' ? 'ar-SA' : 'en-GB',
                        )
                      : '—'}
                  </Text>
                </View>
                <View style={[s.b, { backgroundColor: p.isActive ? '#d1fae5' : '#fee2e2' }]}>
                  <Text style={[s.bt, { color: p.isActive ? '#059669' : '#dc2626' }]}>
                    {p.isActive ? t('admin.enabled') : t('admin.promo.expired')}
                  </Text>
                </View>
              </View>
              <View style={s.pb}>
                <View style={[s.pf, { width: `${pct}%` }]} />
              </View>
              <Text style={s.pu}>{t('mobile.admin.promo.uses', { used, max })}</Text>
            </View>
          );
        })}
      </ScreenState>
      <TouchableOpacity style={s.btn}>
        <Text style={s.btnText}>{t('mobile.admin.promo.add-code')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f9fafb' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10 },
  cc: { fontSize: 18, fontWeight: '800', color: '#111827', fontFamily: 'monospace' },
  cd: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  b: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  bt: { fontSize: 11, fontWeight: '700' },
  pb: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, marginTop: 10, overflow: 'hidden' },
  pf: { height: 8, backgroundColor: '#8b5cf6', borderRadius: 4 },
  pu: { fontSize: 11, color: '#6b7280', marginTop: 6 },
  btn: {
    backgroundColor: '#8b5cf6',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
const s = sc;
