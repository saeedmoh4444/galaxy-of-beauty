import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { formatCurrency } from '@galaxy/ui';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray50: '#faf5ff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
  danger: '#ef4444',
};

interface BalanceData {
  balance?: number;
  bonusBalance?: number;
}

interface TransactionItem {
  id?: number;
  description?: string;
  source?: string;
  amount?: number;
  type?: string;
  createdAt?: string;
}

interface TxnPage {
  items?: TransactionItem[];
}

export default function WalletScreen(): JSX.Element {
  const balance = trpc.wallet.getBalance.useQuery();
  const txns = trpc.wallet.getTransactions.useQuery({ page: 1, limit: 20 });
  const loyalty = trpc.loyalty.myAccount.useQuery();
  const cashback = trpc.cashback.history.useQuery({ page: 1, limit: 20 });

  const balData = balance.data as BalanceData | undefined;
  const txnData = txns.data as TxnPage | undefined;

  return (
    <ScreenState
      isLoading={balance.isLoading}
      isError={balance.isError}
      isEmpty={false}
      errorMessage="فشل تحميل المحفظة"
      onRetry={() => balance.refetch()}
    >
      <Text style={styles.title}>المحفظة</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>الرصيد المتاح</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(Number(balData?.balance ?? 0))}</Text>
        {(balData?.bonusBalance ?? 0) > 0 && (
          <Text style={styles.bonusText}>
            + {formatCurrency(Number(balData?.bonusBalance))} رصيد مكافآت
          </Text>
        )}
        <TouchableOpacity style={styles.topUpBtn}>
          <Text style={styles.topUpText}>شحن رصيد</Text>
        </TouchableOpacity>
      </View>

      {/* Loyalty + Cashback */}
      {(loyalty?.data || cashback?.data) && (
        <View style={styles.rewardsRow}>
          {loyalty?.data && (
            <View style={styles.rewardCard}>
              <View style={styles.rewardIcon}>
                <Text style={styles.rewardIconText}>L</Text>
              </View>
              <Text style={styles.rewardVal}>
                {((loyalty.data as Record<string, unknown>)?.points as number) ?? 0}
              </Text>
              <Text style={styles.rewardLbl}>نقاط ولاء</Text>
            </View>
          )}
          {cashback?.data && (
            <View style={styles.rewardCard}>
              <View style={styles.rewardIcon}>
                <Text style={styles.rewardIconText}>C</Text>
              </View>
              <Text style={styles.rewardVal}>
                {formatCurrency(
                  ((cashback.data as Record<string, unknown>)?.totalCashback as number) ?? 0,
                )}
              </Text>
              <Text style={styles.rewardLbl}>كاش باك</Text>
            </View>
          )}
        </View>
      )}

      <Text style={styles.sectionTitle}>آخر المعاملات</Text>
      {txns.isLoading ? null : txns.isError ? (
        <Text style={styles.errorText}>فشل تحميل المعاملات</Text>
      ) : (txnData?.items ?? []).length === 0 ? (
        <Text style={styles.emptyText}>لا توجد معاملات</Text>
      ) : (
        (txnData?.items ?? []).map((t, i) => (
          <View key={i} style={styles.txnRow}>
            <View>
              <Text style={styles.txnDesc}>{t.description ?? t.source}</Text>
              <Text style={styles.txnDate}>{t.createdAt}</Text>
            </View>
            <Text
              style={[
                styles.txnAmount,
                { color: t.type === 'DEPOSIT' ? COLORS.success : COLORS.danger },
              ]}
            >
              {t.type === 'DEPOSIT' ? '+' : '-'} {formatCurrency(t.amount ?? 0)}
            </Text>
          </View>
        ))
      )}
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.brand,
    textAlign: 'center',
    marginBottom: 20,
  },
  balanceCard: {
    backgroundColor: COLORS.brand,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  balanceAmount: { color: COLORS.white, fontSize: 32, fontWeight: '800', marginTop: 4 },
  bonusText: { color: '#fef3c7', fontSize: 13, marginTop: 4 },
  topUpBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 12,
  },
  topUpText: { color: COLORS.brand, fontWeight: '600' },
  rewardsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  rewardCard: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  rewardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  rewardIconText: { fontSize: 12, fontWeight: '700', color: COLORS.brand },
  rewardVal: { fontSize: 18, fontWeight: '700', color: COLORS.gray900 },
  rewardLbl: { fontSize: 10, color: COLORS.gray400, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.gray900, marginBottom: 10 },
  emptyText: { color: COLORS.gray400, textAlign: 'center', marginTop: 12 },
  errorText: { color: COLORS.danger, textAlign: 'center', marginTop: 12 },
  txnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray50,
  },
  txnDesc: { fontWeight: '600', color: COLORS.gray900, fontSize: 13 },
  txnDate: { fontSize: 10, color: COLORS.gray400, marginTop: 2 },
  txnAmount: { fontWeight: '600', fontSize: 13 },
});
