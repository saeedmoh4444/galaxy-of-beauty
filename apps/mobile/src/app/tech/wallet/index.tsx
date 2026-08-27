import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
export default function TechWalletScreen(): JSX.Element {
  const { locale, t } = useLocale();
  // Mirrors the web page: wallet.getBalance + wallet.getTransactions.
  // Pending settlement comes from payouts.listMyPayouts (PENDING) and the
  // this-month/completed-bookings stats from performance.myDashboard.
  const balance = trpc.wallet.getBalance.useQuery();
  const txns = trpc.wallet.getTransactions.useQuery({ page: 1, limit: 30 });
  const pendingPayouts = trpc.payouts.listMyPayouts.useQuery({
    status: 'PENDING',
    page: 1,
    limit: 50,
  });
  const perf = trpc.performance.myDashboard.useQuery();

  const currentBalance = Number(balance.data?.balance ?? 0);
  const pending = (pendingPayouts.data?.payouts ?? []).reduce((s, p) => s + Number(p.amount), 0);
  const monthly = perf.data?.monthlyEarnings ?? [];
  const thisMonth = monthly.length > 0 ? monthly[monthly.length - 1]!.total : 0;
  const completed = perf.data?.completedBookings ?? 0;
  const transactions = txns.data?.transactions ?? [];

  return (
    <ScreenState
      isLoading={balance.isLoading || txns.isLoading || pendingPayouts.isLoading || perf.isLoading}
      isError={balance.isError || txns.isError || pendingPayouts.isError || perf.isError}
      isEmpty={false}
      errorMessage={t('wallet.load-error')}
      onRetry={() => {
        balance.refetch();
        txns.refetch();
        pendingPayouts.refetch();
        perf.refetch();
      }}
    >
      <ScrollView style={s.c} contentContainerStyle={s.i}>
        <Text style={s.h}>{t('mobile.tech.wallet.title')}</Text>
        <View style={s.bc}>
          <Text style={s.bl}>{t('mobile.tech.wallet.current-balance')}</Text>
          <Text style={s.bv}>
            {currentBalance.toLocaleString()} {t('misc.sar')}
          </Text>
          <Text style={s.bp}>
            {t('mobile.tech.wallet.pending-settlement', { amount: pending.toLocaleString() })}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <View style={[s.stat, { backgroundColor: '#d1fae5' }]}>
            <Text style={[s.sv, { color: '#059669' }]}>{thisMonth.toLocaleString()}</Text>
            <Text style={s.sl}>{t('mobile.tech.wallet.current-month')}</Text>
          </View>
          <View style={[s.stat, { backgroundColor: '#dbeafe' }]}>
            <Text style={[s.sv, { color: '#2563eb' }]}>{completed}</Text>
            <Text style={s.sl}>{t('mobile.tech.wallet.completed-bookings')}</Text>
          </View>
        </View>
        {transactions.length > 0 && (
          <>
            <Text style={s.ct}>{t('mobile.tech.wallet.recent-transactions')}</Text>
            {transactions.map((tx) => (
              <View key={tx.id} style={s.card}>
                <Text style={s.ce}></Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.cn}>{tx.description ?? tx.source}</Text>
                  <Text style={s.cd}>
                    {new Date(tx.createdAt).toLocaleDateString(
                      locale === 'en' ? 'en-GB' : 'ar-SA',
                      { day: 'numeric', month: 'short' },
                    )}
                  </Text>
                </View>
                <Text style={[s.ca, { color: tx.type === 'DEBIT' ? '#dc2626' : '#059669' }]}>
                  {tx.type === 'DEBIT' ? '-' : '+'}
                  {Number(tx.amount).toLocaleString()} {t('misc.sar')}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </ScreenState>
  );
}
const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f9fafb' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 16 },
  bc: {
    backgroundColor: '#7c3aed',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  bl: { fontSize: 14, color: '#ddd6fe' },
  bv: { fontSize: 40, fontWeight: '800', color: '#fff', marginTop: 4 },
  bp: { fontSize: 13, color: '#c4b5fd', marginTop: 8 },
  stat: { flex: 1, borderRadius: 14, padding: 16, alignItems: 'center' },
  sv: { fontSize: 24, fontWeight: '800' },
  sl: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  ct: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  ce: { fontSize: 22 },
  cn: { fontSize: 13, fontWeight: '600', color: '#111827' },
  cd: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  ca: { fontSize: 15, fontWeight: '700' },
});
const s = sc;
