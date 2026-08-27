import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

interface LoyaltyReward {
  id?: number;
  nameJson?: Record<string, string>;
  descriptionJson?: Record<string, string>;
  pointsCost?: number;
  minTier?: string;
  isActive?: boolean;
}

const TIER_COLORS: Record<string, string> = {
  SILVER: '#9ca3af',
  GOLD: '#f59e0b',
  PLATINUM: '#7c3aed',
};

export default function AdminLoyaltyScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const q = trpc.loyalty.listRewards.useQuery();
  const rewards = (q.data as unknown as LoyaltyReward[] | null) ?? [];

  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('mobile.admin.loyalty.title')}</Text>
      <Text style={s.sub}>{t('mobile.admin.loyalty.subtitle')}</Text>
      <ScreenState
        isLoading={q.isLoading}
        isError={q.isError}
        isEmpty={rewards.length === 0}
        emptyTitle={t('admin.loyalty.no-rewards')}
        onRetry={() => q.refetch()}
      >
        {rewards.map((r) => (
          <View
            key={r.id}
            style={[
              s.card,
              { borderLeftColor: TIER_COLORS[r.minTier ?? ''] ?? '#9ca3af', borderLeftWidth: 4 },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.cn}>{localize(r.nameJson, locale)}</Text>
                <Text style={s.cd}>{localize(r.descriptionJson, locale)}</Text>
              </View>
              <Text style={s.cm}>
                {t('admin.loyalty.points-cost', { points: r.pointsCost ?? 0 })}
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
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10 },
  cn: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cd: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  cm: { fontSize: 14, fontWeight: '700', color: '#6b7280' },
});
const s = sc;
