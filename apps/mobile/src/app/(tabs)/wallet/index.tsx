import { useHaptics } from '@/hooks/useHaptics';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { formatCurrency } from '@galaxy/ui';

const COLORS = {
  brand: '#7c3aed', white: '#ffffff', gray50: '#faf5ff', gray400: '#6b7280', gray900: '#111827',
  success: '#10b981', danger: '#ef4444',
};

export default function WalletScreen(): JSX.Element {
  const balance = trpc.wallet.getBalance.useQuery();
  const txns = trpc.wallet.getTransactions.useQuery({ page: 1, limit: 20 });
  const loyalty = (trpc as any).loyalty?.getAccount?.useQuery?.();
  const cashback = (trpc as any).cashback?.summary?.useQuery?.();

  return (
    <ScreenState
      isLoading={balance.isLoading}
      isError={balance.isError}
      isEmpty={false}
      errorMessage="فشل تحميل المحفظة"
      onRetry={() => balance.refetch()}
    >
      <Text style={styles.title}>💰 المحفظة</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>الرصيد المتاح</Text>
        <Text style={styles.balanceAmount}>
          {formatCurrency(Number((balance.data as any)?.balance ?? 0))}
        </Text>
        {(balance.data as any)?.bonusBalance > 0 && (
          <Text style={styles.bonusText}>
            + {formatCurrency(Number((balance.data as any)?.bonusBalance))} رصيد مكافآت
          </Text>
        )}
        <TouchableOpacity style={styles.topUpBtn}>
          <Text style={styles.topUpText}>➕ شحن رصيد</Text>
        </TouchableOpacity>
      </View>

      {/* Loyalty + Cashback */}
      {(loyalty?.data || cashback?.data) && (
        <View style={styles.rewardsRow}>
          {loyalty?.data && (
            <View style={styles.rewardCard}>
              <Text style={styles.rewardEmoji}>⭐</Text>
              <Text style={styles.rewardVal}>{loyalty.data.points ?? 0}</Text>
              <Text style={styles.rewardLbl}>نقاط ولاء</Text>
            </View>
          )}
          {cashback?.data && (
            <View style={styles.rewardCard}>
              <Text style={styles.rewardEmoji}>💰</Text>
              <Text style={styles.rewardVal}>{formatCurrency(cashback.data.totalCashback ?? 0)}</Text>
              <Text style={styles.rewardLbl}>كاش باك</Text>
            </View>
          )}
        </View>
      )}

      <Text style={styles.sectionTitle}>آخر المعاملات</Text>
      {txns.isLoading ? null : txns.isError ? (
        <Text style={styles.errorText}>فشل تحميل المعاملات</Text>
      ) : ((txns.data as any)?.items as any[] || []).length === 0 ? (
        <Text style={styles.emptyText}>لا توجد معاملات</Text>
      ) : (
        ((txns.data as any)?.items as any[] || []).map((t: any, i: number) => (
          <View key={i} style={styles.txnRow}>
            <View>
              <Text style={styles.txnDesc}>{t.description ?? t.source}</Text>
              <Text style={styles.txnDate}>{new Date(t.createdAt).toLocaleDateString('ar-SA')}</Text>
            </View>
            <Text style={[styles.txnAmount, { color: t.type === 'CREDIT' ? COLORS.success : COLORS.danger }]}>
              {t.type === 'CREDIT' ? '+' : '-'}{formatCurrency(Number(t.amount))}
            </Text>
          </View>
        ))
      )}
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: COLORS.brand, textAlign: 'center', marginBottom: 20 },
  balanceCard: { backgroundColor: COLORS.brand, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24 },
  balanceLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  balanceAmount: { fontSize: 32, fontWeight: '800', color: COLORS.white },
  bonusText: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  topUpBtn: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  topUpText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.gray900, marginBottom: 12 },
  txnRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  txnDesc: { fontSize: 13, fontWeight: '600', color: COLORS.gray900 },
  txnDate: { fontSize: 11, color: COLORS.gray400, marginTop: 2 },
  txnAmount: { fontSize: 14, fontWeight: '700' },
  errorText: { fontSize: 13, color: COLORS.danger, textAlign: 'center', marginTop: 8 },
  emptyText: { fontSize: 13, color: COLORS.gray400, textAlign: 'center', marginTop: 8 },
  rewardsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  rewardCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: 12, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  rewardEmoji: { fontSize: 20, marginBottom: 4 },
  rewardVal: { fontSize: 18, fontWeight: '700', color: COLORS.gray900 },
  rewardLbl: { fontSize: 11, color: COLORS.gray400, marginTop: 2 },
});
