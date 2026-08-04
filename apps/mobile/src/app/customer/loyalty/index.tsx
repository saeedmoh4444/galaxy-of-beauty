import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { DEFAULT_PAGE_SIZE } from '@galaxy/ui';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function LoyaltyScreen(): JSX.Element {
  const { data: account, loading: aLoad, error: aErr, refreshing, refetch, refresh } = useQuery(() => trpc.loyalty.myAccount.query());
  const { data: txsData } = useQuery(() => trpc.loyalty.myTransactions.query({ page: 1, limit: DEFAULT_PAGE_SIZE }));
  const { data: rewards } = useQuery(() => trpc.loyalty.rewards.query());

  const loading = aLoad;
  const error = aErr;

  if (loading) return <View style={styles.container}><SkeletonList count={5} /></View>;
  if (error) return <ErrorAlert message="فشل تحميل برنامج الولاء" onRetry={refetch} />;
  if (!account) return <View style={styles.empty}><Text style={styles.emptyText}>لا يوجد حساب ولاء</Text></View>;

  const txs = ((txsData as any)?.items ?? []) as Record<string, unknown>[];
  const tierColor = account.tier === 'PLATINUM' ? '#6366f1' : account.tier === 'GOLD' ? '#f59e0b' : '#9ca3af';
  const tierEmoji = account.tier === 'PLATINUM' ? '🥇' : account.tier === 'GOLD' ? '🥈' : '🥉';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#7c3aed']} />}>
      <View style={[styles.tierCard, { backgroundColor: tierColor }]}>
        <Text style={styles.tierEmoji}>{tierEmoji}</Text>
        <Text style={styles.tierName}>{account.tierNameAr as string}</Text>
        <Text style={styles.points}>{account.points as number} نقطة</Text>
      </View>
      <Text style={styles.sectionTitle}>سجل العمليات</Text>
      {txs.length === 0 ? <Text style={styles.emptyText}>لا توجد عمليات بعد</Text> :
        txs.slice(0, 10).map((tx, i) => (
          <View key={i} style={styles.txRow}>
            <View>
              <Text style={styles.txDesc}>{tx.description as string}</Text>
              <Text style={styles.txDate}>{new Date(tx.createdAt as string).toLocaleDateString('ar-SA')}</Text>
            </View>
            <Text style={[styles.txPoints, { color: (tx.points as number) > 0 ? '#16a34a' : '#dc2626' }]}>
              {(tx.points as number) > 0 ? '+' : ''}{tx.points as number}
            </Text>
          </View>
        ))}
      {(rewards as any[])?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>المكافآت</Text>
          {(rewards as any[]).map((r: any) => (
            <View key={r.id} style={styles.rewardCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rewardName}>{((r.nameJson as Record<string, string>)?.ar) || ''}</Text>
                <Text style={styles.rewardCost}>{r.pointsCost as number} نقطة</Text>
              </View>
              <TouchableOpacity
                style={[styles.redeemBtn, (account.points as number) < (r.pointsCost as number) && styles.redeemDisabled]}
                disabled={(account.points as number) < (r.pointsCost as number)}
              >
                <Text style={styles.redeemText}>استبدال</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 16, paddingBottom: 40 },
  tierCard: { borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24 },
  tierEmoji: { fontSize: 40, marginBottom: 8 },
  tierName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  points: { fontSize: 32, fontWeight: '800', color: '#fff', marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 12, marginTop: 8 },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  txDesc: { fontSize: 14, color: '#374151', textAlign: 'right' },
  txDate: { fontSize: 11, color: '#9ca3af', marginTop: 2, textAlign: 'right' },
  txPoints: { fontSize: 15, fontWeight: '700' },
  rewardCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, marginBottom: 8 },
  rewardName: { fontSize: 14, fontWeight: '600', color: '#111827', textAlign: 'right' },
  rewardCost: { fontSize: 13, color: '#7c3aed', marginTop: 2, textAlign: 'right' },
  redeemBtn: { backgroundColor: '#7c3aed', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  redeemDisabled: { backgroundColor: '#d1d5db' },
  redeemText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
});
