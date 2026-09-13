import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useAuthState } from '@/hooks/useAuthState';
import { formatCurrency } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import { useTheme, themeColors } from '@/components/ThemeProvider';

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
  const { t } = useLocale();
  const { isDark } = useTheme();
  const c = isDark ? themeColors.dark : themeColors.light;
  const styles = makeStyles(c);
  // Guests see the empty/CTA state instead of firing 401s.
  const isAuthed = useAuthState();
  const balance = trpc.wallet.getBalance.useQuery(undefined, { enabled: isAuthed });
  const txns = trpc.wallet.getTransactions.useQuery({ page: 1, limit: 20 }, { enabled: isAuthed });
  const loyalty = trpc.loyalty.myAccount.useQuery(undefined, { enabled: isAuthed });
  const cashback = trpc.cashback.history.useQuery({ page: 1, limit: 20 }, { enabled: isAuthed });

  const balData = balance.data as BalanceData | undefined;
  const txnData = txns.data as TxnPage | undefined;

  return (
    <ScreenState
      isLoading={balance.isLoading}
      isError={balance.isError}
      isEmpty={false}
      errorMessage={t('wallet.load-error')}
      onRetry={() => balance.refetch()}
    >
      <Text style={styles.title}>{t('nav.wallet')}</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>{t('mobile.core.availableBalance')}</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(Number(balData?.balance ?? 0))}</Text>
        {(balData?.bonusBalance ?? 0) > 0 && (
          <Text style={styles.bonusText}>
            {t('mobile.core.bonusAmount', {
              amount: formatCurrency(Number(balData?.bonusBalance)),
            })}
          </Text>
        )}
        <TouchableOpacity style={styles.topUpBtn}>
          <Text style={styles.topUpText}>{t('mobile.core.topUp')}</Text>
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
              <Text style={styles.rewardLbl}>{t('mobile.core.loyaltyPoints')}</Text>
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
              <Text style={styles.rewardLbl}>{t('mobile.core.cashbackLabel')}</Text>
            </View>
          )}
        </View>
      )}

      <Text style={styles.sectionTitle}>{t('mobile.core.recentTransactions')}</Text>
      {txns.isLoading ? (
        <SkeletonList count={3} />
      ) : txns.isError ? (
        <Text style={styles.errorText}>{t('wallet.transactions-error')}</Text>
      ) : (txnData?.items ?? []).length === 0 ? (
        <Text style={styles.emptyText}>{t('wallet.no-transactions')}</Text>
      ) : (
        (txnData?.items ?? []).map((t, i) => (
          <View key={i} style={styles.txnRow}>
            <View>
              <Text style={styles.txnDesc}>{t.description ?? t.source}</Text>
              <Text style={styles.txnDate}>{t.createdAt}</Text>
            </View>
            <Text
              style={[styles.txnAmount, { color: t.type === 'DEPOSIT' ? c.success : c.danger }]}
            >
              {t.type === 'DEPOSIT' ? '+' : '-'} {formatCurrency(t.amount ?? 0)}
            </Text>
          </View>
        ))
      )}
    </ScreenState>
  );
}

const makeStyles = (c: typeof themeColors.light | typeof themeColors.dark) =>
  StyleSheet.create({
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: c.brand,
      textAlign: 'center',
      marginBottom: 20,
    },
    balanceCard: {
      backgroundColor: c.brand,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      marginBottom: 16,
    },
    balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
    balanceAmount: { color: '#ffffff', fontSize: 32, fontWeight: '800', marginTop: 4 },
    bonusText: { color: '#fef3c7', fontSize: 13, marginTop: 4 },
    topUpBtn: {
      backgroundColor: '#ffffff',
      borderRadius: 10,
      paddingHorizontal: 24,
      paddingVertical: 10,
      marginTop: 12,
    },
    topUpText: { color: c.brand, fontWeight: '600' },
    rewardsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    rewardCard: {
      flex: 1,
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
    },
    rewardIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    rewardIconText: { fontSize: 12, fontWeight: '700', color: c.brand },
    rewardVal: { fontSize: 18, fontWeight: '700', color: c.text },
    rewardLbl: { fontSize: 10, color: c.textSecondary, marginTop: 2 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 10 },
    emptyText: { color: c.textSecondary, textAlign: 'center', marginTop: 12 },
    errorText: { color: c.danger, textAlign: 'center', marginTop: 12 },
    txnRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    txnDesc: { fontWeight: '600', color: c.text, fontSize: 13 },
    txnDate: { fontSize: 10, color: c.textSecondary, marginTop: 2 },
    txnAmount: { fontWeight: '600', fontSize: 13 },
  });
