import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { DEFAULT_PAGE_SIZE } from '@galaxy/ui';

const TIERS: Record<string, { emoji: string; label: string }> = {
  SILVER: { emoji: '', label: 'فضية' },
  GOLD: { emoji: '', label: 'ذهبية' },
  PLATINUM: { emoji: '', label: 'بلاتينية' },
};

interface LoyaltyAccount {
  tier?: string;
  points?: number;
  lifetimePoints?: number;
}

interface LoyaltyTxn {
  reason?: string;
  points?: number;
  createdAt?: string;
}

export default function LoyaltyScreen(): JSX.Element {
  const account = trpc.loyalty.myAccount.useQuery();
  const txs = trpc.loyalty.myTransactions.useQuery({ page: 1, limit: DEFAULT_PAGE_SIZE });

  const acc = account.data as unknown as LoyaltyAccount | undefined;

  return (
    <ScreenState
      isLoading={account.isLoading}
      isError={account.isError}
      isEmpty={!acc}
      errorMessage="فشل تحميل حساب الولاء"
      onRetry={() => account.refetch()}
    >
      <Text style={styles.title}> الولاء</Text>

      {/* Tier Card */}
      <View style={styles.tierCard}>
        <Text style={styles.tierEmoji}>
          {TIERS[acc?.tier ?? 'SILVER']?.emoji ?? ''}
        </Text>
        <Text style={styles.tierLabel}>
          {TIERS[acc?.tier ?? 'SILVER']?.label ?? 'فضية'}
        </Text>
        <Text style={styles.points}>{acc?.points ?? 0} نقطة</Text>
        <Text style={styles.lifetime}>إجمالي: {acc?.lifetimePoints ?? 0} نقطة</Text>
      </View>

      {/* Recent Transactions */}
      <Text style={styles.sectionTitle}>آخر العمليات</Text>
      {txs.isLoading ? null : (
        <FlatList
          data={((txs.data as unknown as { items?: LoyaltyTxn[] } | null)?.items) ?? []}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <View style={styles.txnRow}>
              <View>
                <Text style={styles.txnReason}>{item.reason ?? 'عملية'}</Text>
                <Text style={styles.txnDate}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ar-SA') : ''}
                </Text>
              </View>
              <Text style={[styles.txnPoints, { color: (item.points ?? 0) > 0 ? '#10b981' : '#dc2626' }]}>
                {(item.points ?? 0) > 0 ? '+' : ''}
                {item.points ?? 0}
              </Text>
            </View>
          )}
        />
      )}
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#7c3aed',
    textAlign: 'center',
    marginBottom: 20,
  },
  tierCard: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  tierEmoji: { fontSize: 48, marginBottom: 8 },
  tierLabel: { fontSize: 20, fontWeight: '800', color: '#ffffff' },
  points: { fontSize: 28, fontWeight: '800', color: '#ffffff', marginTop: 8 },
  lifetime: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  txnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  txnReason: { fontSize: 13, fontWeight: '600', color: '#111827' },
  txnDate: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  txnPoints: { fontSize: 14, fontWeight: '700' },
});
