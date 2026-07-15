import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function LoyaltyScreen() {
  const [account, setAccount] = useState<Record<string, unknown> | null>(null);
  const [txs, setTxs] = useState<Record<string, unknown>[]>([]);
  const [rewards, setRewards] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (trpc.loyalty.myAccount.query() as any as Promise<Record<string, unknown>>),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (trpc.loyalty.myTransactions.query({ page: 1, limit: 10 }) as any as Promise<Record<string, unknown>>),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (trpc.loyalty.rewards.query() as any as Promise<Record<string, unknown>[]>),
    ]).then(([a, t, r]) => {
      setAccount(a);
      setTxs((t?.items as Record<string, unknown>[]) || []);
      setRewards(r || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;
  if (!account) return <View style={styles.empty}><Text style={styles.emptyText}>لا يوجد حساب ولاء</Text></View>;

  const tierColor = account.tier === 'PLATINUM' ? '#6366f1' : account.tier === 'GOLD' ? '#f59e0b' : '#9ca3af';
  const tierEmoji = account.tier === 'PLATINUM' ? '🥇' : account.tier === 'GOLD' ? '🥈' : '🥉';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      {/* Tier Card */}
      <View style={[styles.tierCard, { backgroundColor: tierColor }]}>
        <Text style={styles.tierEmoji}>{tierEmoji}</Text>
        <Text style={styles.tierName}>{account.tierNameAr as string}</Text>
        <Text style={styles.points}>{account.points as number} نقطة</Text>
      </View>

      {/* Transactions */}
      <Text style={styles.sectionTitle}>سجل العمليات</Text>
      {txs.length === 0 ? (
        <Text style={styles.emptyText}>لا توجد عمليات بعد</Text>
      ) : (
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
        ))
      )}

      {/* Rewards */}
      {rewards.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>المكافآت</Text>
          {rewards.map((r) => (
            <View key={r.id as number} style={styles.rewardCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rewardName}>{((r.nameJson as Record<string, string>)?.ar) || ''}</Text>
                <Text style={styles.rewardCost}>{r.pointsCost as number} نقطة</Text>
              </View>
              <TouchableOpacity
                style={[styles.redeemBtn, (account.points as number) < (r.pointsCost as number) && styles.redeemDisabled]}
                disabled={(account.points as number) < (r.pointsCost as number)}
                activeOpacity={0.8}
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
