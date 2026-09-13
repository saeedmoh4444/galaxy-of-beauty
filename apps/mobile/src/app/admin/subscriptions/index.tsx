import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

interface SubscriptionPlan {
  id?: number;
  nameJson?: Record<string, string>;
  feature?: string;
  monthlyLimit?: number;
  priceMonthly?: number;
}

export default function AdminSubscriptionsScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const q = trpc.subscriptions.getPlans.useQuery();
  const plans = (q.data as unknown as SubscriptionPlan[] | null) ?? [];

  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('mobile.admin.subscriptions.title')}</Text>
      <Text style={s.sub}>{t('mobile.admin.subscriptions.subtitle')}</Text>
      <ScreenState
        isLoading={q.isLoading}
        isError={q.isError}
        isEmpty={plans.length === 0}
        emptyTitle={t('admin.subscriptions.empty')}
        onRetry={() => q.refetch()}
      >
        {plans.map((p) => (
          <View key={p.id} style={s.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.cn}>{localize(p.nameJson, locale)}</Text>
                <Text style={s.cp}>
                  {p.feature} ·{' '}
                  {t('admin.subscriptions.monthly-limit', { count: p.monthlyLimit ?? 0 })}
                </Text>
              </View>
              <Text style={[s.b, { color: '#059669' }]}>
                {p.priceMonthly && p.priceMonthly > 0
                  ? t('mobile.admin.subscriptions.price-month', { price: p.priceMonthly })
                  : t('mobile.admin.subscriptions.free')}
              </Text>
            </View>
          </View>
        ))}
      </ScreenState>
    </ScrollView>
  );
}
const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f9fafb' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10 },
  cn: { fontSize: 15, fontWeight: '700', color: '#111827' },
  cp: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  b: { fontSize: 16, fontWeight: '800' },
});
const s = sc;
