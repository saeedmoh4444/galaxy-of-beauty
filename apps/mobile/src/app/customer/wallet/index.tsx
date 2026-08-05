import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { formatCurrency } from '@galaxy/ui';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827', success: '#10b981', danger: '#dc2626' };

export default function WalletScreen(): JSX.Element {
  const router = useRouter();
  const balance = trpc.wallet.getBalance.useQuery();
  const txns = trpc.wallet.getTransactions.useQuery({ page: 1, limit: 20 });

  return (
    <ScreenState isLoading={balance.isLoading} isError={balance.isError} isEmpty={!balance.data} errorMessage="فشل تحميل المحفظة" onRetry={() => balance.refetch()}>
      <Text style={styles.title}>💰 المحفظة</Text>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>الرصيد المتاح</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(Number((balance.data as any)?.balance ?? 0))}</Text>
        {(balance.data as any)?.bonusBalance > 0 ? <Text style={styles.bonusText}>+ {formatCurrency(Number((balance.data as any)?.bonusBalance))} مكافآت</Text> : null}
        <TouchableOpacity style={styles.topUpBtn} onPress={() => router.push('/customer/wallet/top-up' as any)}>
          <Text style={styles.topUpText}>➕ شحن رصيد</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>آخر المعاملات</Text>
      {(txns.data as any)?.items?.map((t: any, i: number) => (
        <View key={i} style={styles.txnRow}>
          <View><Text style={styles.txnDesc}>{t.description ?? t.source}</Text><Text style={styles.txnDate}>{new Date(t.createdAt).toLocaleDateString('ar-SA')}</Text></View>
          <Text style={[styles.txnAmount, { color: t.type === 'CREDIT' ? COLORS.success : COLORS.danger }]}>{t.type === 'CREDIT' ? '+' : '-'}{formatCurrency(Number(t.amount))}</Text>
        </View>
      ))}
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
});
