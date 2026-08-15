import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { LARGE_PAGE_SIZE } from '@galaxy/ui';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

const TIER_COLORS: Record<string, string[]> = {
  SILVER: ['#d1d5db', '#9ca3af'],
  GOLD: ['#fcd34d', '#f59e0b'],
  PLATINUM: ['#c4b5fd', '#7c3aed'],
};

interface LoyaltyAccount {
  points?: number;
  tier?: string;
  tierNameAr?: string;
  multiplier?: number;
}

interface RewardNameJson {
  ar?: string;
}

interface RewardDescriptionJson {
  ar?: string;
}

interface LoyaltyReward {
  id: number;
  rewardType?: string;
  nameJson?: RewardNameJson;
  descriptionJson?: RewardDescriptionJson;
  pointsCost: number;
}

interface LoyaltyTransaction {
  id?: number;
  reason?: string;
  points: number;
}

interface TransactionsResult {
  items?: LoyaltyTransaction[];
}

export default function RewardsMarketplaceScreen(): JSX.Element {
  const accountQ = trpc.loyalty.myAccount.useQuery();
  const rewardsQ = trpc.loyalty.rewards.useQuery();
  const txsQ = trpc.loyalty.myTransactions.useQuery({ page: 1, limit: LARGE_PAGE_SIZE });
  const [redeemed, setRedeemed] = useState<number | null>(null);

  const redeemMut = trpc.loyalty.redeem.useMutation({
    onSuccess: (_d, vars) => {
      setRedeemed(vars.rewardId);
      void accountQ.refetch();
    },
    onError: () => {},
  });
  const handleRedeem = (rid: number) => {
    redeemMut.mutate({ rewardId: rid });
  };

  if (accountQ.isLoading) return <SkeletonList count={4} />;
  if (accountQ.isError)
    return <ErrorAlert message="فشل تحميل المكافآت" onRetry={() => accountQ.refetch()} />;

  const a = accountQ.data as LoyaltyAccount | null;
  const items = (rewardsQ.data as LoyaltyReward[] | undefined) ?? [];
  const transactions = (txsQ.data as TransactionsResult | null)?.items ?? [];
  const points = a?.points ?? 0;
  const tier = a?.tier ?? 'SILVER';
  const tierColors = TIER_COLORS[tier] ?? TIER_COLORS['SILVER']!;

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl
          refreshing={accountQ.isRefetching}
          onRefresh={() => accountQ.refetch()}
          colors={['#db2777']}
        />
      }
    >
      <Text style={s.t}> سوق المكافآت</Text>
      <Text style={s.sub}>استبدلي نقاطكِ بمكافآت حصرية</Text>

      <View style={[s.pointsCard, { backgroundColor: tierColors[0] }]}>
        <Text style={{ color: '#fff', fontSize: 13, opacity: 0.8, textAlign: 'center' }}>
          رصيد نقاطكِ
        </Text>
        <Text
          style={{
            color: '#fff',
            fontSize: 36,
            fontWeight: '800',
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          {points.toLocaleString()}
        </Text>
        <Text
          style={{ color: '#fff', fontSize: 13, opacity: 0.8, textAlign: 'center', marginTop: 4 }}
        >
          {a?.tierNameAr} · مضاعف ×{a?.multiplier}
        </Text>
      </View>

      {items.map((r) => {
        const canAfford = points >= r.pointsCost;
        const isRedeemed = redeemed === r.id;
        return (
          <View
            key={r.id}
            style={[
              s.card,
              isRedeemed
                ? { borderColor: '#10b981', backgroundColor: '#ecfdf5' }
                : canAfford
                  ? {}
                  : { opacity: 0.5 },
            ]}
          >
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 36 }}>
                {r.rewardType === 'free_service'
                  ? '‍️'
                  : r.rewardType === 'discount_percent'
                    ? '️'
                    : ''}
              </Text>
              <Text style={{ fontWeight: '700', fontSize: 16, marginTop: 8 }}>
                {r.nameJson?.ar}
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                {r.descriptionJson?.ar}
              </Text>
              <Text style={{ fontWeight: '800', fontSize: 22, color: '#d97706', marginTop: 8 }}>
                {r.pointsCost} نقطة
              </Text>
            </View>
            {isRedeemed ? (
              <Text
                style={{ color: '#059669', fontWeight: '700', textAlign: 'center', marginTop: 10 }}
              >
                تم الاستبدال
              </Text>
            ) : (
              <TouchableOpacity
                onPress={() => handleRedeem(r.id)}
                style={[s.btn, { marginTop: 12 }, !canAfford && { backgroundColor: '#d1d5db' }]}
                disabled={!canAfford}
              >
                <Text style={s.btnText}>{canAfford ? ' استبدلي' : ' نقاط غير كافية'}</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      {transactions.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: '700', fontSize: 15, color: '#111827', marginBottom: 8 }}>
            سجل النقاط
          </Text>
          {transactions.slice(0, 10).map((t, i) => (
            <View
              key={t.id ?? i}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: '#f3f4f6',
              }}
            >
              <Text style={{ fontSize: 13, color: '#6b7280' }}>{t.reason}</Text>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 13,
                  color: t.points > 0 ? '#059669' : '#ef4444',
                }}
              >
                {t.points > 0 ? '+' : ''}
                {t.points} نقطة
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  pointsCard: { borderRadius: 18, padding: 24, marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 18,
    marginBottom: 12,
  },
  btn: { backgroundColor: '#db2777', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
